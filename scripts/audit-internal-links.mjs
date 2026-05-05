#!/usr/bin/env node
// Audit internal-link coverage across content/blog/*.mdx
// Categories: tool, commercial, blog
// Priority: posts with answerCapsule + faq (highest-traffic / structured)

import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.resolve(
  process.cwd(),
  "content/blog"
);

const TOOL_PATTERNS = [
  /\(\/predict\b/,
  /\(\/tools\/[a-z0-9-]+/,
  /\(\/tools\)/,
  /\(\/ask\)/,
  /\(\/plateau\)/,
  /\(\/find-your-fit\)/,
  /\(\/assessment\)/,
  /\(\/benchmarks\)/,
  /\(\/diagnostic\b/,
];

const COMMERCIAL_PATTERNS = [
  /\(\/coaching\b/,
  /\(\/community\/not-done-yet\b/,
  /\(\/not-done-yet\b/,
  /\(\/inner-circle\b/,
  /\(\/training-camps\b/,
  /\(\/strength-training\b/,
  /\(\/apps-vs-coaching\b/,
  /\(\/event-prep\b/,
];

const BLOG_LINK_RE = /\(\/blog\/([a-z0-9-]+)/g;

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { frontmatter: "", body: text };
  return { frontmatter: m[1], body: text.slice(m[0].length) };
}

function hasField(fm, name) {
  // Top-level YAML key, allows multiline.
  const re = new RegExp(`^${name}:\\s*`, "m");
  return re.test(fm);
}

function getFrontmatterTags(fm) {
  // Extract pillar, tags list, keywords list (loose YAML scan)
  const get = (name) => {
    const m = fm.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : "";
  };
  return {
    pillar: get("pillar"),
    title: get("title").replace(/^['"]|['"]$/g, ""),
    date: get("date"),
  };
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .sort();

const results = [];

for (const file of files) {
  const full = path.join(BLOG_DIR, file);
  const text = fs.readFileSync(full, "utf-8");
  const { frontmatter, body } = parseFrontmatter(text);
  const meta = getFrontmatterTags(frontmatter);

  const hasAnswerCapsule = hasField(frontmatter, "answerCapsule");
  const hasFaq = hasField(frontmatter, "faq");
  const hasKeyTakeaways = hasField(frontmatter, "keyTakeaways");

  const toolLinks = TOOL_PATTERNS.flatMap((re) => {
    const m = body.match(new RegExp(re, "g"));
    return m ? m : [];
  });
  const commercialLinks = COMMERCIAL_PATTERNS.flatMap((re) => {
    const m = body.match(new RegExp(re, "g"));
    return m ? m : [];
  });

  const blogLinks = [...body.matchAll(BLOG_LINK_RE)].map((m) => m[1]);
  const ownSlug = file.replace(/\.mdx$/, "");
  const otherBlogLinks = blogLinks.filter((s) => s !== ownSlug);

  const priority =
    hasAnswerCapsule && hasFaq ? "high" : hasAnswerCapsule || hasFaq ? "medium" : "low";

  const missingTool = toolLinks.length < 1;
  const missingBlog = otherBlogLinks.length < 2;
  const missingCommercial = commercialLinks.length < 1;
  const needsWork = missingTool || missingBlog || missingCommercial;

  results.push({
    file,
    slug: ownSlug,
    title: meta.title,
    pillar: meta.pillar,
    date: meta.date,
    priority,
    hasAnswerCapsule,
    hasFaq,
    hasKeyTakeaways,
    toolLinkCount: toolLinks.length,
    commercialLinkCount: commercialLinks.length,
    blogLinkCount: otherBlogLinks.length,
    missingTool,
    missingBlog,
    missingCommercial,
    needsWork,
  });
}

const totals = {
  total: results.length,
  needsWork: results.filter((r) => r.needsWork).length,
  highPriority: results.filter((r) => r.priority === "high").length,
  highPriorityNeedsWork: results.filter((r) => r.priority === "high" && r.needsWork)
    .length,
  missingTool: results.filter((r) => r.missingTool).length,
  missingBlog: results.filter((r) => r.missingBlog).length,
  missingCommercial: results.filter((r) => r.missingCommercial).length,
};

const action = process.argv[2] || "summary";

if (action === "summary") {
  console.log(JSON.stringify(totals, null, 2));
} else if (action === "high-priority-needs-work") {
  const list = results
    .filter((r) => r.priority === "high" && r.needsWork)
    .map((r) => ({
      slug: r.slug,
      pillar: r.pillar,
      missingTool: r.missingTool,
      missingBlog: r.missingBlog,
      missingCommercial: r.missingCommercial,
      blogLinkCount: r.blogLinkCount,
      toolLinkCount: r.toolLinkCount,
      commercialLinkCount: r.commercialLinkCount,
    }));
  console.log(JSON.stringify(list, null, 2));
} else if (action === "all-needs-work") {
  const list = results
    .filter((r) => r.needsWork)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .map((r) => ({
      slug: r.slug,
      priority: r.priority,
      pillar: r.pillar,
      missing: [
        r.missingTool && "tool",
        r.missingBlog && `blog(${r.blogLinkCount}/2)`,
        r.missingCommercial && "commercial",
      ].filter(Boolean),
    }));
  console.log(JSON.stringify(list, null, 2));
} else if (action === "csv") {
  console.log(
    "slug,priority,pillar,toolLinkCount,blogLinkCount,commercialLinkCount,missingTool,missingBlog,missingCommercial,needsWork"
  );
  for (const r of results) {
    console.log(
      [
        r.slug,
        r.priority,
        r.pillar,
        r.toolLinkCount,
        r.blogLinkCount,
        r.commercialLinkCount,
        r.missingTool,
        r.missingBlog,
        r.missingCommercial,
        r.needsWork,
      ].join(",")
    );
  }
}
