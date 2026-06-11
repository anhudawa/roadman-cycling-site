import fs from "node:fs";
import path from "node:path";
import { getAllAnswers } from "@/lib/answers";
import { getAllTopicSlugs } from "@/lib/topics";
import { getAllComparisonSlugs } from "@/lib/comparisons";

// Episode / guest / blog slugs come from a citation pack built straight off
// real MDX frontmatter (scripts/build-citation-pack.mjs). Topic, comparison
// and tool slugs are derived from the live route sources so the validator can
// never drift from what actually ships — no hand-maintained namespace list.
const pack = JSON.parse(fs.readFileSync("/tmp/citation-pack.json", "utf8"));

const episodeSet = new Set<string>(pack.episodes.map((e: any) => e.slug));
const guestSet = new Set<string>(pack.guests.map((g: any) => g.slug));
const blogSet = new Set<string>(pack.blog.map((b: any) => b.slug));
const hubSet = new Set<string>(getAllTopicSlugs());
const compareSet = new Set<string>(getAllComparisonSlugs());

// Real tool routes = directories under src/app/(content)/tools that hold a page.
const TOOLS_DIR = path.join(process.cwd(), "src/app/(content)/tools");
const toolSet = new Set<string>(
  fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "[slug]")
    .map((d) => d.name)
);

const answers = getAllAnswers();
const answerSlugs = new Set<string>(answers.map((a) => a.slug));

const validClusters = new Set([
  "ftp","zone2","nutrition","strength","recovery","masters",
  "racing","periodisation","power","mental","bikefit","heat",
]);
// route families that are real but not in the closed lists above
const allowExactPaths = new Set([
  "/plateau","/strength-training","/ask","/answers","/experts","/guests",
]);

const problems: string[] = [];
const slugSeen = new Map<string, number>();

function checkHref(href: string, ctx: string) {
  if (allowExactPaths.has(href)) return;
  const m = href.match(/^\/([a-z0-9-]+)\/(.+)$/);
  if (!m) {
    // single-segment like /plateau handled above; anything else flag
    if (!href.startsWith("/")) problems.push(`${ctx}: malformed href "${href}"`);
    return;
  }
  const [, fam, rest] = m;
  const slug = rest.replace(/\/$/, "").split("#")[0];
  switch (fam) {
    case "blog": if (!blogSet.has(slug)) problems.push(`${ctx}: /blog/${slug} NOT a real blog post`); break;
    case "topics": if (!hubSet.has(slug)) problems.push(`${ctx}: /topics/${slug} NOT a real hub`); break;
    case "tools": if (!toolSet.has(slug)) problems.push(`${ctx}: /tools/${slug} NOT a real tool`); break;
    case "compare": if (!compareSet.has(slug)) problems.push(`${ctx}: /compare/${slug} NOT a real comparison`); break;
    case "answers": if (!answerSlugs.has(slug)) problems.push(`${ctx}: /answers/${slug} NOT an existing answer`); break;
    case "podcast": if (!episodeSet.has(slug)) problems.push(`${ctx}: /podcast/${slug} NOT a real episode`); break;
    case "question": break; // dynamic Q&A family — allowed
    case "guests": if (!guestSet.has(slug)) problems.push(`${ctx}: /guests/${slug} NOT a real guest`); break;
    default: break; // other internal families allowed
  }
}

for (const a of answers) {
  const ctx = `[${a.slug}]`;
  slugSeen.set(a.slug, (slugSeen.get(a.slug) ?? 0) + 1);
  if (!validClusters.has(a.cluster)) problems.push(`${ctx}: bad cluster "${a.cluster}"`);

  for (const e of a.expertEvidence) {
    if (e.episodeSlug && !episodeSet.has(e.episodeSlug))
      problems.push(`${ctx}: expertEvidence episodeSlug "${e.episodeSlug}" NOT real`);
    if (e.guestSlug && !guestSet.has(e.guestSlug))
      problems.push(`${ctx}: expertEvidence guestSlug "${e.guestSlug}" NOT real`);
  }
  for (const s of a.relatedEpisodes) {
    if (!episodeSet.has(s)) problems.push(`${ctx}: relatedEpisode "${s}" NOT real`);
  }
  for (const t of a.relatedTopics) checkHref(t.href, `${ctx} relatedTopics`);

  // soft quality checks
  const words = a.directAnswer.trim().split(/\s+/).length;
  if (words < 35 || words > 95) problems.push(`${ctx}: directAnswer ${words} words (target 40-80) [SOFT]`);
  if (a.faq.length < 4) problems.push(`${ctx}: only ${a.faq.length} faq [SOFT]`);
  if (a.keyTakeaways.length < 3) problems.push(`${ctx}: only ${a.keyTakeaways.length} keyTakeaways [SOFT]`);
}

for (const [slug, n] of slugSeen) if (n > 1) problems.push(`DUPLICATE SLUG: ${slug} (${n}x)`);

const hard = problems.filter((p) => !p.includes("[SOFT]"));
const soft = problems.filter((p) => p.includes("[SOFT]"));

console.log(`Total answers: ${answers.length}`);
console.log(`Real routes — episodes:${episodeSet.size} guests:${guestSet.size} blog:${blogSet.size} hubs:${hubSet.size} tools:${toolSet.size} compare:${compareSet.size}`);
console.log(`HARD problems: ${hard.length}`);
hard.forEach((p) => console.log("  ✗ " + p));
console.log(`SOFT problems: ${soft.length}`);
soft.slice(0, 40).forEach((p) => console.log("  ~ " + p));
if (hard.length === 0) console.log("\n✅ All slugs/citations resolve.");
