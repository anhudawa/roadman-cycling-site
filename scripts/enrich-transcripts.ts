import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

import matter from "gray-matter";
import { fetchTranscript } from "./lib/transcript.js";

const args = process.argv.slice(2);
const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
const dryRun = args.includes("--dry-run");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const recent = args.includes("--recent");

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");

interface EpisodeFile {
  slug: string;
  filePath: string;
  youtubeId: string;
  publishDate: string;
  episodeNumber: number;
}

async function main() {
  console.log("ðŸ“ Transcript Enrichment");
  console.log(`   Dry run: ${dryRun}`);
  console.log(`   Limit: ${limit || "none"}`);
  console.log("");

  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));

  // Find episodes missing transcripts
  const needsTranscript: EpisodeFile[] = [];

  for (const file of files) {
    const filePath = path.join(PODCAST_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    // Skip if already has transcript
    if (data.transcript && String(data.transcript).trim().length > 50) continue;

    // Skip if no YouTube ID
    if (!data.youtubeId) continue;

    const slug = file.replace(/\.mdx$/, "");

    // Filter by slug if specified
    if (slugFilter && slug !== slugFilter) continue;

    needsTranscript.push({
      slug,
      filePath,
      youtubeId: String(data.youtubeId),
      publishDate: String(data.publishDate ?? ""),
      episodeNumber: Number(data.episodeNumber ?? 0),
    });
  }

  // Sort by publish date (most recent first)
  needsTranscript.sort((a, b) => b.publishDate.localeCompare(a.publishDate));

  // Apply limit
  const toProcess = limit > 0 ? needsTranscript.slice(0, limit) : needsTranscript;

  console.log(`ðŸ“‹ Episodes needing transcripts: ${needsTranscript.length}`);
  console.log(`ðŸ“‹ Processing: ${toProcess.length}`);
  console.log("");

  let enriched = 0;
  let failed = 0;
  let noCaption = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const ep = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;

    process.stdout.write(`${progress} EP ${ep.episodeNumber} (${ep.youtubeId})... `);

    try {
      const transcript = await fetchTranscript(ep.youtubeId);

      if (!transcript || transcript.length < 100) {
        console.log("$š  no captions available");
        noCaption++;
        continue;
      }

      const wordCount = transcript.split(/\s+/).length;

      if (dryRun) {
        console.log(`$œ“ ${wordCount} words (dry-run, not writing)`);
        enriched++;
        continue;
      }

      // Read the file, add transcript to frontmatter, rewrite
      const raw = fs.readFileSync(ep.filePath, "utf-8");
      const { data, content } = matter(raw);
      data.transcript = transcript;
      const updated = matter.stringify(content, data);

      // Atomic write
      const tmpPath = ep.filePath + ".tmp";
      fs.writeFileSync(tmpPath, updated, "utf-8");
      fs.renameSync(tmpPath, ep.filePath);

      console.log(`$œ“ ${wordCount} words written`);
      enriched++;

      // Small delay to avoid rate limits on YouTube
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`$œ— ${msg}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("ðŸ“Š ENRICHMENT COMPLETE");
  console.log(`   Enriched: ${enriched}`);
  console.log(`   No captions: ${noCaption}`);
  console.log(`   Failed: ${failed}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
