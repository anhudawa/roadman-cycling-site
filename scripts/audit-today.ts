/* Temp audit script — validates today's content for SEO/structured-data robustness. */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getAllPosts } from "../src/lib/blog";
import { getAllEpisodeSlugs } from "../src/lib/podcast";
import { getAllTopicSlugs } from "../src/lib/topics";
import { getAllGuests } from "../src/lib/guests";

const ROOT = process.cwd();
const blogSlugs = new Set(getAllPosts().map((p) => p.slug));
const epSlugs = new Set(getAllEpisodeSlugs());
const topicSlugs = new Set(getAllTopicSlugs());
const guestSlugs = new Set(getAllGuests().map((g) => g.slug));

// Today's touched content files (blog + topics)
const touched = execSync(
  `git log --since="2026-06-09 00:00" --name-only --pretty=format:"" -- content/blog content/topics`,
  { encoding: "utf8" },
)
  .split("\n")
  .map((s) => s.trim())
  .filter((f) => f.endsWith(".mdx"))
  .filter((f, i, a) => a.indexOf(f) === i)
  .filter((f) => fs.existsSync(path.join(ROOT, f)));

type Issue = { file: string; kind: string; detail: string };
const issues: Issue[] = [];
const add = (file: string, kind: string, detail: string) =>
  issues.push({ file, kind, detail });

const publicExists = (p: string) => {
  const clean = p.split("?")[0].split("#")[0];
  return fs.existsSync(path.join(ROOT, "public", clean));
};

// Validate an internal href against known slug registries; return null if OK, else reason
function checkHref(href: string): string | null {
  const url = href.split("#")[0].split("?")[0].replace(/\/$/, "");
  if (!url.startsWith("/")) return null; // external or anchor
  const seg = url.split("/").filter(Boolean);
  if (seg.length === 0) return null; // home
  const [base, slug] = seg;
  if (base === "blog" && slug)
    return blogSlugs.has(slug) ? null : `blog slug not found: ${slug}`;
  if (base === "podcast" && slug && seg.length === 2)
    return epSlugs.has(slug) ? null : `podcast slug not found: ${slug}`;
  if (base === "topics" && slug)
    return topicSlugs.has(slug) ? null : `topic slug not found: ${slug}`;
  if (base === "guests" && slug)
    return guestSlugs.has(slug) ? null : `guest slug not found: ${slug}`;
  return null; // other routes (tools, marketing) — not validated here
}

for (const file of touched) {
  const raw = fs.readFileSync(path.join(ROOT, file), "utf8");
  const { data: fm, content } = matter(raw);
  const isTopic = file.startsWith("content/topics/");

  // --- Meta description ---
  const desc: string | undefined = fm.seoDescription || fm.description;
  if (!isTopic) {
    if (!desc) add(file, "meta", "missing seoDescription");
    else if (desc.length > 160)
      add(file, "meta", `seoDescription ${desc.length} chars (>160)`);
    if (!fm.seoTitle && !fm.title) add(file, "meta", "missing title/seoTitle");
  }

  // --- Heading hierarchy: no H1 in body (page renders title as H1) ---
  const h1s = content.match(/^# (?!#)/gm) || [];
  if (h1s.length > 0) add(file, "heading", `${h1s.length} body H1 (#) found`);
  // jumps from h2 to h4 etc.
  const headings = [...content.matchAll(/^(#{2,6}) /gm)].map(
    (m) => m[1].length,
  );
  let prev = 2;
  headings.forEach((lvl) => {
    if (lvl > prev + 1)
      add(file, "heading", `heading jump H${prev}→H${lvl}`);
    prev = lvl;
  });

  // --- relatedPosts / relatedEpisodes / relatedTopics ---
  for (const s of (fm.relatedPosts as string[]) || [])
    if (!blogSlugs.has(s)) add(file, "related", `relatedPosts → missing blog: ${s}`);
  for (const s of (fm.relatedEpisodes as string[]) || [])
    if (!epSlugs.has(s))
      add(file, "related", `relatedEpisodes → missing episode: ${s}`);
  for (const s of (fm.relatedTopics as string[]) || [])
    if (!topicSlugs.has(s))
      add(file, "related", `relatedTopics → missing topic: ${s}`);

  // --- experts[].href ---
  for (const e of (fm.experts as Array<{ href?: string }>) || [])
    if (e.href) {
      const r = checkHref(e.href);
      if (r) add(file, "link", `experts href → ${r}`);
    }

  // --- featuredImage exists ---
  if (fm.featuredImage && typeof fm.featuredImage === "string") {
    if (fm.featuredImage.startsWith("/") && !publicExists(fm.featuredImage))
      add(file, "image", `featuredImage missing in public: ${fm.featuredImage}`);
  }

  // --- Body internal markdown links ---
  for (const m of content.matchAll(/\[[^\]]*\]\((\/[^)]+)\)/g)) {
    const r = checkHref(m[1]);
    if (r) add(file, "link", `body link → ${r}`);
  }
  // --- Body markdown images missing alt ---
  for (const m of content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    if (!m[1].trim()) add(file, "image", `image missing alt: ${m[2]}`);
    if (m[2].startsWith("/") && !publicExists(m[2]))
      add(file, "image", `body image missing in public: ${m[2]}`);
  }
}

console.log(`Audited ${touched.length} today-touched content files.\n`);
const byKind: Record<string, Issue[]> = {};
for (const i of issues) (byKind[i.kind] ||= []).push(i);
if (!issues.length) {
  console.log("✅ No issues found.");
} else {
  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`\n## ${kind.toUpperCase()} (${list.length})`);
    for (const i of list) console.log(`  ${i.file}\n     ${i.detail}`);
  }
  console.log(`\nTOTAL ISSUES: ${issues.length}`);
}
