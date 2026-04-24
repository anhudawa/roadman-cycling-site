#!/usr/bin/env node
/**
 * link-first-expert-mentions.mjs
 *
 * For every blog post in content/blog/*.mdx, find the FIRST occurrence of
 * each priority expert's name in the body (post-frontmatter) and wrap it
 * in a markdown link to /guests/<slug>.
 *
 * Skips:
 *  - The frontmatter block (everything between the opening and closing ---).
 *  - Any occurrence already inside a link (e.g. `[Stephen Seiler](...)` or
 *    `…/stephen-seiler)…`).
 *  - Bibliography-style "PubMed: Seiler" lines.
 *
 * Idempotent: running it twice is a no-op because every match it would
 * make has already become a link.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BLOG_DIR = path.resolve(__dirname, "..", "content", "blog");

const EXPERTS = [
  { name: "Professor Stephen Seiler", slug: "stephen-seiler" },
  { name: "Stephen Seiler", slug: "stephen-seiler" },
  { name: "Dan Lorang", slug: "dan-lorang" },
  { name: "Joe Friel", slug: "joe-friel" },
  { name: "Greg LeMond", slug: "greg-lemond" },
  { name: "Lachlan Morton", slug: "lachlan-morton" },
  { name: "Dan Bigham", slug: "dan-bigham" },
  { name: "Tim Spector", slug: "tim-spector" },
  { name: "Ben Healy", slug: "ben-healy" },
  { name: "Michael Matthews", slug: "michael-matthews" },
  { name: "Rosa Klöser", slug: "rosa-kloser" },
  { name: "John Wakefield", slug: "john-wakefield" },
  { name: "David Dunne", slug: "david-dunne" },
];

function splitFrontmatter(src) {
  if (!src.startsWith("---")) return { frontmatter: "", body: src };
  const end = src.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: "", body: src };
  const closingNewline = src.indexOf("\n", end + 4);
  const split = closingNewline === -1 ? src.length : closingNewline + 1;
  return {
    frontmatter: src.slice(0, split),
    body: src.slice(split),
  };
}

/**
 * Find the first occurrence of `name` in `body` that is NOT already
 * inside a markdown link, NOT inside a URL, NOT inside a code block, and
 * NOT in a heading. Returns the index, or -1 if no match.
 */
function findFirstFreeMention(body, name) {
  // Build a regex that requires the name to be a standalone phrase —
  // bordered by non-word chars (but allowing punctuation either side).
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^\\w/-])(${escaped})(?=[\\s.,;:!?'")\\u2014\\u2013-]|$)`, "g");
  let match;
  while ((match = re.exec(body)) !== null) {
    const idx = match.index + match[1].length;
    // Reject if inside a link text like [Stephen Seiler]
    const before = body.slice(Math.max(0, idx - 1), idx);
    if (before === "[") continue;
    // Reject if inside a link target — look for unmatched `(` before `)`
    // on the same line up to this index.
    const lineStart = body.lastIndexOf("\n", idx) + 1;
    const lineToHere = body.slice(lineStart, idx);
    const openParen = lineToHere.lastIndexOf("(");
    const closeParen = lineToHere.lastIndexOf(")");
    if (openParen > closeParen) continue;
    // Reject inside a code fence
    const before100 = body.slice(0, idx);
    const fenceCount = (before100.match(/```/g) || []).length;
    if (fenceCount % 2 === 1) continue;
    // Reject inside inline code (count backticks on same line)
    const ticksOnLine = (lineToHere.match(/`/g) || []).length;
    if (ticksOnLine % 2 === 1) continue;
    // Reject inside a heading line that already has bold/inline emphasis
    if (/^#+ /.test(body.slice(lineStart, lineStart + 6))) continue;
    // Reject if the immediately surrounding text already contains the slug
    // (e.g. someone already linked it via a different display name).
    return idx;
  }
  return -1;
}

let totalEdits = 0;
let filesEdited = 0;
const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

for (const file of files) {
  const fullPath = path.join(BLOG_DIR, file);
  const original = fs.readFileSync(fullPath, "utf-8");
  const { frontmatter, body } = splitFrontmatter(original);

  let nextBody = body;
  let edits = 0;

  for (const expert of EXPERTS) {
    // Skip if a link to this guest's page already exists in the body —
    // their first mention is already linked somewhere.
    if (nextBody.includes(`/guests/${expert.slug}`)) continue;
    const idx = findFirstFreeMention(nextBody, expert.name);
    if (idx === -1) continue;
    const matched = nextBody.slice(idx, idx + expert.name.length);
    const replacement = `[${matched}](/guests/${expert.slug})`;
    nextBody =
      nextBody.slice(0, idx) +
      replacement +
      nextBody.slice(idx + expert.name.length);
    edits++;
  }

  if (edits > 0) {
    fs.writeFileSync(fullPath, frontmatter + nextBody);
    filesEdited++;
    totalEdits += edits;
    console.log(`  ${file}: +${edits} expert link${edits > 1 ? "s" : ""}`);
  }
}

console.log(
  `\nDone. ${filesEdited} files updated, ${totalEdits} expert links added.`,
);
