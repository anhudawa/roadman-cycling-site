import fs from "fs";
import path from "path";

// Load env
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

import matter from "gray-matter";
import { selectVoiceExamples } from "./lib/seo/voice-selector.js";
import { aiCall, printCostSummary } from "./lib/seo/ai-client.js";
import { writeDraft, ensureDraftDirs } from "./lib/seo/draft-manager.js";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const hubFilter = args.find((a) => a.startsWith("--hub="))?.split("=")[1];

// ---------------------------------------------------------------------------
// Topic definitions (mirror of src/lib/topics.ts $€” kept here to avoid
// importing from the Next.js app which has path aliases)
// ---------------------------------------------------------------------------
interface TopicDef {
  slug: string;
  title: string;
  headline: string;
  description: string;
  pillar: string;
  keywords: string[];
}

const TOPICS: TopicDef[] = [
  { slug: "ftp-training", title: "FTP Training for Cyclists", headline: "EVERYTHING YOU NEED TO KNOW ABOUT FTP", description: "The complete guide to FTP training for cyclists. How to test, train, and improve your Functional Threshold Power with evidence-based methods.", pillar: "coaching", keywords: ["ftp training", "ftp cycling", "ftp zones", "improve ftp", "ftp test", "functional threshold power"] },
  { slug: "cycling-nutrition", title: "Cycling Nutrition Guide", headline: "FUEL SMARTER, RIDE FASTER", description: "Evidence-based cycling nutrition. What to eat before, during, and after rides. Weight management, race-day fuelling, and the science of performance nutrition.", pillar: "nutrition", keywords: ["cycling nutrition", "cycling diet", "what to eat cycling", "cycling fuelling", "endurance nutrition"] },
  { slug: "cycling-training-plans", title: "Cycling Training Plans & Methodology", headline: "TRAIN WITH PURPOSE", description: "Structured cycling training plans and methodology. Periodisation, polarised training, sweet spot, base building, and how to get faster with limited time.", pillar: "coaching", keywords: ["cycling training plan", "cycling periodisation", "polarised training cycling", "cycling training structure"] },
  { slug: "cycling-recovery", title: "Cycling Recovery & Injury Prevention", headline: "RECOVER HARDER", description: "Recovery strategies that actually work for cyclists. Sleep, injury prevention, comeback protocols, and the science of adaptation.", pillar: "recovery", keywords: ["cycling recovery", "cycling injury prevention", "cycling knee pain", "sleep cycling performance"] },
  { slug: "cycling-strength-conditioning", title: "Strength & Conditioning for Cyclists", headline: "STRONGER OFF THE BIKE, FASTER ON IT", description: "The complete guide to S&C for cyclists. Exercises, programming, in-season maintenance, and why most gym programs get it wrong for endurance athletes.", pillar: "strength", keywords: ["strength training cycling", "s&c cycling", "gym for cyclists", "cycling exercises"] },
  { slug: "cycling-weight-loss", title: "Cycling & Weight Loss", headline: "LOSE WEIGHT WITHOUT LOSING POWER", description: "How to lose weight while cycling without sacrificing performance. Body composition, fuel for the work required, and the mistakes that keep cyclists heavy.", pillar: "nutrition", keywords: ["cycling weight loss", "lose weight cycling", "cycling body composition", "power to weight ratio"] },
  { slug: "cycling-beginners", title: "Getting Into Cycling", headline: "START HERE", description: "Everything a new cyclist needs to know. Group ride etiquette, bike fit, gravel cycling, tyre pressure, and the culture of the sport.", pillar: "community", keywords: ["beginner cycling", "start cycling", "cycling tips beginners", "group ride etiquette"] },
  { slug: "triathlon-cycling", title: "Cycling for Triathletes $€” The Bike Leg Specialist", headline: "OWN THE BIKE LEG", description: "Everything a triathlete needs to get faster on the bike. FTP pacing, bike nutrition, aero position, power-to-weight, and off-season bike training.", pillar: "coaching", keywords: ["triathlon cycling", "triathlon bike training", "ironman bike pacing", "triathlon cycling plan"] },
  { slug: "mountain-biking", title: "Mountain Biking $€” Setup, Skills & Routes", headline: "DIAL IN YOUR MTB", description: "Everything you need to set up, ride, and maintain your mountain bike. Suspension setup, tyre pressure, fork tuning, trail guides.", pillar: "community", keywords: ["mountain bike setup", "mtb tyre pressure", "fork setup mtb", "mountain bike suspension"] },
];

// Topic $†’ blog post slugs mapping
const TOPIC_POST_MAP: Record<string, string[]> = {
  "ftp-training": ["ftp-training-zones-cycling-complete-guide", "how-to-improve-ftp-cycling", "ftp-plateau-breakthrough", "sweet-spot-training-cycling", "cycling-vo2max-intervals"],
  "cycling-nutrition": ["cycling-in-ride-nutrition-guide", "cycling-nutrition-race-day-guide", "cycling-energy-gels-guide", "cycling-hydration-guide", "cycling-fasted-riding-myth"],
  "cycling-training-plans": ["cycling-periodisation-plan-guide", "polarised-training-cycling-guide", "cycling-base-training-guide", "zone-2-training-complete-guide", "cycling-training-full-time-job"],
  "cycling-recovery": ["cycling-recovery-tips", "cycling-sleep-performance-guide", "cycling-knee-pain-causes-fixes", "cycling-returning-after-break"],
  "cycling-strength-conditioning": ["cycling-strength-training-guide", "cycling-stretching-routine", "cycling-knee-pain-causes-fixes"],
  "cycling-weight-loss": ["cycling-weight-loss-fuel-for-the-work-required", "cycling-weight-loss-mistakes", "cycling-body-composition-guide"],
  "cycling-beginners": ["cycling-group-ride-etiquette-guide", "bike-fit-one-change-amateurs-should-make", "gravel-cycling-beginners-guide"],
  "triathlon-cycling": ["triathlon-cycling-training-plan", "triathlon-ftp-pacing-strategy", "triathlon-bike-nutrition-strategy"],
  "mountain-biking": ["mtb-fork-setup-guide", "mtb-tyre-pressure-guide", "mtb-suspension-setup-complete-guide"],
};

// ---------------------------------------------------------------------------
// Load blog post titles + excerpts for context
// ---------------------------------------------------------------------------
function loadBlogContext(postSlugs: string[]): string {
  const blogDir = path.join(process.cwd(), "content/blog");
  const results: string[] = [];

  for (const slug of postSlugs) {
    const filePath = path.join(blogDir, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    results.push(`- "${data.title}" $€” ${data.excerpt || data.seoDescription || ""}`);
  }

  return results.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("ðŸ”ï¸ Topic Hub Pillar Content Generator");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (hubFilter) console.log(`   Filtering: hub=${hubFilter}`);
  console.log();

  ensureDraftDirs();

  let topics = TOPICS;
  if (hubFilter) {
    topics = topics.filter((t) => t.slug === hubFilter);
  }

  console.log(`ðŸ“ ${topics.length} hubs to generate\n`);

  let processed = 0;

  for (const topic of topics) {
    console.log(`[${processed + 1}/${topics.length}] ${topic.title}`);

    // Get voice examples
    const voiceExamples = selectVoiceExamples(topic.pillar, topic.keywords, 3, 300);
    const voiceContext = voiceExamples
      .map((v, i) => `--- Voice example ${i + 1} (from "${v.title}") ---\n${v.excerpt}`)
      .join("\n\n");

    // Get blog post context
    const postSlugs = TOPIC_POST_MAP[topic.slug] || [];
    const blogContext = loadBlogContext(postSlugs);

    const system = `You are Anthony Walsh, host of the Roadman Cycling Podcast $€” trusted by 1 million monthly listeners. You're writing a comprehensive topic guide for roadmancycling.com. Write in your natural voice: direct, second-person, confident. Reference your podcast and guests naturally. Be evidence-based but accessible. Use short, punchy paragraphs. No academic tone.`;

    const prompt = `Here are examples of how you speak on the podcast $€” match this voice:

${voiceContext}

---

Write a comprehensive pillar guide for the topic hub: "${topic.title}"

Topic description: ${topic.description}
Target keywords: ${topic.keywords.join(", ")}

Related articles on the site (reference these naturally as internal links):
${blogContext || "(none yet)"}

Follow this structure EXACTLY:

## What Is ${topic.title.replace(/$€”.*$/, "").trim()}?
(100-150 words $€” define the concept, explain why it matters for cyclists)

## The Roadman Approach
(200-300 words $€” your philosophy on this topic, what makes your advice different from the generic stuff online, reference specific podcast episodes or guests)

## Key Concepts
(Write 3-5 subsections with ## headers, 200-400 words each $€” the core knowledge every cyclist needs)

## Common Mistakes
(200-300 words $€” what most cyclists get wrong, be specific and contrarian)

## How to Get Started
(150-200 words $€” actionable first steps for someone new to this topic)

## Frequently Asked Questions

(Write 5-6 Q&A pairs. Each question should target a "People Also Ask" query. Answers should be 50-100 words, direct and specific.)

Format as a Q: / A: pair, like:
**Q: How often should I do zone 2 training?**
A: Three to four sessions per week...

Target 2000-3000 words total. Write in markdown. Do NOT include a title H1 $€” the page already has one.`;

    try {
      const result = await aiCall({
        system,
        prompt,
        model: "sonnet",
        maxTokens: 4096,
        dryRun,
      });

      if (!dryRun) {
        const wordCount = result.text.split(/\s+/).length;

        // Build frontmatter
        const frontmatter = {
          topicSlug: topic.slug,
          title: topic.title,
          generatedAt: new Date().toISOString(),
          status: "draft",
          wordCount,
          sourceEpisodes: voiceExamples.map((v) => v.slug),
        };

        const mdxContent = matter.stringify(result.text, frontmatter);
        writeDraft("hubs", `${topic.slug}.mdx`, mdxContent, false);
        console.log(`  $œ… Generated (${wordCount} words)`);
      }

      processed++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  $Œ Failed: ${msg}`);
    }
  }

  console.log(`\n$œ… Done: ${processed} hubs generated`);
  printCostSummary();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
