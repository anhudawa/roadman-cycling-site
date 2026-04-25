/**
 * scripts/tag-episode-topics.ts
 *
 * Tags each podcast episode with topic hub slugs based on keyword
 * matching against the episode title, description, and keywords.
 *
 * Adds `topicTags: string[]` to frontmatter $— an array of topic
 * hub slugs this episode is relevant to.
 *
 * CLI: npx tsx scripts/tag-episode-topics.ts
 *      npx tsx scripts/tag-episode-topics.ts --dry-run
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const dryRun = process.argv.includes("--dry-run");

const TOPIC_PATTERNS: Record<string, RegExp> = {
  "ftp-training": /ftp|threshold|power zone|watt|watts per|w\/kg|power meter|power data|coggan/i,
  "cycling-nutrition": /nutri|fuel|diet|eat|food|carb|protein|hydrat|gel|calor|weight loss|body comp|race weight|energy avail|red-s/i,
  "cycling-training-plans": /train.*plan|periodis|base.*build|structure|interval|session|polarised|sweet spot|zone 2|endurance.*train|coaching.*plan/i,
  "cycling-recovery": /recov|sleep|injur|pain|rest|adaptation|comeback|break|overtraining|fatigue|burnout|hrv/i,
  "cycling-strength-conditioning": /strength|gym|s&c|stretch|core|muscle|lift|squat|deadlift|weight.*train/i,
  "cycling-weight-loss": /weight.*loss|fat.*loss|lean|body.*fat|diet|kilo|kg.*loss|body comp/i,
  "cycling-beginners": /beginn|start.*cycling|new.*to|etiquette|first.*bike|getting.*into/i,
  "triathlon-cycling": /triath|ironman|70\.3|half iron|brick|swim.*bike|bike.*run|t1|t2|aero.*position|tri.*bike/i,
  "cycling-coaching": /coach|coaching|personalise|accountability|self.*coach|mentor|not done yet|ndy/i,
  "mountain-biking": /mountain.*bik|mtb|enduro|downhill|trail.*rid|suspension|fork.*setup|sag|shock.*pressur|dropper|gravel/i,
};

let updated = 0;
let skipped = 0;

const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));

for (const file of files) {
  const filePath = path.join(PODCAST_DIR, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  if (data.topicTags && data.topicTags.length > 0) {
    skipped++;
    continue;
  }

  const haystack = `${data.title || ""} ${data.description || ""} ${(data.keywords || []).join(" ")}`.toLowerCase();

  const tags: string[] = [];
  for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
    if (pattern.test(haystack)) {
      tags.push(topic);
    }
  }

  if (tags.length === 0) {
    skipped++;
    continue;
  }

  if (dryRun) {
    console.log(`${file}: ${tags.join(", ")}`);
    updated++;
    continue;
  }

  // Add topicTags to frontmatter
  data.topicTags = tags;
  const newContent = matter.stringify(content, data);
  fs.writeFileSync(filePath, newContent, "utf-8");
  updated++;
}

console.log(`\nDone.`);
console.log(`  Tagged: ${updated}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Dry run: ${dryRun}`);
