#!/usr/bin/env node
/**
 * scripts/populate-expert-frontmatter.mjs
 *
 * For every blog post that links to one or more /guests/[slug] entity
 * pages in its body, add (or refresh) an `experts` array in frontmatter
 * crediting the named experts cited. The blog page renders this via
 * EvidenceBlock — making E-E-A-T signals concrete instead of generic.
 *
 * Behaviour:
 *   - Skips posts with no expert mentions (leaves them on the default
 *     Anthony-only EvidenceBlock entry).
 *   - Replaces any previously-generated experts array (sentinel kept
 *     consistent because we re-derive from body each run).
 *   - Order in the array matches order of first appearance in the body.
 *
 * Run once after auto-linking; safe to re-run.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content/blog");

const EXPERTS = {
  "stephen-seiler": {
    name: "Prof. Stephen Seiler",
    role: "Sports scientist; polarised-training researcher",
  },
  "dan-lorang": {
    name: "Dan Lorang",
    role: "Head of Performance, Red Bull–Bora-Hansgrohe",
  },
  "greg-lemond": { name: "Greg LeMond", role: "3× Tour de France champion" },
  "joe-friel": { name: "Joe Friel", role: "Author, The Cyclist's Training Bible" },
  "lachlan-morton": {
    name: "Lachlan Morton",
    role: "EF Education–EasyPost; ultra-endurance specialist",
  },
  "dan-bigham": {
    name: "Dan Bigham",
    role: "Former Hour Record holder; aerodynamics engineer",
  },
  "tim-spector": {
    name: "Prof. Tim Spector",
    role: "Genetic epidemiologist; ZOE founder",
  },
  "ben-healy": { name: "Ben Healy", role: "EF Education–EasyPost pro" },
  "michael-matthews": {
    name: "Michael Matthews",
    role: "Jayco AlUla pro; sprinter–classics specialist",
  },
  "rosa-kloser": {
    name: "Rosa Klöser",
    role: "Pro racer; 2× German national champion",
  },
};

let updated = 0;
let skipped = 0;
let unchanged = 0;

for (const file of fs.readdirSync(DIR)) {
  if (!file.endsWith(".mdx")) continue;
  const fp = path.join(DIR, file);
  const raw = fs.readFileSync(fp, "utf-8");
  const parsed = matter(raw);
  const { content, data } = parsed;

  // Find expert citations in order of first appearance.
  const positions = [];
  for (const [slug, info] of Object.entries(EXPERTS)) {
    const link = "/guests/" + slug;
    const idx = content.indexOf(link);
    if (idx !== -1) {
      positions.push({
        slug,
        idx,
        entry: { name: info.name, role: info.role, href: link },
      });
    }
  }

  if (positions.length === 0) {
    skipped++;
    continue;
  }

  positions.sort((a, b) => a.idx - b.idx);
  const experts = positions.map((p) => p.entry);

  // Compare against existing to avoid no-op writes.
  const existing = JSON.stringify(data.experts ?? null);
  const next = JSON.stringify(experts);
  if (existing === next) {
    unchanged++;
    continue;
  }

  data.experts = experts;
  const out = matter.stringify(parsed.content, data, { lineWidth: 80 });
  fs.writeFileSync(fp, out);
  updated++;
}

console.log(`Updated:   ${updated}`);
console.log(`Unchanged: ${unchanged}`);
console.log(`Skipped:   ${skipped} (no expert citations)`);
