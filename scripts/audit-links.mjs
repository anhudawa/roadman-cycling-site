#!/usr/bin/env node
// Comprehensive sitewide link audit.
//
// Extracts every link reference from:
//   - content/**/*.mdx     (markdown body links + frontmatter slug refs + image src)
//   - src/**/*.{ts,tsx,js,jsx,mjs}  (Link href, <a href>, redirect/rewrite destinations)
//   - *.md / *.txt at workspace root (audit reports, email templates)
//   - next.config.ts redirects/rewrites
//
// Validates every link against:
//   - Static page routes from src/app/**/page.tsx
//   - Dynamic route slugs (blog/podcast/answers/watch/topics/entities from
//     production loaders;
//     comparisons/case-studies/best-for/problems/questions/event-guides/glossary/
//     coaching-segments/races/paid-reports from TS source arrays)
//   - public/** static assets (images, csv, pdf)
//   - next.config.ts redirects (path → destination map) and rewrites
//
// External links are HEAD-checked (concurrent, with timeout). Anchor links
// (#section) are checked against the destination page when discoverable.
//
// Output: JSON report at scripts/audit-links-report.json + console summary.
//
// CLI flags:
//   --no-external        Skip external HEAD checks (offline / fast mode)
//   --json-only          Print only the JSON path on success
//   --fail-on-broken     Exit 1 if any broken links remain
//   --verbose            Verbose progress

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const NO_EXTERNAL = args.has("--no-external");
const JSON_ONLY = args.has("--json-only");
const FAIL_ON_BROKEN = args.has("--fail-on-broken");
const VERBOSE = args.has("--verbose");
const REPORT_PATH = path.join(ROOT, "scripts/audit-links-report.json");

const log = (...a) => {
  if (!JSON_ONLY) console.log(...a);
};
const vlog = (...a) => {
  if (VERBOSE && !JSON_ONLY) console.log(...a);
};

// ---------------------------------------------------------------------------
// 1. ROUTE INVENTORY
// ---------------------------------------------------------------------------

/** Static routes derived from filesystem. */
function collectStaticRoutes() {
  const routes = new Set();
  const APP = path.join(ROOT, "src/app");
  function walk(dir, prefix) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = entry.name;
      const full = path.join(dir, name);
      if (entry.isDirectory()) {
        // Skip API routes — they are not user-facing pages
        if (name === "api") continue;
        // Skip private folders
        if (name.startsWith("_")) continue;
        // Route groups (parens) are transparent in the URL
        const segment = name.startsWith("(") && name.endsWith(")") ? "" : name;
        // Dynamic segments stay as [slug] for now; we resolve them separately
        const next = segment ? `${prefix}/${segment}` : prefix;
        walk(full, next);
      } else if (entry.isFile() && /^page\.(tsx|ts|jsx|js|mdx)$/.test(name)) {
        routes.add(prefix === "" ? "/" : prefix);
      }
    }
  }
  walk(APP, "");
  return routes;
}

/** Tool slugs — from /tools page directories. */
function toolSlugsFromApp() {
  const dir = path.join(ROOT, "src/app/(content)/tools");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name);
}

const STATIC_ROUTES = collectStaticRoutes();

// Load canonical route inventory dumped by scripts/dump-route-inventory.ts.
// This guarantees we validate against the same slug set production uses
// (including NAME_ALIASES, isLikelyPersonName, slug overrides, etc.).
const INVENTORY_PATH = path.join(ROOT, "scripts/route-inventory.json");
if (!fs.existsSync(INVENTORY_PATH)) {
  console.error(
    `Missing ${path.relative(ROOT, INVENTORY_PATH)}.\nRun: npx tsx scripts/dump-route-inventory.ts > scripts/route-inventory.json`,
  );
  process.exit(2);
}
const INVENTORY = JSON.parse(fs.readFileSync(INVENTORY_PATH, "utf-8"));

const BLOG_SLUGS = new Set(INVENTORY.blog);
const PODCAST_SLUGS = new Set(INVENTORY.podcast);
const TOPIC_SLUGS = new Set(INVENTORY.topics);
const ENTITY_MDX_SLUGS = new Set(INVENTORY.entities);
const COMPARISON_SLUGS = new Set(INVENTORY.comparisons);
const CASE_STUDY_SLUGS = new Set(INVENTORY.caseStudies);
const BEST_FOR_SLUGS = new Set(INVENTORY.bestFor);
const PROBLEM_SLUGS = new Set(INVENTORY.problems);
const QUESTION_SLUGS = new Set(INVENTORY.questions);
const ANSWER_SLUGS = new Set(INVENTORY.answers || []);
const WATCH_SLUGS = new Set(INVENTORY.watch || []);
const TOUR_STAGE_SLUGS = new Set(INVENTORY.tourStages || []);
const TOUR_HISTORY_SLUGS = new Set(INVENTORY.tourHistory || []);
const EXPERT_TOPIC_PATHS = new Set(
  (INVENTORY.expertTopicPairs || []).map(
    ({ expertSlug, topicSlug }) => `${expertSlug}/${topicSlug}`,
  ),
);
const EXPERT_SLUGS = new Set(
  (INVENTORY.expertTopicPairs || []).map(({ expertSlug }) => expertSlug),
);
const RECOMMENDATION_CATEGORY_SLUGS = new Set(
  INVENTORY.recommendationCategories || [],
);
const RECOMMENDATION_PRODUCT_PATHS = new Set(
  INVENTORY.recommendationProducts || [],
);
const EVENT_GUIDE_SLUGS = new Set(INVENTORY.eventGuides);
const GLOSSARY_SLUGS = new Set(INVENTORY.glossary);
const RACE_SLUGS = new Set(INVENTORY.races);
const COACHING_SEGMENT_SLUGS = new Set(INVENTORY.coachingSegments);
const COACHING_LOCATION_SLUGS = new Set(INVENTORY.coachingLocations);
const GUEST_SLUGS = new Set(INVENTORY.guests);
const PODCAST_TRANSCRIPT_SLUGS = new Set(INVENTORY.podcastTranscripts);
const PLAN_EVENT_SLUGS = new Set(INVENTORY.planEvents);
const PLAN_PHASE_SLUGS = new Set(INVENTORY.planPhases);
const PERSONA_SLUGS = new Set(INVENTORY.personas || []);
const GIRONA_ROUTE_SLUGS = new Set(INVENTORY.gironaRoutes || []);

// /entity/[slug] also has hard-coded brand entity pages
const STATIC_ENTITY_SLUGS = new Set([
  "anthony-walsh",
  "roadman-method",
  "not-done-yet",
  "roadman-podcast",
  "ask-roadman",
  "roadman-cycling",
]);
const ENTITY_SLUGS = new Set([...ENTITY_MDX_SLUGS, ...STATIC_ENTITY_SLUGS]);

// /author/[slug]
const AUTHOR_SLUGS = new Set(["anthony-walsh"]);

// /reports/[product] — paid product slugs
const PAID_PRODUCT_SLUGS = new Set([
  "report_plateau",
  "report_fuelling",
  "report_ftp",
  "report_race",
  "bundle_performance",
]);

// /results/[tool] — same tool slugs as /tools/[tool]
const TOOL_SLUGS = new Set(toolSlugsFromApp());

// /plan/[event]/[weeksOut]? — uses the planEvents inventory
const EVENT_PLAN_SLUGS = PLAN_EVENT_SLUGS;

// /case-studies/[slug] — same as case study slugs
// /races/[slug] — race slugs

// ---------------------------------------------------------------------------
// 2. REDIRECTS / REWRITES
// ---------------------------------------------------------------------------

function parseNextConfigRedirects() {
  const file = path.join(ROOT, "next.config.ts");
  const text = fs.readFileSync(file, "utf-8");
  const redirects = [];
  const rewrites = [];

  // Match { source: "...", ..., destination: "...", ... } blocks.
  const reBlock =
    /\{\s*source:\s*"([^"]+)"\s*,([\s\S]*?)destination:\s*"([^"]+)"/g;
  for (const m of text.matchAll(reBlock)) {
    const source = m[1];
    const rest = m[2];
    const destination = m[3];
    const has = /has:\s*WWW_HOST/.test(rest)
      ? "www"
      : /has:\s*COACHING_SUBDOMAIN/.test(rest)
        ? "coaching-subdomain"
        : null;
    redirects.push({ source, destination, has });
  }

  // Rewrites — search inside the rewrites() body which uses the same shape.
  const rewriteSection = text.match(
    /async\s+rewrites\s*\(\)\s*\{([\s\S]*?)\n\s+\},\s*\n\s+async/,
  );
  if (rewriteSection) {
    for (const m of rewriteSection[1].matchAll(reBlock)) {
      rewrites.push({ source: m[1], destination: m[3] });
    }
  }
  return { redirects, rewrites };
}

const { redirects: REDIRECTS, rewrites: REWRITES } = parseNextConfigRedirects();

/** Apex-host redirect map: source-path → destination */
const REDIRECT_MAP = new Map();
for (const r of REDIRECTS) {
  if (r.has === "www" || r.has === "coaching-subdomain") continue;
  // path-to-regexp v8: leave wildcards in source; for lookup we store both
  // the literal source and a regex form.
  REDIRECT_MAP.set(r.source, r.destination);
}
// Rewrites work like redirects from a routing perspective for /links/.
const REWRITE_MAP = new Map();
for (const r of REWRITES) {
  REWRITE_MAP.set(r.source, r.destination);
}

// ---------------------------------------------------------------------------
// 3. ROUTE VALIDATION
// ---------------------------------------------------------------------------

/** Route patterns whose dynamic param has an open (any string) policy. */
const OPEN_DYNAMIC_PREFIXES = [
  "/embed/", // /embed/<anything>
];

/** Map of dynamic route pattern → slug set. Only the most specific match wins. */
const DYNAMIC_ROUTE_VALIDATORS = [
  ["/blog/", BLOG_SLUGS],
  ["/podcast/", PODCAST_SLUGS, /* allow /transcript */ true, "podcast"],
  ["/topics/", TOPIC_SLUGS],
  ["/entity/", ENTITY_SLUGS],
  ["/guests/", null, false, "guests"], // resolved separately
  ["/glossary/", GLOSSARY_SLUGS],
  ["/compare/", COMPARISON_SLUGS],
  ["/case-studies/", CASE_STUDY_SLUGS],
  ["/best/", BEST_FOR_SLUGS],
  ["/problem/", PROBLEM_SLUGS],
  ["/question/", QUESTION_SLUGS],
  ["/answers/", ANSWER_SLUGS],
  ["/watch/", WATCH_SLUGS],
  ["/tour-de-france/history/", TOUR_HISTORY_SLUGS],
  ["/tour-de-france/stage/", TOUR_STAGE_SLUGS],
  ["/experts/", null, false, "experts"],
  ["/recommends/", null, false, "recommends"],
  ["/you/", PERSONA_SLUGS],
  ["/event/", EVENT_GUIDE_SLUGS],
  ["/plan/", EVENT_PLAN_SLUGS, /* allow /[weeksOut] */ true, "plan"],
  ["/races/", RACE_SLUGS],
  ["/reports/", PAID_PRODUCT_SLUGS, /* allow /success | /view | /view/[token] */ true],
  ["/predict/", null, /* open */ true],
  ["/author/", AUTHOR_SLUGS],
  ["/newsletter/", null, /* open */ true],
  // /coaching/<x> — accepts: location pages OR coaching-segment static pages.
  // The location dynamic [location] handles 11 locations, and there are also
  // ~12 static segment pages (post-injury, women, beginners, etc.).
  ["/coaching/", null, false, "coaching"],
  ["/results/", TOOL_SLUGS, /* allow nested /[slug] */ true, "results-tool"],
  ["/tools/", TOOL_SLUGS],
  ["/diagnostic/", null, /* open: per-submission slugs */ true],
  ["/cycling-girona/", GIRONA_ROUTE_SLUGS],
];

function loadGuestSlugs() {
  return GUEST_SLUGS;
}

const VALID_STATIC_PATHS = new Set([
  "/", // home
  ...STATIC_ROUTES,
  // Marketing top-level pages that are not page.tsx-derived but exist:
  "/sitemap.xml",
  "/sitemap-index.xml",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/feed",
  "/feed/blog",
  "/feed/podcast",
  "/feeds/tools.json",
  "/feeds/glossary.json",
  "/feeds/episodes.json",
  "/feeds/articles.json",
  "/feeds/guests.json",
  "/feeds/topics.json",
  "/manifest.webmanifest",
  "/og-image.jpg",
  "/api/og/blog-hero",
  "/api/facts.json",
  "/api/content-map",
  "/knowledge-graph.json",
]);

function pathExists(p) {
  return VALID_STATIC_PATHS.has(p);
}

/** Validate a normalized internal path (no query string, no fragment). */
function classifyInternalPath(rawPath) {
  // Strip trailing slash except for root
  const p =
    rawPath !== "/" && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;

  // Direct redirect/rewrite hit
  if (REDIRECT_MAP.has(p)) {
    const dest = REDIRECT_MAP.get(p);
    return { ok: true, type: "redirect", redirectTo: dest };
  }
  if (REWRITE_MAP.has(p)) {
    const dest = REWRITE_MAP.get(p);
    return { ok: true, type: "rewrite", rewriteTo: dest };
  }
  // Wildcard redirect match (e.g. /blog/category/:slug*)
  for (const r of REDIRECTS) {
    if (r.has) continue;
    if (!r.source.includes(":")) continue;
    const re = sourcePatternToRegex(r.source);
    if (re.test(p)) {
      return { ok: true, type: "redirect-wildcard", redirectTo: r.destination };
    }
  }

  // Static route?
  if (pathExists(p)) return { ok: true, type: "static" };

  // Embed routes (open dynamic)
  for (const prefix of OPEN_DYNAMIC_PREFIXES) {
    if (p.startsWith(prefix)) return { ok: true, type: "open-dynamic" };
  }

  // Dynamic route?
  for (const validator of DYNAMIC_ROUTE_VALIDATORS) {
    const [prefix, slugSet, allowNested, kind] = validator;
    if (!p.startsWith(prefix)) continue;
    const remainder = p.slice(prefix.length);
    if (!remainder) continue; // would be /blog/ etc., handled by static
    const segments = remainder.split("/");
    const slug = segments[0];

    if (kind === "guests") {
      const set = loadGuestSlugs();
      return set.has(slug)
        ? { ok: true, type: "dynamic-guest", slug }
        : { ok: false, type: "broken-dynamic-guest", slug, prefix };
    }
    if (kind === "coaching") {
      // /coaching/<x> — accept a static page (e.g. /coaching/post-injury) OR
      // a dynamic [location] match (ireland, dublin, london, etc).
      if (
        STATIC_ROUTES.has(`${prefix.slice(0, -1)}/${slug}`) ||
        COACHING_LOCATION_SLUGS.has(slug) ||
        COACHING_SEGMENT_SLUGS.has(slug)
      ) {
        return { ok: true, type: "dynamic", prefix, slug };
      }
      return { ok: false, type: "broken-dynamic", prefix, slug };
    }
    if (kind === "results-tool") {
      // /results/<tool> AND /results/<tool>/<slug>
      if (TOOL_SLUGS.has(slug)) return { ok: true, type: "dynamic-tool", slug };
      return { ok: false, type: "broken-dynamic", prefix, slug };
    }
    if (kind === "experts") {
      if (segments.length === 1 && EXPERT_SLUGS.has(slug)) {
        return { ok: true, type: "dynamic-expert", slug };
      }
      if (segments.length === 2 && EXPERT_TOPIC_PATHS.has(remainder)) {
        return { ok: true, type: "dynamic-expert-topic", path: remainder };
      }
      return { ok: false, type: "broken-dynamic", prefix, slug };
    }
    if (kind === "recommends") {
      if (segments.length === 1 && RECOMMENDATION_CATEGORY_SLUGS.has(slug)) {
        return { ok: true, type: "dynamic-recommendation-category", slug };
      }
      if (
        segments.length === 2 &&
        RECOMMENDATION_PRODUCT_PATHS.has(remainder)
      ) {
        return { ok: true, type: "dynamic-recommendation-product", path: remainder };
      }
      return { ok: false, type: "broken-dynamic", prefix, slug };
    }
    if (kind === "podcast") {
      // /podcast/<slug>  or  /podcast/<slug>/transcript
      if (!PODCAST_SLUGS.has(slug)) {
        return { ok: false, type: "broken-dynamic", prefix, slug };
      }
      if (segments.length === 1) return { ok: true, type: "dynamic", prefix, slug };
      if (segments.length === 2 && segments[1] === "transcript") {
        return PODCAST_TRANSCRIPT_SLUGS.has(slug)
          ? { ok: true, type: "dynamic-transcript", prefix, slug }
          : { ok: false, type: "broken-podcast-transcript", prefix, slug };
      }
      return { ok: false, type: "unexpected-nested-segment", prefix, slug };
    }
    if (kind === "plan") {
      if (!PLAN_EVENT_SLUGS.has(slug)) {
        return { ok: false, type: "broken-dynamic", prefix, slug };
      }
      if (segments.length === 1) return { ok: true, type: "dynamic", prefix, slug };
      if (segments.length === 2 && PLAN_PHASE_SLUGS.has(segments[1])) {
        return { ok: true, type: "dynamic-plan-phase", prefix, slug };
      }
      return { ok: false, type: "unexpected-nested-segment", prefix, slug };
    }

    if (slugSet === null) {
      // Open route (predict, newsletter)
      return { ok: true, type: "open-dynamic", prefix, slug };
    }

    if (slugSet.has(slug)) {
      // Optional nested segment validation
      if (segments.length > 1 && !allowNested) {
        return { ok: false, type: "unexpected-nested-segment", prefix, slug, remainder };
      }
      return { ok: true, type: "dynamic", prefix, slug };
    }
    return { ok: false, type: "broken-dynamic", prefix, slug };
  }

  // Public asset?
  if (publicAssetExists(p)) return { ok: true, type: "asset" };

  return { ok: false, type: "unknown" };
}

function sourcePatternToRegex(source) {
  // Translate Next.js path-to-regexp v8 patterns to JS RegExp.
  // Very small subset: :slug*, :slug, :rest(.*)
  let re = source.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  re = re.replace(/:[a-zA-Z_]+\\\(\\\.\\\*\\\)/g, "(.*)");
  re = re.replace(/\\:[a-zA-Z_]+\*/g, "(.*)");
  re = re.replace(/:[a-zA-Z_]+\\\*/g, "(.*)");
  re = re.replace(/:[a-zA-Z_]+/g, "([^/]+)");
  return new RegExp(`^${re}$`);
}

function publicAssetExists(p) {
  // /images/... -> public/images/...
  if (!p.startsWith("/")) return false;
  const candidate = path.join(ROOT, "public", p);
  if (fs.existsSync(candidate)) return true;
  // App-served static files (favicon, og)
  const appCandidate = path.join(ROOT, "src/app", p);
  if (fs.existsSync(appCandidate)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// 4. EXTRACT LINKS FROM SOURCES
// ---------------------------------------------------------------------------

const links = []; // {sourceFile, line, raw, url, kind, context}

function pushLink(record) {
  links.push(record);
}

// Markdown link: [text](url)   (not images, those start with !)
const MD_LINK_RE = /(?<!!)\[(?:[^\]\n]|\n[^\n])*?\]\(([^()\s]+(?:\([^()]*\))?)\)/g;
// MDX inline HTML <a href="...">
const HTML_HREF_RE = /\bhref=["']([^"'#?\s][^"']*)["']/g;
// MDX/JSX <Image src="..." />
const IMG_SRC_RE = /\bsrc=["']([^"']+)["']/g;
// Markdown image: ![alt](url)
const MD_IMG_RE = /!\[[^\]]*\]\(([^()\s]+)\)/g;
// Generic href in TS/TSX (Link href={"..."}, href={'...'}, href: "...", href="...")
const TS_HREF_RE =
  /\bhref(?:\s*[:=]\s*\{?|\s*=\s*)\s*["'`]([^"'`]+)["'`]/g;
// to="..." in some legacy components, redirect destinations etc.
const REDIRECT_DEST_RE =
  /\b(?:destination|redirect|redirectTo)\s*[:=]\s*["'`]([^"'`]+)["'`]/g;
// Frontmatter image fields
const FM_IMAGE_FIELDS = [
  "featuredImage",
  "image",
  "ogImage",
  "heroImage",
  "cover",
  "thumbnail",
];

function relPath(abs) {
  return path.relative(ROOT, abs);
}

function findLineNumber(text, idx) {
  let line = 1;
  for (let i = 0; i < idx && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}

function isInternal(url) {
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (url.startsWith("https://roadmancycling.com")) return true;
  if (url.startsWith("https://www.roadmancycling.com")) return true;
  return false;
}

function isMailtoOrTel(url) {
  return /^(mailto:|tel:|javascript:|sms:)/i.test(url);
}

function isProtocolRelative(url) {
  return url.startsWith("//");
}

function normalizeInternal(url) {
  // Strip apex domain prefix
  const stripped = url
    .replace(/^https?:\/\/(www\.)?roadmancycling\.com/, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "");
  return stripped || "/";
}

function extractFragment(url) {
  const m = url.match(/#([^?]*)/);
  return m ? m[1] : null;
}

function processFile(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  const rel = relPath(filePath);
  const ext = path.extname(filePath);

  // Frontmatter for MDX
  let bodyStart = 0;
  if (ext === ".mdx" || ext === ".md") {
    const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (fm) {
      bodyStart = fm[0].length;
      // Image-like frontmatter fields
      for (const field of FM_IMAGE_FIELDS) {
        const m = fm[1].match(new RegExp(`^${field}:\\s*["']?([^\\n"']+)["']?`, "m"));
        if (m && m[1].trim() && !m[1].trim().startsWith("$")) {
          const url = m[1].trim();
          if (url.startsWith("/") || url.startsWith("http")) {
            pushLink({
              source: rel,
              line: 1 + (fm[1].slice(0, m.index).match(/\n/g) || []).length,
              raw: m[0],
              url,
              kind: "frontmatter-image",
              context: field,
            });
          }
        }
      }
      // relatedEpisodes: list of slugs
      const relEp = fm[1].match(/^relatedEpisodes:\s*\n((?:\s+-\s+\S+\n?)+)/m);
      if (relEp) {
        for (const m of relEp[1].matchAll(/-\s+(\S+)/g)) {
          pushLink({
            source: rel,
            line:
              1 + (fm[1].slice(0, relEp.index).match(/\n/g) || []).length,
            raw: m[0],
            url: `/podcast/${m[1].replace(/^['"]|['"]$/g, "")}`,
            kind: "related-episode-slug",
            context: "relatedEpisodes",
          });
        }
      }
      // recommendedResources: list (rare but supported)
      const recRes = fm[1].match(
        /^recommendedResources:\s*\n((?:\s+-[\s\S]*?(?=\n[a-zA-Z]|\n---|$))+)/m,
      );
      if (recRes) {
        for (const m of recRes[1].matchAll(/href:\s*["']?([^\s"'\n]+)/g)) {
          pushLink({
            source: rel,
            line:
              1 + (fm[1].slice(0, recRes.index).match(/\n/g) || []).length,
            raw: m[0],
            url: m[1],
            kind: "recommended-resource-href",
            context: "recommendedResources",
          });
        }
      }
    }
  }

  // For TS/TSX/JS files, skip extracting frontmatter image fields; use href patterns
  const body = text.slice(bodyStart);

  if (ext === ".mdx" || ext === ".md") {
    for (const m of body.matchAll(MD_LINK_RE)) {
      const url = m[1].split(/\s+/)[0];
      // Documentation templates occasionally use literal `(url)` as a field
      // placeholder. It is not a deployed link and should not pollute the
      // site-quality report.
      if (!url || url === "url" || url.startsWith("#")) continue;
      pushLink({
        source: rel,
        line: findLineNumber(text, bodyStart + m.index),
        raw: m[0].slice(0, 120),
        url,
        kind: "md-link",
      });
    }
    for (const m of body.matchAll(MD_IMG_RE)) {
      const url = m[1].split(/\s+/)[0];
      if (!url) continue;
      pushLink({
        source: rel,
        line: findLineNumber(text, bodyStart + m.index),
        raw: m[0].slice(0, 120),
        url,
        kind: "md-image",
      });
    }
    for (const m of body.matchAll(HTML_HREF_RE)) {
      pushLink({
        source: rel,
        line: findLineNumber(text, bodyStart + m.index),
        raw: m[0].slice(0, 120),
        url: m[1],
        kind: "html-href",
      });
    }
    for (const m of body.matchAll(IMG_SRC_RE)) {
      const url = m[1];
      if (url.startsWith("data:") || url.startsWith("{")) continue;
      pushLink({
        source: rel,
        line: findLineNumber(text, bodyStart + m.index),
        raw: m[0].slice(0, 120),
        url,
        kind: "html-img-src",
      });
    }
  } else if (
    ext === ".ts" ||
    ext === ".tsx" ||
    ext === ".js" ||
    ext === ".jsx" ||
    ext === ".mjs" ||
    ext === ".cjs"
  ) {
    // Strip line and block comments so example URLs in commentary don't
    // get flagged. Replace with same-length whitespace to preserve line
    // numbers from the original text used for findLineNumber.
    const stripped = body
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
      .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length))
      // Don't audit href on <link rel="preconnect|dns-prefetch|preload">
      // — these are connection hints, not navigable URLs.
      .replace(
        /<link\s+[^>]*\brel=["'](?:preconnect|dns-prefetch|preload|prefetch|modulepreload)["'][^>]*>/g,
        (m) => m.replace(/[^\n]/g, " "),
      );
    for (const m of stripped.matchAll(TS_HREF_RE)) {
      const url = m[1];
      if (
        !url ||
        url.startsWith("data:") ||
        url.startsWith("{") ||
        url.includes("${") ||
        // Templated path with route params, e.g. /coaching/:slug*
        /:[a-zA-Z_]/.test(url) ||
        // Not a URL at all — must start with /, ./, ../, or scheme
        !(/^(https?:|mailto:|tel:|sms:|javascript:|\/|#|\.\/|\.\.\/)/.test(url))
      )
        continue;
      pushLink({
        source: rel,
        line: findLineNumber(text, bodyStart + m.index),
        raw: m[0].slice(0, 120),
        url,
        kind: "ts-href",
      });
    }
    for (const m of stripped.matchAll(REDIRECT_DEST_RE)) {
      const url = m[1];
      if (
        !url ||
        url.includes("${") ||
        /:[a-zA-Z_]/.test(url) ||
        !(/^(https?:|\/)/.test(url))
      )
        continue;
      pushLink({
        source: rel,
        line: findLineNumber(text, m.index),
        raw: m[0].slice(0, 120),
        url,
        kind: "redirect-destination",
      });
    }
  }
}

function walkDir(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === ".git" ||
        entry.name === "dist" ||
        entry.name === ".claude" ||
        entry.name === "drizzle"
      )
        continue;
      out.push(...walkDir(full, predicate));
    } else if (entry.isFile() && predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function gatherSourceFiles() {
  const files = [];

  // 1. All MDX in content/
  files.push(
    ...walkDir(path.join(ROOT, "content"), (f) =>
      /\.(mdx|md)$/.test(f),
    ),
  );

  // 2. All TS/TSX/JS in src/
  files.push(
    ...walkDir(path.join(ROOT, "src"), (f) =>
      /\.(tsx?|jsx?|mjs|cjs|mdx|md)$/.test(f),
    ),
  );

  // 3. Workspace-root .md / .txt files
  for (const f of fs.readdirSync(ROOT)) {
    const full = path.join(ROOT, f);
    if (fs.statSync(full).isFile() && /\.(md|txt)$/.test(f)) {
      files.push(full);
    }
  }

  // 4. next.config.ts already covered by src/ walk? It lives at root.
  files.push(path.join(ROOT, "next.config.ts"));

  // 5. agents/, mcp-server/, scripts/ — walk for completeness
  for (const dir of ["agents", "mcp-server", "scripts"]) {
    files.push(
      ...walkDir(path.join(ROOT, dir), (f) =>
        /\.(tsx?|jsx?|mjs|cjs|mdx|md)$/.test(f),
      ),
    );
  }

  return [...new Set(files)];
}

const SOURCE_FILES = gatherSourceFiles();
log(`Scanning ${SOURCE_FILES.length} source files...`);
for (const file of SOURCE_FILES) {
  // Skip the audit script and report itself, test files, fixture data,
  // example/placeholder content in agent prompts, and audit reports
  // (which contain documentation example URLs, not real internal links).
  const rel = relPath(file);
  if (
    rel.endsWith("audit-links.mjs") ||
    rel.endsWith("audit-links-report.json") ||
    /\.test\.(tsx?|jsx?|mjs)$/.test(rel) ||
    (rel.startsWith("scripts/") && /audit/.test(rel) && rel.endsWith(".md")) ||
    rel.startsWith("scripts/audit-orphans.ts") ||
    rel.endsWith("audit-bugs.md") ||
    rel.endsWith("INDEXING-AUDIT.md") ||
    rel.startsWith("agents/transcript-indexer/prompts/") ||
    (rel.startsWith("agents/") && /fixture|example|test/i.test(rel))
  )
    continue;
  try {
    processFile(file);
  } catch (e) {
    log(`! Error processing ${rel}: ${e.message}`);
  }
}
log(`Extracted ${links.length} link references.`);

// ---------------------------------------------------------------------------
// 5. ANCHOR INDEX (header IDs per page)
// ---------------------------------------------------------------------------

/** Map of route path → Set of anchor IDs declared on that page. */
const ANCHOR_INDEX = new Map();

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function collectAnchorsForMdx(filePath, route) {
  const text = fs.readFileSync(filePath, "utf-8");
  const set = new Set();
  // Markdown headings
  for (const m of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    set.add(slugifyHeading(m[1].trim()));
  }
  // Explicit id=... in JSX/HTML tags inside MDX
  for (const m of text.matchAll(/\bid=["']([a-zA-Z0-9_-]+)["']/g)) {
    set.add(m[1]);
  }
  ANCHOR_INDEX.set(route, set);
}

// Index blog posts and topic pages — most anchored content.
for (const slug of BLOG_SLUGS) {
  const f = path.join(ROOT, "content/blog", `${slug}.mdx`);
  if (fs.existsSync(f)) collectAnchorsForMdx(f, `/blog/${slug}`);
}
for (const slug of PODCAST_SLUGS) {
  const f = path.join(ROOT, "content/podcast", `${slug}.mdx`);
  if (fs.existsSync(f)) collectAnchorsForMdx(f, `/podcast/${slug}`);
}
for (const slug of TOPIC_SLUGS) {
  const f = path.join(ROOT, "content/topics", `${slug}.mdx`);
  if (fs.existsSync(f)) collectAnchorsForMdx(f, `/topics/${slug}`);
}

// ---------------------------------------------------------------------------
// 6. EXTERNAL LINK CHECKER
// ---------------------------------------------------------------------------

const EXTERNAL_TIMEOUT_MS = 12_000;
const EXTERNAL_CONCURRENCY = 12;
const EXTERNAL_USER_AGENT =
  "Mozilla/5.0 (compatible; RoadmanLinkAudit/1.0; +https://roadmancycling.com)";

async function checkExternal(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), EXTERNAL_TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": EXTERNAL_USER_AGENT },
    });
    if (
      res.status === 405 ||
      res.status === 403 ||
      res.status === 400 ||
      res.status === 404 ||
      res.status === 501
    ) {
      // Many hosts return non-2xx to HEAD even when the URL is fine;
      // retry with GET. We discard the body — fetch() doesn't actually
      // read the stream until you await .text()/etc.
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": EXTERNAL_USER_AGENT },
      });
    }
    return { status: res.status, finalUrl: res.url, ok: res.ok };
  } catch (e) {
    return { status: 0, error: e.name === "AbortError" ? "timeout" : e.message };
  } finally {
    clearTimeout(t);
  }
}

async function runWithConcurrency(items, fn, concurrency) {
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

// ---------------------------------------------------------------------------
// 7. CLASSIFY EVERY LINK
// ---------------------------------------------------------------------------

const records = []; // {source,line,raw,url,kind,resolution,status,issue,suggestion}

for (const ref of links) {
  const url = ref.url;
  if (!url) continue;
  if (isMailtoOrTel(url)) {
    records.push({ ...ref, resolution: "skip", status: "ok", category: "mailto-or-tel" });
    continue;
  }
  if (isProtocolRelative(url)) {
    records.push({ ...ref, resolution: "skip", status: "ok", category: "protocol-relative" });
    continue;
  }
  if (url.startsWith("#")) {
    // Pure fragment — anchor on same page, hard to validate without page context. Skip.
    records.push({ ...ref, resolution: "skip", status: "ok", category: "fragment-only" });
    continue;
  }

  if (isInternal(url)) {
    const norm = normalizeInternal(url);
    const fragment = extractFragment(url);
    let cls = classifyInternalPath(norm);
    // Blog loading sanitises a missing local featuredImage to `undefined`,
    // which activates the guaranteed per-post Satori hero/OG fallback. Keep
    // the source reference visible in the full report, but do not call the
    // deployed page broken when the runtime deliberately replaces it.
    if (
      !cls.ok &&
      ref.kind === "frontmatter-image" &&
      ref.source.startsWith("content/blog/")
    ) {
      cls = { ok: true, type: "sanitized-blog-image-fallback" };
    }
    // These plan identifiers are inventory rows, not links: ResourceList
    // renders them as non-navigable COMING SOON items unless the href is an
    // absolute TrainingPeaks URL. Constrain the exception to that source.
    if (
      !cls.ok &&
      ref.source === "src/lib/method/modules.ts" &&
      norm.startsWith("/method/training-peaks/")
    ) {
      cls = { ok: true, type: "non-navigable-training-peaks-placeholder" };
    }
    let issue = null;
    let suggestion = null;
    if (!cls.ok) {
      issue = cls.type;
      // Heuristic suggestion: try slug-rename / common typos
      suggestion = suggestInternalFix(norm);
    } else if (fragment) {
      // Anchor check
      const anchors = ANCHOR_INDEX.get(norm);
      if (anchors && anchors.size > 0 && !anchors.has(fragment)) {
        // Tolerate id collisions where slugified heading matches w/ stripped puct
        const lc = fragment.toLowerCase();
        if (!anchors.has(lc)) {
          issue = "broken-anchor";
        }
      }
    }
    records.push({
      ...ref,
      resolution: "internal",
      status: issue ? "broken" : "ok",
      category: cls.type,
      classification: cls,
      fragment,
      issue,
      suggestion,
    });
  } else if (/^https?:\/\//.test(url)) {
    records.push({
      ...ref,
      resolution: "external",
      status: "pending",
      category: "external",
    });
  } else {
    // Asset path without leading slash, or weird input
    records.push({
      ...ref,
      resolution: "unknown-format",
      status: "broken",
      category: "unknown-format",
      issue: "non-absolute non-relative URL",
    });
  }
}

function suggestInternalFix(p) {
  // Very small heuristic library for known rename patterns.
  // Returns a candidate path or null.
  const known = {
    "/coaching/triathlon": "/coaching/triathletes",
    "/coaching/masters-cyclists": "/coaching/masters",
    "/coaching/sportive-riders": "/coaching/sportives",
    "/coaching/gravel-racers": "/coaching/gravel",
    "/blog/i-lost-7kg-eating-more-cycling":
      "/blog/cycling-weight-loss-fuel-for-the-work-required",
    "/blog/cycling-periodisation-training":
      "/blog/cycling-periodisation-plan-guide",
    "/tools/coach-or-app": "/compare/coach-vs-app",
    "/tools/plateau-diagnostic": "/plateau",
  };
  if (known[p]) return known[p];

  // /blog/ slug close-match
  if (p.startsWith("/blog/")) {
    const slug = p.slice("/blog/".length).split("/")[0];
    const close = closestSlug(slug, BLOG_SLUGS);
    if (close) return `/blog/${close}`;
  }
  if (p.startsWith("/podcast/")) {
    const slug = p.slice("/podcast/".length).split("/")[0];
    const close = closestSlug(slug, PODCAST_SLUGS);
    if (close) return `/podcast/${close}`;
  }
  if (p.startsWith("/guests/")) {
    const slug = p.slice("/guests/".length).split("/")[0];
    const close = closestSlug(slug, loadGuestSlugs());
    if (close) return `/guests/${close}`;
  }
  if (p.startsWith("/answers/")) {
    const slug = p.slice("/answers/".length).split("/")[0];
    const close = closestSlug(slug, ANSWER_SLUGS);
    if (close) return `/answers/${close}`;
  }
  if (p.startsWith("/watch/")) {
    const slug = p.slice("/watch/".length).split("/")[0];
    const close = closestSlug(slug, WATCH_SLUGS);
    if (close) return `/watch/${close}`;
  }
  return null;
}

function closestSlug(target, set) {
  let best = null;
  let bestDist = Infinity;
  const arr = [...set];
  for (const s of arr) {
    const d = levenshtein(target, s);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  // Only suggest if reasonably close (less than 25% of the longer length)
  if (best && bestDist / Math.max(target.length, best.length) <= 0.25) {
    return best;
  }
  return null;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

// ---------------------------------------------------------------------------
// 8. EXTERNAL CHECK PASS
// ---------------------------------------------------------------------------

if (!NO_EXTERNAL) {
  const externals = records.filter((r) => r.resolution === "external");
  // Dedupe by URL — many references point to the same external resource
  const uniqUrls = [...new Set(externals.map((r) => r.url))];
  log(`Checking ${uniqUrls.length} unique external URLs...`);
  const results = new Map();
  let done = 0;
  await runWithConcurrency(
    uniqUrls,
    async (url) => {
      const r = await checkExternal(url);
      results.set(url, r);
      done++;
      if (done % 25 === 0) vlog(`  external: ${done}/${uniqUrls.length}`);
    },
    EXTERNAL_CONCURRENCY,
  );
  for (const rec of externals) {
    const r = results.get(rec.url);
    if (!r) continue;
    if (r.error) {
      rec.status = "broken";
      rec.issue = `external-error:${r.error}`;
    } else if (r.status === 403 || r.status === 401 || r.status === 429) {
      // 403/401/429 are typically anti-bot or auth-required pages
      // (CloudFront, journal publishers, Skool, etc.). The URL is real;
      // the server is just blocking the audit user-agent. Mark as
      // "indeterminate" rather than broken.
      rec.status = "indeterminate";
      rec.issue = null;
    } else if (!r.ok) {
      // 404/5xx are real failures
      rec.status = "broken";
      rec.issue = `http-${r.status}`;
    } else {
      rec.status = "ok";
    }
    rec.httpStatus = r.status;
    if (r.finalUrl && r.finalUrl !== rec.url) rec.finalUrl = r.finalUrl;
  }
} else {
  for (const rec of records) {
    if (rec.resolution === "external") rec.status = "skipped-external";
  }
}

// ---------------------------------------------------------------------------
// 9. REDIRECT DESTINATION VALIDATION
// ---------------------------------------------------------------------------

// For redirects in next.config.ts, also classify the destination so dead
// destinations are flagged.
const REDIRECT_DEST_REPORT = [];
for (const r of REDIRECTS) {
  if (r.has) continue; // host-scoped, special-purpose
  const dest = r.destination;
  if (!isInternal(dest) || /:\w+/.test(dest)) {
    REDIRECT_DEST_REPORT.push({ source: r.source, destination: dest, ok: true, note: "external-or-templated" });
    continue;
  }
  const cls = classifyInternalPath(normalizeInternal(dest));
  REDIRECT_DEST_REPORT.push({
    source: r.source,
    destination: dest,
    ok: cls.ok,
    classification: cls,
  });
}

// ---------------------------------------------------------------------------
// 10. REPORT
// ---------------------------------------------------------------------------

const broken = records.filter((r) => r.status === "broken");
const okCount = records.filter((r) => r.status === "ok").length;
const skippedExternal = records.filter((r) => r.status === "skipped-external").length;
const indeterminate = records.filter((r) => r.status === "indeterminate").length;

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    references: records.length,
    ok: okCount,
    broken: broken.length,
    indeterminate,
    skippedExternal,
    external: records.filter((r) => r.resolution === "external").length,
    internal: records.filter((r) => r.resolution === "internal").length,
  },
  routeInventory: {
    staticRoutes: STATIC_ROUTES.size,
    blogSlugs: BLOG_SLUGS.size,
    podcastSlugs: PODCAST_SLUGS.size,
    guestSlugs: loadGuestSlugs().size,
    topicSlugs: TOPIC_SLUGS.size,
    entitySlugs: ENTITY_SLUGS.size,
    glossarySlugs: GLOSSARY_SLUGS.size,
    comparisonSlugs: COMPARISON_SLUGS.size,
    caseStudySlugs: CASE_STUDY_SLUGS.size,
    bestForSlugs: BEST_FOR_SLUGS.size,
    problemSlugs: PROBLEM_SLUGS.size,
    questionSlugs: QUESTION_SLUGS.size,
    answerSlugs: ANSWER_SLUGS.size,
    watchSlugs: WATCH_SLUGS.size,
    tourStageSlugs: TOUR_STAGE_SLUGS.size,
    tourHistorySlugs: TOUR_HISTORY_SLUGS.size,
    expertTopicPaths: EXPERT_TOPIC_PATHS.size,
    recommendationCategorySlugs: RECOMMENDATION_CATEGORY_SLUGS.size,
    recommendationProductPaths: RECOMMENDATION_PRODUCT_PATHS.size,
    eventGuideSlugs: EVENT_GUIDE_SLUGS.size,
    raceSlugs: RACE_SLUGS.size,
    coachingLocationSlugs: COACHING_LOCATION_SLUGS.size,
    toolSlugs: TOOL_SLUGS.size,
    redirects: REDIRECTS.length,
    rewrites: REWRITES.length,
  },
  redirectDestinations: REDIRECT_DEST_REPORT,
  brokenLinks: broken,
  allLinks: records,
};

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

// Console summary
const byCategory = {};
for (const b of broken) {
  const cat = b.issue || b.category || "other";
  byCategory[cat] = (byCategory[cat] || 0) + 1;
}

if (JSON_ONLY) {
  console.log(REPORT_PATH);
} else {
  log("");
  log("=".repeat(72));
  log("SITEWIDE LINK AUDIT");
  log("=".repeat(72));
  log(`References scanned: ${records.length}`);
  log(`OK:                 ${okCount}`);
  log(`Broken:             ${broken.length}`);
  log(`Indeterminate:      ${indeterminate} (anti-bot 401/403/429)`);
  log(`Skipped (external): ${skippedExternal}`);
  log("");
  log("Broken by category:");
  for (const [cat, n] of Object.entries(byCategory).sort(
    (a, b) => b[1] - a[1],
  )) {
    log(`  ${String(n).padStart(4)}  ${cat}`);
  }
  log("");
  log(`Full report: ${path.relative(process.cwd(), REPORT_PATH)}`);
  // Print first 25 broken for quick visibility
  if (broken.length > 0) {
    log("");
    log("First 25 broken links:");
    for (const b of broken.slice(0, 25)) {
      const where = `${b.source}:${b.line}`;
      const sug = b.suggestion ? `  → suggest ${b.suggestion}` : "";
      log(`  [${b.issue || b.category}] ${b.url}  (${where})${sug}`);
    }
  }
}

if (FAIL_ON_BROKEN && broken.length > 0) {
  process.exit(1);
}
