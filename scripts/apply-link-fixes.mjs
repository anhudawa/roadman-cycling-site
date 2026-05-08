#!/usr/bin/env node
// Apply confident link fixes identified by audit-links.mjs.
//
// This script encodes URL → URL rewrites that are unambiguous (typo
// fixes, slug renames, alias-related guest paths). For each fix we
// scan ALL source files and replace every occurrence in-place.
//
// Run after audit-links.mjs to apply automated fixes. Then re-run the
// audit to verify the broken count drops.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ----- URL → URL rewrites that are safe to apply globally. ---------------
// Each entry MUST be unique and unambiguous in URL form (i.e. the source URL
// is dead and the destination is a real route). Rewrites that depend on
// surrounding markdown structure are handled separately below.

const URL_REWRITES = [
  // ----- Guest slug fixes (alias drift / period normalisation) ------------
  ["/guests/sam-impey", "/guests/dr-sam-impey"],
  ["/guests/tim-podlogar", "/guests/dr-tim-podlogar"],
  ["/guests/filip-larsen", "/guests/dr-filip-larsen"],
  ["/guests/dr-david-dunne", "/guests/david-dunne"],

  // ----- Podcast slug fixes (renamed / shortened) -------------------------
  // ep-2537-... → renamed to drop the ep-2537 prefix
  [
    "/podcast/ep-2537-what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
    "/podcast/what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
  ],
  // ep-2090 was the working title; the published episode is ep-2217.
  // The Murchison appearance most-cited in the blog body is the longer
  // "What pros actually eat" episode. Use that for both stale refs.
  [
    "/podcast/ep-2090-michelin-chef-cycling-nutrition-alan-murchison",
    "/podcast/what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
  ],
  // ep-33 renamed to the canonical "untold story of how Trek silenced LeMond"
  [
    "/podcast/ep-33-trek-lemond-doping-dispute-cycling-history",
    "/podcast/ep-33-the-untold-story-of-how-trek-silenced-greg-lemond",
  ],
  // Courtney Conley episode has its full title slug
  [
    "/podcast/ep-courtney-conley-cycling-shoes-fit",
    "/podcast/ep-2107-the-surprising-downside-of-incorrect-cycling-shoes-courtney",
  ],

  // ----- Blog slug fixes (renames) ---------------------------------------
  [
    "/blog/british-cycling-toxic-culture-toxic-sports-culture",
    "/blog/british-cycling-toxic-culture-win-at-all-costs",
  ],
  [
    "/blog/maratona-dles-dolomites-training-plan",
    "/blog/maratona-dles-dolomites-training-guide",
  ],
  [
    "/blog/mallorca-312-training-plan",
    "/blog/mallorca-312-training-guide",
  ],
  // The "marmotte training plan" piece was never published; closest
  // training-plan content is the etape sportive guide.
  [
    "/blog/marmotte-training-plan-cyclists",
    "/blog/etape-du-tour-training-plan",
  ],
  [
    "/blog/la-marmotte-training-plan",
    "/blog/etape-du-tour-training-plan",
  ],
  // Zone 2 references — the canonical guide slug includes "complete"
  ["/blog/zone-2-training-cycling-guide", "/blog/zone-2-training-complete-guide"],
  // Overtraining slug normalised
  [
    "/blog/overtraining-vs-overreaching-cyclists",
    "/blog/cycling-overtraining-signs-guide",
  ],
  // Strength training catch-all renamed
  [
    "/blog/strength-training-for-cyclists-complete-guide",
    "/blog/cycling-strength-training-guide",
  ],
  // Race weight, fuelling, climbing references
  [
    "/blog/fuel-for-the-work-required-cycling",
    "/blog/cycling-weight-loss-fuel-for-the-work-required",
  ],
  [
    "/blog/race-weight-cycling-guide",
    "/blog/cycling-weight-loss-fuel-for-the-work-required",
  ],
  // Heart-rate vs power references → the actual zone-2 HR/power/RPE post
  [
    "/blog/heart-rate-vs-power-cycling",
    "/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe",
  ],
  // MTB suspension slug normalised
  [
    "/blog/mtb-suspension-setup-guide",
    "/blog/mtb-suspension-setup-complete-guide",
  ],
  // Race-day execution → race-day fuelling guide (closest published post)
  [
    "/blog/cycling-race-day-execution",
    "/blog/race-day-fuelling-24-hour-timeline",
  ],
  // Low-cadence torque-interval slug normalised
  [
    "/blog/low-cadence-torque-intervals-cycling",
    "/blog/low-cadence-training-cycling-torque-intervals",
  ],

  // ----- Topic hub fixes -------------------------------------------------
  // /topics/cycling-equipment doesn't exist; the closest is mountain-biking
  // (where most equipment guidance lives) — but the references are to bike-
  // fit / kit. Route to cycling-coaching as the broader fit/setup hub.
  ["/topics/cycling-equipment", "/topics/cycling-coaching"],

  // ----- Diagnostic / coaching CTA fixes ---------------------------------
  // /diagnostic isn't a route — the coaching assessment tool lives at
  // /assessment.
  ["/diagnostic", "/assessment"],

  // ----- Products redirect (kept as legacy) ------------------------------
  // /products/strength-training was a CF funnel; the new route is
  // /strength-training.
  ["/products/strength-training", "/strength-training"],
];

// ----- Slug-to-blog rewrites where the closest match is best-effort ------
// These are for problems.ts / landing-content.ts CTA hrefs where the
// originally-intended article wasn't published. Each is mapped to the
// closest topical post that exists today.
const BEST_EFFORT_BLOG_REWRITES = [
  // Bike-fit "saddle position" guide → existing fit guide
  [
    "/blog/bike-fit-saddle-position-guide",
    "/blog/bike-fit-one-change-amateurs-should-make",
  ],
  // Cleat position guide → numb-hands fit post (fit context)
  [
    "/blog/cycling-cleat-position-guide",
    "/blog/numb-hands-cycling-5-fixes-bike-fit",
  ],
  // Hand positions — same numb-hands article covers it
  [
    "/blog/road-cycling-hand-positions",
    "/blog/numb-hands-cycling-5-fixes-bike-fit",
  ],
  // Saddle selection guide → saddle-sore prevention (closest)
  [
    "/blog/cycling-saddle-selection-guide",
    "/blog/cycling-saddle-sore-prevention",
  ],
  // Bib shorts + chamois cream — saddle-sore prevention is the closest hub
  ["/blog/cycling-bib-shorts-guide", "/blog/cycling-saddle-sore-prevention"],
  ["/blog/cycling-chamois-cream-guide", "/blog/cycling-saddle-sore-prevention"],
  // Durability training — long-ride decoupling guide is the closest post
  [
    "/blog/cycling-durability-training",
    "/blog/aerobic-decoupling-cycling-cardiac-drift",
  ],
  // Electrolyte strategy → hydration guide
  ["/blog/cycling-electrolyte-strategy", "/blog/cycling-hydration-guide"],
  // Pacing climb → pacing topic in event-prep / climbing post (use base-training as foundational)
  [
    "/blog/how-to-pace-a-cycling-climb",
    "/blog/cycling-base-training-guide",
  ],
  // Bloodwork guide — overtraining signs cover the symptom-side; use that
  ["/blog/cycling-bloodwork-guide", "/blog/cycling-overtraining-signs-guide"],
  // RED-S guide — energy availability / fuelling post
  [
    "/blog/red-s-cycling-guide",
    "/blog/cycling-weight-loss-fuel-for-the-work-required",
  ],
  // Why cyclists can't lose weight (5 causes) → existing "5 fixable reasons" post or weight-loss-mistakes
  [
    "/blog/why-cyclists-cant-lose-weight-five-causes",
    "/blog/cycling-weight-loss-mistakes",
  ],
  // Bike fit basics & kit-for-beginners (referenced from beginners topic) →
  // the bike-fit one-change post and a beginner-friendly equivalent
  [
    "/blog/cycling-bike-fit-basics",
    "/blog/bike-fit-one-change-amateurs-should-make",
  ],
  [
    "/blog/cycling-kit-for-beginners",
    "/blog/bike-fit-one-change-amateurs-should-make",
  ],
  // Fuelling mistakes (beginners topic) → existing weight-loss-mistakes
  // post which covers under-fuelling failures
  [
    "/blog/cycling-fuelling-mistakes",
    "/blog/cycling-weight-loss-mistakes",
  ],
  // Compare slugs that don't exist → closest comparison
  [
    "/compare/polarised-vs-sweet-spot-training",
    "/compare/polarised-vs-pyramidal",
  ],
  [
    "/compare/strength-vs-endurance-cyclist",
    "/compare/strength-vs-more-miles",
  ],
  // Problem slug renames
  [
    "/problem/always-tired-on-the-bike",
    "/problem/tired-all-the-time",
  ],
  [
    "/problem/cant-lose-race-weight",
    "/problem/cant-lose-weight-cycling",
  ],
];

// ----- Apply rewrites --------------------------------------------------

const ALL_REWRITES = [...URL_REWRITES, ...BEST_EFFORT_BLOG_REWRITES];

// Which file extensions to touch
const EXT_RE = /\.(mdx|md|tsx?|jsx?|mjs|cjs|json|yaml|yml|txt)$/;

function walk(dir) {
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
      out.push(...walk(full));
    } else if (entry.isFile() && EXT_RE.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT).filter((f) => {
  const rel = path.relative(ROOT, f);
  return (
    !rel.startsWith("scripts/audit-links") &&
    !rel.startsWith("scripts/route-inventory") &&
    !rel.startsWith("scripts/apply-link-fixes") &&
    !rel.endsWith("audit-links-report.json") &&
    !rel.endsWith(".test.ts") &&
    !rel.endsWith(".test.tsx") &&
    !rel.endsWith(".test.mjs")
  );
});

let totalFiles = 0;
let totalReplacements = 0;
const fileChanges = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf-8");
  let updated = text;
  let fileChanged = false;
  let count = 0;
  for (const [from, to] of ALL_REWRITES) {
    // URL boundary: the match must start at a position preceded by a
    // URL-attribute boundary (open paren, quote, whitespace, =, >, etc.)
    // and end at one too. This prevents `/diagnostic` from matching
    // inside `/admin/diagnostic` and similar.
    const re = new RegExp(
      "(^|[(\\[\"'`\\s=>])" +
        escapeRegex(from) +
        "(?=[)\\]\"'`\\s,;>?#]|$)",
      "g",
    );
    const before = updated;
    let c = 0;
    updated = updated.replace(re, (m, boundary) => {
      c++;
      return boundary + to;
    });
    if (c > 0) {
      count += c;
      fileChanged = true;
    }
  }
  if (fileChanged) {
    fs.writeFileSync(file, updated);
    totalFiles++;
    totalReplacements += count;
    fileChanges.push({ file: path.relative(ROOT, file), replacements: count });
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function countMatches(s, re) {
  return (s.match(re) || []).length;
}

console.log(`Files modified: ${totalFiles}`);
console.log(`Total replacements: ${totalReplacements}`);
for (const c of fileChanges.slice(0, 50)) {
  console.log(`  ${c.replacements.toString().padStart(3)}x  ${c.file}`);
}
if (fileChanges.length > 50) {
  console.log(`  ... and ${fileChanges.length - 50} more files`);
}
