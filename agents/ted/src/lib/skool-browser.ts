// Playwright wrapper for Skool. Logs in once per process, posts, replies, scrapes.
//
// Skool uses styled-components with per-build hash-suffixed class names, so most
// selectors here target either:
//   - user-visible text (e.g. `text=Write something`)
//   - stable partial class fragments (e.g. `[class*="PostItemCardContent"]`)
//   - structural attributes (e.g. `a[href^="/@"]` for author links)
//
// The selectors have been verified against the live UI at www.skool.com/roadman
// via agents/ted/scripts/skool-selector-probe.ts. If Skool ships a rebrand, run
// that probe again and patch SELECTORS here.
//
// The --dry-run flag goes through every step except the final "Post" button
// click so you can validate login + navigation + fill without writing.

import fs from "fs";
import path from "path";
import type { Browser, BrowserContext, Page } from "playwright";
import { ACTION_JITTER_MS } from "../config.js";

export interface SkoolBrowserOpts {
  email: string;
  password: string;
  communitySlug: string; // e.g. "roadman"
  headless?: boolean;
  screenshotDir?: string;
  dryRun?: boolean;
}

// Skool UI selectors $€” each field is a comma-separated list of alternates;
// Playwright tries the whole list and takes the first match.
const SELECTORS = {
  loginEmail: [
    'input[type="email"]',
    'input[name="email"]',
    'input[autocomplete="email"]',
  ],
  loginPassword: [
    'input[type="password"]',
    'input[name="password"]',
    'input[autocomplete="current-password"]',
  ],
  loginSubmit: [
    'button[type="submit"]',
    'button:has-text("LOG IN")',
    'button:has-text("Log in")',
  ],
  // "Write something" is a text-label inside a clickable styled <div>, not a
  // <button>. Skool's styled-components class hashes change per build, so we
  // target text.
  composePostButton: [
    'text=Write something',
    '[class*="CardWrapper"]:has-text("Write something")',
    '[class*="PostComposerButton"]',
  ],
  composeTitleInput: [
    'input[placeholder*="Title" i]',
  ],
  composeBody: [
    'div[contenteditable="true"]',
    'div[role="textbox"]',
    '[class*="ql-editor"]',
  ],
  composeCategoryDropdown: [
    'button[aria-haspopup]',
    '[class*="CategoryPicker"]',
    '[class*="CategorySelector"]',
  ],
  composeSubmit: [
    'button:has-text("POST")',
    'button:has-text("Post")',
    'button:has-text("Publish")',
  ],
  // Each post in the feed $€” styled-components fragment is stable enough across
  // builds to serve as an anchor; falls back to the href pattern.
  threadCard: [
    '[class*="PostItemCardContent"]',
  ],
  threadTitle: [
    '[class*="styled__Title-sc-vh0utx"]',
    '[class*="TitleWrapper"]',
  ],
  threadBodyPreview: [
    '[class*="ContentPreview"]',
  ],
  threadAuthor: [
    'a[href^="/@"]',
  ],
  threadLink: [
    'a[href^="/roadman/"][class*="ChildrenLink"]',
  ],
  replyField: [
    'div[contenteditable="true"][data-placeholder*="reply" i]',
    'div[contenteditable="true"][aria-label*="reply" i]',
    'div[contenteditable="true"]',
  ],
  replySubmit: [
    'button:has-text("REPLY")',
    'button:has-text("Reply")',
  ],
};

function sel(list: string[]): string {
  return list.join(", ");
}

/** Split Ted's generated body into a title (first non-empty line) and body (rest). */
export function splitTitleAndBody(text: string): { title: string; body: string } {
  const trimmed = text.trim();
  const lines = trimmed.split(/\n/);
  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty === -1) return { title: "", body: "" };
  const title = lines[firstNonEmpty].trim().replace(/[.!?]+$/, "");
  const rest = lines.slice(firstNonEmpty + 1).join("\n").trim();
  return { title: title.slice(0, 200), body: rest.length > 0 ? rest : trimmed };
}

export class SkoolBrowser {
  private opts: SkoolBrowserOpts;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private loggedIn = false;

  constructor(opts: SkoolBrowserOpts) {
    this.opts = opts;
    if (opts.screenshotDir) {
      fs.mkdirSync(opts.screenshotDir, { recursive: true });
    }
  }

  async open(): Promise<void> {
    const { chromium } = await import("playwright");
    this.browser = await chromium.launch({
      headless: this.opts.headless ?? true,
      args: [
        // Matches what real Chrome looks like to Skool's bot checks. Verified.
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
      ],
    });
    this.context = await this.browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 900 },
      locale: "en-GB",
      timezoneId: "Europe/Dublin",
      extraHTTPHeaders: { "Accept-Language": "en-GB,en;q=0.9" },
    });
    // Skool's login endpoint refuses the request when navigator.webdriver is
    // set. Hide it before any page scripts run.
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });
    this.page = await this.context.newPage();
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.browser = null;
    this.context = null;
    this.page = null;
    this.loggedIn = false;
  }

  private requirePage(): Page {
    if (!this.page) throw new Error("SkoolBrowser: open() not called");
    return this.page;
  }

  private async jitter(): Promise<void> {
    const [min, max] = ACTION_JITTER_MS;
    const ms = Math.floor(min + Math.random() * (max - min));
    await new Promise((r) => setTimeout(r, ms));
  }

  private async screenshot(label: string): Promise<void> {
    if (!this.opts.screenshotDir || !this.page) return;
    const file = path.join(
      this.opts.screenshotDir,
      `${Date.now()}-${label}.png`
    );
    try {
      await this.page.screenshot({ path: file, fullPage: false });
    } catch {
      /* non-fatal */
    }
  }

  async login(): Promise<void> {
    if (this.loggedIn) return;
    const page = this.requirePage();
    await page.goto("https://www.skool.com/login", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(sel(SELECTORS.loginEmail), { timeout: 15000 });
    await page.fill(sel(SELECTORS.loginEmail), this.opts.email);
    await this.jitter();
    await page.fill(sel(SELECTORS.loginPassword), this.opts.password);
    await this.jitter();
    await page.click(sel(SELECTORS.loginSubmit));
    await page.waitForURL((url) => !url.toString().includes("/login"), {
      timeout: 25000,
    });
    await this.jitter();
    await this.screenshot("login-complete");
    this.loggedIn = true;
  }

  async postToCommunity(params: {
    body: string;
    category?: string; // category name/label; falls back to default if not matched
  }): Promise<{ url: string } | null> {
    const page = this.requirePage();
    if (!this.loggedIn) await this.login();

    await page.goto(`https://www.skool.com/${this.opts.communitySlug}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    await this.screenshot("community-home");

    // Open composer
    await page.locator(sel(SELECTORS.composePostButton)).first().click({ timeout: 10000 });
    await page.waitForSelector(sel(SELECTORS.composeBody), { timeout: 10000 });
    await this.jitter();

    // Skool posts require a title. Split Ted's body into title + body using
    // the first line.
    const { title, body } = splitTitleAndBody(params.body);
    if (title) {
      try {
        await page.fill(sel(SELECTORS.composeTitleInput), title, { timeout: 3000 });
        await this.jitter();
      } catch {
        // No title input visible $€” some composer variants may only need body.
      }
    }

    // Category selection (best-effort)
    if (params.category) {
      try {
        await page.click(sel(SELECTORS.composeCategoryDropdown), { timeout: 3000 });
        await page
          .getByRole("option", { name: params.category })
          .click({ timeout: 3000 });
      } catch {
        // category picker may be unavailable $€” fall through to default
      }
    }

    // Fill the body $€” use click+type for contenteditable (fill doesn't always
    // work on rich-text editors).
    const bodyLocator = page.locator(sel(SELECTORS.composeBody)).first();
    await bodyLocator.click();
    await bodyLocator.fill(body);
    await this.jitter();
    await this.screenshot("compose-filled");

    if (this.opts.dryRun) {
      console.log("[skool-browser] dry-run $€” skipping Post button click");
      return null;
    }

    await page.locator(sel(SELECTORS.composeSubmit)).first().click();
    await page.waitForLoadState("networkidle", { timeout: 20000 });
    await this.jitter();
    await this.screenshot("post-submitted");

    // Best-effort URL capture $€” Skool usually redirects to the new post page.
    return { url: page.url() };
  }

  async replyToThread(params: {
    threadUrl: string;
    body: string;
  }): Promise<{ url: string } | null> {
    const page = this.requirePage();
    if (!this.loggedIn) await this.login();

    await page.goto(params.threadUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await page.waitForSelector(sel(SELECTORS.replyField), { timeout: 10000 });
    const field = page.locator(sel(SELECTORS.replyField)).first();
    await field.click();
    await field.fill(params.body);
    await this.jitter();
    await this.screenshot("reply-filled");

    if (this.opts.dryRun) {
      console.log("[skool-browser] dry-run $€” skipping Reply button click");
      return null;
    }

    await page.locator(sel(SELECTORS.replySubmit)).first().click();
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.screenshot("reply-submitted");
    return { url: params.threadUrl };
  }

  async scanRecentThreads(opts: {
    hoursBack: number;
    maxThreads: number;
  }): Promise<
    Array<{
      id: string;
      url: string;
      author: string;
      title: string;
      body: string;
      replies: number;
    }>
  > {
    const page = this.requirePage();
    if (!this.loggedIn) await this.login();

    await page.goto(`https://www.skool.com/${this.opts.communitySlug}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2500);
    await this.screenshot("scan-home");

    const threads = await page
      .locator(sel(SELECTORS.threadCard))
      .evaluateAll((cards, slug) => {
        const getText = (el: Element | null | undefined) =>
          (el as HTMLElement | null)?.innerText?.trim() ?? "";
        return cards.slice(0, 40).map((card) => {
          const el = card as HTMLElement;
          const link = el.querySelector(
            `a[href^="/${slug}/"]`
          ) as HTMLAnchorElement | null;
          const titleEl =
            el.querySelector('[class*="styled__Title-sc-vh0utx"]') ??
            el.querySelector('[class*="TitleWrapper"]');
          const previewEl = el.querySelector('[class*="ContentPreview"]');
          const authorEl = el.querySelector('a[href^="/@"]');
          // Skool renders reply count as raw text with a "comment" word nearby.
          const counterEl = el.querySelector('[class*="CommentCount"], [class*="LikesRow"]');
          const counterText = getText(counterEl);
          const repliesMatch = counterText.match(/(\d+)\s*comment/i);
          const replies = repliesMatch ? Number(repliesMatch[1]) : 0;
          const href = link?.getAttribute("href") ?? "";
          const slugFromHref = href.split("/").filter(Boolean).slice(1).join("/");
          return {
            id: slugFromHref,
            url: href ? `https://www.skool.com${href}` : "",
            title: getText(titleEl),
            body: getText(previewEl),
            author: getText(authorEl),
            replies,
          };
        });
      }, this.opts.communitySlug);

    return threads.filter((t) => !!t.id).slice(0, opts.maxThreads);
  }
}
