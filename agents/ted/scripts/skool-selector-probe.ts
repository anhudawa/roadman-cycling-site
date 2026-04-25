#!/usr/bin/env tsx
// Verifies every selector in agents/ted/src/lib/skool-browser.ts against the
// live Skool UI. Re-run after any Skool rebrand:
//
//   SKOOL_EMAIL=... SKOOL_PASSWORD=... \
//     npx tsx agents/ted/scripts/skool-selector-probe.ts
//
// Prints a match/miss report for each selector alternate and saves screenshots
// of the login, community feed, and open composer to /tmp/skool-probe-<date>/.

import { chromium, type Page } from "playwright";
import fs from "fs";
import path from "path";

const EMAIL = process.env.SKOOL_EMAIL;
const PASSWORD = process.env.SKOOL_PASSWORD;
const COMMUNITY = process.env.SKOOL_COMMUNITY_SLUG ?? "roadman";
const SHOT_DIR = `/tmp/skool-probe-${Date.now()}`;

if (!EMAIL || !PASSWORD) {
  console.error("Set SKOOL_EMAIL and SKOOL_PASSWORD.");
  process.exit(1);
}
fs.mkdirSync(SHOT_DIR, { recursive: true });

async function shot(p: Page, label: string) {
  const f = path.join(SHOT_DIR, `${Date.now()}-${label}.png`);
  await p.screenshot({ path: f, fullPage: false });
  console.log(`  shot: ${f}`);
}

async function probe(page: Page, label: string, sels: string[]) {
  console.log(`\n${label}:`);
  for (const s of sels) {
    try {
      const n = await page.locator(s).count();
      const sample =
        n > 0
          ? (await page.locator(s).first().innerText({ timeout: 500 }).catch(() => "")).trim().slice(0, 80)
          : "";
      console.log(
        `  ${n > 0 ? "OK" : "$€” "} (${n}) ${s}${sample ? "  :: " + sample.replace(/\n/g, " ") : ""}`
      );
    } catch {
      console.log(`  ER (0) ${s}`);
    }
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
    locale: "en-GB",
    timezoneId: "Europe/Dublin",
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { "Accept-Language": "en-GB,en;q=0.9" },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const page = await context.newPage();

  console.log("GET /login");
  await page.goto("https://www.skool.com/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await probe(page, "login email", ['input[type="email"]', 'input[name="email"]']);
  await probe(page, "login password", ['input[type="password"]', 'input[name="password"]']);
  await probe(page, "login submit", ['button[type="submit"]', 'button:has-text("LOG IN")']);

  console.log("\nLOGIN");
  await page.fill('input[type="email"]', EMAIL!);
  await page.waitForTimeout(400);
  await page.fill('input[type="password"]', PASSWORD!);
  await page.waitForTimeout(400);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL((u) => !u.toString().includes("/login"), { timeout: 25000 });
    console.log(`  logged in $†’ ${page.url()}`);
  } catch {
    await shot(page, "login-stuck");
    console.error("  still on /login after 25s $€” check screenshot");
    await browser.close();
    process.exit(2);
  }

  console.log(`\nGET /${COMMUNITY}`);
  await page.goto(`https://www.skool.com/${COMMUNITY}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await shot(page, "feed");

  await probe(page, "compose-open", [
    "text=Write something",
    '[class*="CardWrapper"]:has-text("Write something")',
    '[class*="PostComposerButton"]',
  ]);
  await probe(page, "post cards", [
    '[class*="PostItemCardContent"]',
    'a[href^="/roadman/"][class*="ChildrenLink"]',
  ]);
  await probe(page, "post titles", ['[class*="styled__Title-sc-vh0utx"]']);
  await probe(page, "post authors", ['a[href^="/@"]']);

  console.log("\nCLICK compose");
  await page.locator("text=Write something").first().click({ timeout: 5000 });
  await page.waitForTimeout(2500);
  await shot(page, "composer-open");

  await probe(page, "composer body", [
    'div[contenteditable="true"]',
    'div[role="textbox"]',
    '[class*="ql-editor"]',
  ]);
  await probe(page, "composer title input", [
    'input[placeholder*="Title" i]',
  ]);
  await probe(page, "composer submit", [
    'button:has-text("POST")',
    'button:has-text("Post")',
  ]);
  await probe(page, "composer category", [
    'button[aria-haspopup]',
    '[class*="CategoryPicker"]',
  ]);

  await browser.close();
  console.log(`\nDone. Screenshots: ${SHOT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
