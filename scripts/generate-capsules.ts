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
import { readManifest, saveManifest, upsertManifestEntry, ensureDraftDirs } from "./lib/seo/draft-manager.js";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const pillarFilter = args.find((a) => a.startsWith("--pillar="))?.split("=")[1];
const force = args.includes("--force");

const BLOG_DIR = path.join(process.cwd(), "content/blog");

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🧊 Answer Capsule Generator");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (slugFilter) console.log(`   Filtering: slug=${slugFilter}`);
  if (pillarFilter) console.log(`   Filtering: pillar=${pillarFilter}`);
  console.log();

  ensureDraftDirs();
  const manifest = readManifest("capsules");

  // Load all blog posts
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  let posts = files.map((file) => {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.mdx$/, ""),
      filePath,
      raw,
      data,
      content,
    };
  });

  // Apply filters
  if (slugFilter) {
    posts = posts.filter((p) => p.slug === slugFilter);
  }
  if (pillarFilter) {
    posts = posts.filter((p) => p.data.pillar === pillarFilter);
  }

  // Skip posts that already have an answerCapsule (unless --force)
  if (!force) {
    posts = posts.filter((p) => !p.data.answerCapsule);
  }

  console.log(`📝 ${posts.length} posts to process\n`);

  let processed = 0;
  let skipped = 0;

  for (const post of posts) {
    console.log(`[${processed + skipped + 1}/${posts.length}] ${post.data.title}`);

    // Get voice examples from matching pillar
    const voiceExamples = selectVoiceExamples(
      post.data.pillar || "coaching",
      post.data.keywords || [],
      2,
      200
    );

    // Build first 500 words of body content
    const bodyWords = post.content.split(/\s+/).slice(0, 500).join(" ");

    const voiceContext = voiceExamples
      .map((v, i) => `--- Voice example ${i + 1} (from "${v.title}") ---\n${v.excerpt}`)
      .join("\n\n");

    const system = `You are Anthony Walsh, host of the Roadman Cycling Podcast — the world's largest cycling performance podcast. You're writing a direct answer capsule (40-60 words) for a blog article on your site. Write in your natural voice: direct, second-person, confident, evidence-based but accessible. No hedging. No "it depends." Give the answer, then one sentence of why.`;

    const prompt = `Here are examples of how you speak on the podcast — match this voice exactly:

${voiceContext}

---

Now write a 40-60 word answer capsule for this article:

Title: ${post.data.title}
Excerpt: ${post.data.excerpt || ""}

First 500 words of the article:
${bodyWords}

Write a single paragraph, 40-60 words. Answer the core search question directly. Be specific — use numbers, percentages, or concrete recommendations where appropriate. End with one sentence explaining why this matters.

Return ONLY the capsule text, no quotes, no labels, no formatting.`;

    try {
      const result = await aiCall({
        system,
        prompt,
        model: "haiku",
        maxTokens: 200,
        dryRun,
      });

      if (!dryRun) {
        const capsuleText = result.text.trim().replace(/^["']|["']$/g, "");

        // Validate word count
        const wordCount = capsuleText.split(/\s+/).length;
        if (wordCount < 20 || wordCount > 100) {
          console.log(`  ⚠ Capsule word count (${wordCount}) outside range, keeping anyway`);
        }

        // Update frontmatter
        const { data: frontmatter, content: body } = matter(post.raw);
        frontmatter.answerCapsule = capsuleText;

        // Write back to file
        const updated = matter.stringify(body, frontmatter);
        fs.writeFileSync(post.filePath, updated, "utf-8");
        console.log(`  ✅ Capsule added (${wordCount} words)`);

        // Update manifest
        upsertManifestEntry(manifest, post.slug);
      }

      processed++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Failed: ${msg}`);
      skipped++;
    }
  }

  // Save manifest
  saveManifest("capsules", manifest, dryRun);

  console.log(`\n✅ Done: ${processed} processed, ${skipped} skipped`);
  printCostSummary();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
