// Playwright wrapper for Skool. Logs in once per process, posts, replies, scrapes.
//
// IMPORTANT: Skool's DOM is not a public API. The selectors below are educated
// best-effort based on the current public Skool UI (April 2026). They WILL drift
// when Skool ships UI changes. Every selector is centralised in SELECTORS for a
// single place to update. Before posting in production, run
// `npm run ted:post-prompt -- --dry-run` and verify the screenshots in
// `logs/ted/screenshots/`.
//
// The --dry-run flag goes through every step except the final "Post" button
// click, so you can validate login + navigation without writing.

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

// Skool UI selectors — edit here if the DOM drifts. Each field is a COMMA-
// SEPARATED LIST of selectors; waitForFirst() tries them in order and returns
// the first one that exists. This tolerates minor Skool rebrands / A/B tests
// without needing a code change if one of the alternates keeps working.
const SELECTORS = {
  loginEmail: [
    'input[name="email"]',
    'input[type="email"]',
    'input[autocomplete="email"]',
  ],
  loginPassword: [
    'input[name="password"]',
    'input[type="password"]',
    'input[autocomplete="current-password"]',
  ],
  loginSubmit: [
    'button[type="submit"]',
    'button:has-text("Log in")',
    'button:has-text("Sign in")',
  ],
  composePostButton: [
    'button:has-text("Write something")',
    'button:has-text("Create post")',
    'button:has-text("New post")',
    '[data-testid="composer-open"]',
  ],
  composeBody: [
    '[data-testid="composer-body"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    'textarea[name="body"]',
  ],
  composeCategoryDropdown: [
    '[data-testid="composer-category"]',
    'button[aria-haspopup="listbox"]',
  ],
  composeSubmit: [
    '[data-testid="composer-submit"]',
    'button:has-text("Post")',
    'button:has-text("Publish")',
  ],
  threadCard: [
    'div[data-testid="post-card"]',
    'article[data-testid="post"]',
    'article',
  ],
  threadBody: [
    '[data-testid="post-body"]',
    'div[data-testid="post-content"]',
  ],
  replyField: [
    '[data-testid="reply-field"]',
    'div[contenteditable="true"][data-placeholder*="Reply"]',
    'div[contenteditable="true"][aria-label*="Reply"]',
    'textarea[name="reply"]',
  ],
  replySubmit: [
    '[data-testid="reply-submit"]',
    'button:has-text("Reply")',
    'button:has-text("Post reply")',
  ],
};

/** Join an array of alternate selectors into a single comma-separated Playwright selector. */
function sel(list: string[]): string {
  return list.join(", ");
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
    // Dynamic import keeps playwright out of the bundle when only drafting.
    const { chromium } = await import("playwright");
    this.browser = await chromium.launch({
      headless: this.opts.headless ?? true,
    });
    this.context = await this.browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 900 },
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
    await page.goto("https://www.skool.com/login", {
      waitUntil: "domcontentloaded",
    });
    await page.fill(sel(SELECTORS.loginEmail), this.opts.email);
    await page.fill(sel(SELECTORS.loginPassword), this.opts.password);
    await page.click(sel(SELECTORS.loginSubmit));
    // Wait for redirect off /login
    await page.waitForURL((url) => !url.toString().includes("/login"), {
      timeout: 15000,
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
    await this.jitter();
    await this.screenshot("community-home");

    // Open composer
    await page.click(sel(SELECTORS.composePostButton));
    await page.waitForSelector(sel(SELECTORS.composeBody), { timeout: 10000 });
    await this.jitter();

    // Category selection (best-effort; optional)
    if (params.category) {
      try {
        await page.click(sel(SELECTORS.composeCategoryDropdown), { timeout: 3000 });
        await page
          .getByRole("option", { name: params.category })
          .click({ timeout: 3000 });
      } catch {
        // category picker may not be present on every Skool variant — fall through
      }
    }

    await page.fill(sel(SELECTORS.composeBody), params.body);
    await this.jitter();
    await this.screenshot("compose-filled");

    if (this.opts.dryRun) {
      console.log("[skool-browser] dry-run — skipping Post button click");
      return null;
    }

    await page.click(sel(SELECTORS.composeSubmit));
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await this.jitter();
    await this.screenshot("post-submitted");

    // Best-effort URL capture — the newest post at the top of the feed.
    const url = page.url();
    return { url };
  }

  async replyToThread(params: {
    threadUrl: string;
    body: string;
  }): Promise<{ url: string } | null> {
    const page = this.requirePage();
    if (!this.loggedIn) await this.login();

    await page.goto(params.threadUrl, { waitUntil: "domcontentloaded" });
    await this.jitter();
    await page.waitForSelector(sel(SELECTORS.replyField), { timeout: 10000 });
    await page.fill(sel(SELECTORS.replyField), params.body);
    await this.jitter();
    await this.screenshot("reply-filled");

    if (this.opts.dryRun) {
      console.log("[skool-browser] dry-run — skipping Reply button click");
      return null;
    }

    await page.click(sel(SELECTORS.replySubmit));
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
      body: string;
      replies: number;
    }>
  > {
    const page = this.requirePage();
    if (!this.loggedIn) await this.login();

    await page.goto(`https://www.skool.com/${this.opts.communitySlug}`, {
      waitUntil: "domcontentloaded",
    });
    await this.jitter();
    await this.screenshot("scan-home");

    // Collect what we can from the feed. Real-world selectors will need tuning
    // against the live DOM; the contract below is stable.
    const threads = await page
      .locator(sel(SELECTORS.threadCard))
      .evaluateAll((cards) => {
        return cards.slice(0, 40).map((card) => {
          const el = card as HTMLElement;
          const link = el.querySelector("a[href*='/posts/']") as HTMLAnchorElement | null;
          const author =
            (el.querySelector("[data-testid='author-name']") as HTMLElement | null)
              ?.innerText?.trim() ?? "";
          const body =
            (el.querySelector("[data-testid='post-body'], p") as HTMLElement | null)
              ?.innerText?.trim() ?? "";
          const repliesText =
            (el.querySelector("a[href*='/comments']") as HTMLElement | null)
              ?.innerText?.trim() ?? "0";
          const repliesMatch = repliesText.match(/(\d+)/);
          const replies = repliesMatch ? Number(repliesMatch[1]) : 0;
          return {
            id: link?.href?.split("/posts/")[1]?.split(/[/?#]/)[0] ?? link?.href ?? "",
            url: link?.href ?? "",
            author,
            body,
            replies,
          };
        });
      });

    return threads.filter((t) => !!t.id).slice(0, opts.maxThreads);
  }
}
