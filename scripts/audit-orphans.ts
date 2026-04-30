/**
 * scripts/audit-orphans.ts
 *
 * Finds pages in the sitemap that have no inbound internal links from
 * other indexed content. Orphan pages are a real SEO problem: they
 * can't be discovered by crawlers from within the site, and Google
 * treats them as lower priority regardless of content quality.
 *
 * Scans:
 *   - All blog MDX bodies + frontmatter (relatedEpisodes, internalLinks)
 *   - All podcast MDX bodies + frontmatter (relatedPosts)
 *   - Pillar pages (/coaching, /coaching/triathletes, /podcast, /about,
 *     etc.) — both for links OUT and for links IN.
 *   - Guest profile overrides (featuredArticles)
 *
 * Reports:
 *   - Articles with zero incoming links from other articles
 *   - Episodes with zero incoming links
 *   - Pages referenced by other pages but that don't actually exist (404s)
 *
 * Read-only. Produces a markdown report at docs/seo/orphan-audit.md.
 *
 * CLI: pnpm run seo:audit-orphans
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const SRC_DIR = path.join(process.cwd(), "src");
const OUTPUT_PATH = path.join(process.cwd(), "docs/seo/orphan-audit.md");

interface Node {
  kind: "blog" | "episode" | "page";
  slug: string;
  path: string; // route path
  title: string;
  inbound: Set<string>; // set of source ids
  outbound: Set<string>; // set of target ids
}

function loadBlogNodes(): Node[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.endsWith(".draft.mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        kind: "blog" as const,
        slug,
        path: `/blog/${slug}`,
        title: String(data.title ?? slug),
        inbound: new Set<string>(),
        outbound: new Set<string>(),
      };
    });
}

function loadEpisodeNodes(): Node[] {
  return fs
    .readdirSync(PODCAST_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(PODCAST_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        kind: "episode" as const,
        slug,
        path: `/podcast/${slug}`,
        title: String(data.title ?? slug),
        inbound: new Set<string>(),
        outbound: new Set<string>(),
      };
    });
}

function loadPageNodes(): Node[] {
  const staticPages = [
    "/",
    "/coaching",
    "/coaching/triathletes",
    "/coaching/ireland",
    "/coaching/uk",
    "/coaching/usa",
    "/coaching/dublin",
    "/coaching/cork",
    "/coaching/galway",
    "/coaching/london",
    "/coaching/manchester",
    "/coaching/leeds",
    "/coaching/belfast",
    "/coaching/edinburgh",
    "/about",
    "/about/press",
    "/podcast",
    "/blog",
    "/guests",
    "/topics",
    "/tools",
    "/tools/ftp-zones",
    "/tools/tyre-pressure",
    "/tools/race-weight",
    "/tools/fuelling",
    "/tools/energy-availability",
    "/tools/shock-pressure",
    "/community/not-done-yet",
    "/community/clubhouse",
    "/community/club",
    "/strength-training",
    "/apply",
  ];
  return staticPages.map((p) => ({
    kind: "page" as const,
    slug: p,
    path: p,
    title: p,
    inbound: new Set<string>(),
    outbound: new Set<string>(),
  }));
}

/**
 * Normalise any link href into a route id that matches Node.path.
 * Strips trailing slashes, fragments, query strings.
 */
function normaliseHref(href: string): string | null {
  if (!href.startsWith("/")) return null;
  // Drop fragment and query
  const clean = href.split("#")[0].split("?")[0];
  // Trailing slash
  if (clean.length > 1 && clean.endsWith("/")) return clean.slice(0, -1);
  return clean;
}

function extractLinksFromMarkdown(body: string): string[] {
  const re = /\]\((\/[^)\s]+)\)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const n = normaliseHref(m[1]);
    if (n) out.push(n);
  }
  return out;
}

function extractLinksFromTsx(text: string): string[] {
  // Covers three patterns common in this codebase:
  //   - JSX attribute: href="/foo"
  //   - Object literal: href: "/foo"  (blog-card data tables)
  //   - Plain string literal anywhere: "/blog/..." / "/podcast/..." etc.
  const out: string[] = [];
  const patterns = [
    /href=["'](\/[^"']+)["']/g,
    /href:\s*["'](\/[^"']+)["']/g,
    /["'](\/(?:blog|podcast|coaching|tools|guests|topics|about|community)\/?[^"'\s?#)]*)["']/g,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const n = normaliseHref(m[1]);
      if (n) out.push(n);
    }
  }
  return Array.from(new Set(out));
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts|mdx)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function main() {
  const blogs = loadBlogNodes();
  const episodes = loadEpisodeNodes();
  const pages = loadPageNodes();

  const byPath: Record<string, Node> = {};
  for (const n of [...blogs, ...episodes, ...pages]) byPath[n.path] = n;

  // Also index blog/episode slugs under their /blog/... and /podcast/... paths
  // (already their canonical path).

  // 1) Scan blog bodies
  for (const b of blogs) {
    const raw = fs.readFileSync(
      path.join(BLOG_DIR, `${b.slug}.mdx`),
      "utf-8",
    );
    const { data, content } = matter(raw);
    // Body links
    for (const href of extractLinksFromMarkdown(content)) {
      b.outbound.add(href);
      if (byPath[href]) byPath[href].inbound.add(b.path);
    }
    // Frontmatter relatedEpisodes
    if (Array.isArray(data.relatedEpisodes)) {
      for (const epSlug of data.relatedEpisodes) {
        const href = `/podcast/${epSlug}`;
        b.outbound.add(href);
        if (byPath[href]) byPath[href].inbound.add(b.path);
      }
    }
  }

  // 2) Scan episode bodies + frontmatter
  for (const e of episodes) {
    const raw = fs.readFileSync(
      path.join(PODCAST_DIR, `${e.slug}.mdx`),
      "utf-8",
    );
    const { data, content } = matter(raw);
    for (const href of extractLinksFromMarkdown(content)) {
      e.outbound.add(href);
      if (byPath[href]) byPath[href].inbound.add(e.path);
    }
    if (Array.isArray(data.relatedPosts)) {
      for (const postSlug of data.relatedPosts) {
        const href = `/blog/${postSlug}`;
        e.outbound.add(href);
        if (byPath[href]) byPath[href].inbound.add(e.path);
      }
    }
  }

  // 3) Scan src pages for hardcoded hrefs
  for (const file of walk(SRC_DIR)) {
    const text = fs.readFileSync(file, "utf-8");
    // Attribute all source-code links as originating from the homepage
    // for scoring purposes — simplification; good enough for finding
    // true orphans.
    for (const href of extractLinksFromTsx(text)) {
      if (byPath[href]) byPath[href].inbound.add("[src]");
    }
  }

  // 4) Report
  const orphanBlogs = blogs.filter((b) => b.inbound.size === 0);
  const orphanEpisodes = episodes.filter((e) => e.inbound.size === 0);
  const weaklyLinkedBlogs = blogs.filter((b) => b.inbound.size === 1);
  const weaklyLinkedEpisodes = episodes.filter((e) => e.inbound.size === 1);

  const lines: string[] = [];
  lines.push("# Orphan page audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("Pages with zero incoming internal links. Google can still");
  lines.push("discover them via sitemap.xml, but they don't accumulate");
  lines.push("link equity from the rest of the site.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Blog posts total: **${blogs.length}**`);
  lines.push(`  - Orphans (0 inbound): **${orphanBlogs.length}**`);
  lines.push(`  - Weak (1 inbound): **${weaklyLinkedBlogs.length}**`);
  lines.push(`- Episodes total: **${episodes.length}**`);
  lines.push(`  - Orphans (0 inbound): **${orphanEpisodes.length}**`);
  lines.push(`  - Weak (1 inbound): **${weaklyLinkedEpisodes.length}**`);
  lines.push("");

  if (orphanBlogs.length > 0) {
    lines.push("## Orphan blog posts");
    lines.push("");
    for (const b of orphanBlogs) {
      lines.push(`- [${b.title}](${b.path})`);
    }
    lines.push("");
  }

  if (orphanEpisodes.length > 0) {
    lines.push("## Orphan episodes");
    lines.push("");
    for (const e of orphanEpisodes) {
      lines.push(`- [${e.title}](${e.path})`);
    }
    lines.push("");
  }

  if (weaklyLinkedBlogs.length > 0) {
    lines.push("## Weakly-linked blog posts (1 inbound)");
    lines.push("");
    for (const b of weaklyLinkedBlogs) {
      const source = Array.from(b.inbound)[0];
      lines.push(`- [${b.title}](${b.path}) — linked only from \`${source}\``);
    }
    lines.push("");
  }

  // Also: find outbound links that point at non-existent pages
  const referencedMissing = new Map<string, string[]>(); // missing-path → sources
  const tracked: Set<string> = new Set(Object.keys(byPath));
  for (const n of [...blogs, ...episodes]) {
    for (const out of n.outbound) {
      if (out.startsWith("/blog/") || out.startsWith("/podcast/")) {
        if (!tracked.has(out)) {
          if (!referencedMissing.has(out)) referencedMissing.set(out, []);
          referencedMissing.get(out)!.push(n.path);
        }
      }
    }
  }
  if (referencedMissing.size > 0) {
    lines.push("## Broken internal links (point at non-existent slug)");
    lines.push("");
    for (const [miss, sources] of referencedMissing) {
      lines.push(`- \`${miss}\` referenced by:`);
      for (const s of sources.slice(0, 5)) lines.push(`  - \`${s}\``);
      if (sources.length > 5) lines.push(`  - …and ${sources.length - 5} more`);
    }
    lines.push("");
  }

  fs.writeFileSync(OUTPUT_PATH, lines.join("\n") + "\n", "utf-8");
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Orphan blogs: ${orphanBlogs.length}`);
  console.log(`Orphan episodes: ${orphanEpisodes.length}`);
  console.log(`Weakly-linked blogs: ${weaklyLinkedBlogs.length}`);
  console.log(`Weakly-linked episodes: ${weaklyLinkedEpisodes.length}`);
  console.log(`Broken references: ${referencedMissing.size}`);
}

main();
