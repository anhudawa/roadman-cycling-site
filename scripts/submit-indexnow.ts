/**
 * scripts/submit-indexnow.ts
 *
 * Submits fresh + updated URLs to IndexNow (Bing, Yandex, Seznam, and a
 * handful of smaller engines honour it — Google explicitly does NOT,
 * which is the only caveat worth flagging).
 *
 * Why: when new articles or schema-heavy pages go live, IndexNow cuts
 * the discovery lag from "whenever Bing re-crawls" (days to weeks) to
 * "within minutes". That matters most for the newly-shipped 2026
 * content (triathlon pillar, coaching cluster, podcast-authority
 * cluster, FTP Benchmarks asset, the 309 episode capsules).
 *
 * Prerequisites:
 *   1. The site must be LIVE and reachable at https://roadmancycling.com.
 *      IndexNow will reject submissions whose URLs return 4xx/5xx.
 *   2. The key file must be published at the root:
 *        https://roadmancycling.com/{KEY}.txt
 *      containing exactly the key as its body.
 *      We already committed this at public/309675b80de50644461aae338ba6e352.txt.
 *
 * Usage:
 *   pnpm run seo:indexnow           # submit curated new URLs
 *   pnpm run seo:indexnow --dry     # preview without sending
 *   pnpm run seo:indexnow --all     # also include every blog + episode
 *                                    (capped at 10,000 URLs per spec)
 *
 * IndexNow spec: https://www.indexnow.org/documentation
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry") || args.includes("--dry-run");
const all = args.includes("--all");

const HOST = "roadmancycling.com";
const KEY = "309675b80de50644461aae338ba6e352";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// ---------------------------------------------------------------------------
// Curated list — the pages that benefit most from faster discovery.
// ---------------------------------------------------------------------------
const CURATED: string[] = [
  // Pillar + authority
  `https://${HOST}/`,
  `https://${HOST}/coaching`,
  `https://${HOST}/coaching/triathlon`,
  `https://${HOST}/about`,
  `https://${HOST}/about/press`,
  `https://${HOST}/podcast`,

  // Geo coaching
  `https://${HOST}/coaching/ireland`,
  `https://${HOST}/coaching/uk`,
  `https://${HOST}/coaching/usa`,
  `https://${HOST}/coaching/dublin`,
  `https://${HOST}/coaching/cork`,
  `https://${HOST}/coaching/galway`,
  `https://${HOST}/coaching/london`,
  `https://${HOST}/coaching/manchester`,
  `https://${HOST}/coaching/leeds`,
  `https://${HOST}/coaching/belfast`,
  `https://${HOST}/coaching/edinburgh`,

  // Tools
  `https://${HOST}/tools`,
  `https://${HOST}/tools/ftp-zones`,
  `https://${HOST}/tools/tyre-pressure`,
  `https://${HOST}/tools/race-weight`,
  `https://${HOST}/tools/fuelling`,
  `https://${HOST}/tools/energy-availability`,
  `https://${HOST}/tools/shock-pressure`,

  // AI discoverability
  `https://${HOST}/llms.txt`,
  `https://${HOST}/llms-full.txt`,

  // Fresh flagship content
  `https://${HOST}/blog/age-group-ftp-benchmarks-2026`,

  // Persona routes (shipped on main)
  `https://${HOST}/you/plateau`,
  `https://${HOST}/you/event`,
  `https://${HOST}/you/comeback`,
  `https://${HOST}/you/listener`,

  // Curated onboarding hub
  `https://${HOST}/start-here`,

  // Training plan hub + event hubs (newly shipped)
  `https://${HOST}/plan`,
  `https://${HOST}/plan/wicklow-200`,
  `https://${HOST}/plan/ring-of-beara`,
  `https://${HOST}/plan/ride-london-100`,
  `https://${HOST}/plan/fred-whitton-challenge`,
  `https://${HOST}/plan/etape-du-tour`,
  `https://${HOST}/plan/maratona-dles-dolomites`,
  `https://${HOST}/plan/mallorca-312`,
  `https://${HOST}/plan/badlands`,
  `https://${HOST}/plan/leadville-100`,
  `https://${HOST}/plan/gran-fondo-nyc`,
  `https://${HOST}/plan/dirty-reiver`,
  `https://${HOST}/plan/unbound-gravel`,
  `https://${HOST}/plan/cape-epic`,
  `https://${HOST}/plan/trans-pyrenees`,
];

const TRIATHLON_CLUSTER = [
  "bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
  "ironman-bike-training-plan-16-weeks",
  "70-3-bike-training-plan-12-weeks",
  "how-to-pace-the-bike-in-a-half-ironman",
  "brick-workouts-for-ironman",
  "what-wattage-should-you-ride-in-an-ironman",
  "ftp-training-for-triathletes",
  "strength-training-for-triathletes-bike-specific",
  "how-many-bike-hours-per-week-for-70-3",
  "cycling-coach-vs-triathlon-coach",
  "aero-position-training-for-triathletes",
  "indoor-cycling-for-triathletes-winter-plan",
];

const COACHING_CLUSTER = [
  "how-much-does-online-cycling-coach-cost-2026",
  "is-a-cycling-coach-worth-it-case-study",
  "polarised-vs-sweet-spot-training",
  "trainerroad-vs-online-cycling-coach",
  "time-crunched-cyclist-8-hours-week",
  "gran-fondo-training-plan-12-weeks",
  "how-to-periodise-cycling-season",
  "cycling-coach-near-me-why-location-doesnt-matter-2026",
  "masters-cyclist-guide-getting-faster-after-40",
  "comeback-cyclist-12-week-return-plan",
  "how-to-structure-cycling-training-plan",
  "power-meter-training-plan-week-by-week",
];

const COMPARISON_CLUSTER = [
  "zwift-vs-trainerroad",
  "wahoo-vs-garmin-cycling-computers",
  "power-meter-vs-smart-trainer",
  "rouvy-vs-zwift",
  "tubeless-vs-clincher-tyres",
  "indoor-trainer-vs-rollers",
  "zone-2-vs-endurance-training",
  "aero-vs-weight-cyclist",
  "steady-state-vs-interval-training-cycling",
  "fasted-vs-fueled-cycling",
];

const PODCAST_AUTHORITY_CLUSTER = [
  "best-cycling-podcasts-2026",
  "best-indoor-cycling-podcasts-winter",
  "best-cycling-training-podcasts-age-groupers",
  "best-cycling-podcast-for-triathletes",
  "fast-talk-vs-cycling-podcast-vs-roadman",
  "every-roadman-episode-with-dan-lorang",
  "every-roadman-episode-with-stephen-seiler",
  "podcasts-for-cyclists-over-40",
  "cycling-podcasts-for-indoor-training",
  "how-we-record-the-roadman-podcast",
  "what-cycling-podcasts-got-wrong-about-polarised-training",
];

function clusterUrls(slugs: string[]): string[] {
  return slugs.map((slug) => `https://${HOST}/blog/${slug}`);
}

function allBlogUrls(): string[] {
  const BLOG_DIR = path.join(process.cwd(), "content/blog");
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => `https://${HOST}/blog/${f.replace(/\.mdx$/, "")}`);
}

function allEpisodeUrls(): string[] {
  const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
  if (!fs.existsSync(PODCAST_DIR)) return [];
  return fs
    .readdirSync(PODCAST_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .filter((f) => {
      // Only include episodes that actually exist (have a transcript or
      // publishDate) — filters out edge cases.
      const raw = fs.readFileSync(path.join(PODCAST_DIR, f), "utf-8");
      const { data } = matter(raw);
      return Boolean(data.publishDate);
    })
    .map((f) => `https://${HOST}/podcast/${f.replace(/\.mdx$/, "")}`);
}

async function submit(urls: string[]): Promise<void> {
  // Spec: maximum 10,000 URLs per submission. Chunk if needed.
  const CHUNK = 10_000;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const chunk = urls.slice(i, i + CHUNK);
    const body = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: chunk,
    };

    console.log(`\n→ Submitting ${chunk.length} URLs (chunk ${Math.floor(i / CHUNK) + 1})`);

    if (dryRun) {
      console.log("  [DRY RUN] no request sent");
      chunk.slice(0, 5).forEach((u) => console.log(`    ${u}`));
      if (chunk.length > 5) console.log(`    … and ${chunk.length - 5} more`);
      continue;
    }

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      console.log(`  ✓ ${response.status} ${response.statusText}`);
    } else {
      const text = await response.text();
      console.log(`  ✗ ${response.status} ${response.statusText}`);
      console.log(`    ${text.slice(0, 500)}`);
    }
  }
}

async function main() {
  console.log(`🔎 IndexNow submission for ${HOST}`);
  console.log(`   Key location: ${KEY_LOCATION}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   All content: ${all}`);
  console.log("");

  const urls = new Set<string>();

  CURATED.forEach((u) => urls.add(u));
  clusterUrls(TRIATHLON_CLUSTER).forEach((u) => urls.add(u));
  clusterUrls(COACHING_CLUSTER).forEach((u) => urls.add(u));
  clusterUrls(PODCAST_AUTHORITY_CLUSTER).forEach((u) => urls.add(u));
  clusterUrls(COMPARISON_CLUSTER).forEach((u) => urls.add(u));

  if (all) {
    allBlogUrls().forEach((u) => urls.add(u));
    allEpisodeUrls().forEach((u) => urls.add(u));
  }

  const urlList = Array.from(urls).sort();

  console.log(`   URLs to submit: ${urlList.length}`);

  if (!dryRun) {
    // Before submitting, verify the key file is publicly readable. If it
    // isn't, IndexNow rejects the whole batch.
    console.log(`\n   Checking key file at ${KEY_LOCATION}…`);
    try {
      const check = await fetch(KEY_LOCATION);
      if (!check.ok) {
        console.error(
          `   ✗ Key file returned ${check.status}. Deploy the site first so ` +
            `public/${KEY}.txt is reachable, then re-run.`,
        );
        process.exit(1);
      }
      const body = (await check.text()).trim();
      if (body !== KEY) {
        console.error(
          `   ✗ Key file body does not match expected key. Got: "${body.slice(0, 40)}…"`,
        );
        process.exit(1);
      }
      console.log("   ✓ Key file is live and correct");
    } catch (err) {
      console.error(
        `   ✗ Could not reach key file: ${err instanceof Error ? err.message : String(err)}`,
      );
      console.error(
        `     The site may not be deployed yet. Run this once it's live.`,
      );
      process.exit(1);
    }
  }

  await submit(urlList);

  console.log("");
  console.log("Done.");
  console.log("");
  console.log(
    "IndexNow submission reaches Bing, Yandex, Seznam, Naver. Google does NOT honour IndexNow — use Google Search Console's URL-inspection tool for /coaching/triathlon and your most important new articles.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
