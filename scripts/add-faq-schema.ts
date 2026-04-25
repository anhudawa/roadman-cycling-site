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
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

import matter from "gray-matter";
import { aiCall, printCostSummary } from "./lib/seo/ai-client.js";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];

interface FaqItem {
  question: string;
  answer: string;
}

function parseFaqResponse(text: string): FaqItem[] {
  const items: FaqItem[] = [];
  // Parse Q:/A: format
  const blocks = text.split(/\nQ:/);
  for (const block of blocks) {
    const cleaned = block.startsWith("Q:") ? block.slice(2) : block;
    const qMatch = cleaned.match(/^(.+?)\nA:\s*(.+)/s);
    if (qMatch) {
      const question = qMatch[1].trim().replace(/^\d+\.\s*/, "").replace(/\?$/, "") + "?";
      const answer = qMatch[2].trim().replace(/\n+/g, " ");
      if (question.length > 10 && answer.length > 20) {
        items.push({ question, answer });
      }
    }
  }
  return items;
}

async function main() {
  console.log("📋 FAQ Schema Generator");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (slugFilter) console.log(`   Filtering: slug=${slugFilter}`);
  console.log();

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    if (slugFilter && slug !== slugFilter) continue;

    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    // Skip if already has FAQ
    if (data.faq && Array.isArray(data.faq) && data.faq.length > 0) {
      skipped++;
      continue;
    }

    console.log(`\n📝 ${slug}`);
    console.log(`   Title: ${data.title}`);

    // Extract first ~500 words of body for context
    const bodyWords = content.replace(/^#+\s.+$/gm, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
    const first500 = bodyWords.split(/\s+/).slice(0, 500).join(" ");

    const system = `You are an SEO expert generating FAQ schema for cycling blog posts on Roadman Cycling Podcast's website. Generate questions that real cyclists would search for on Google (targeting "People Also Ask" boxes). Answers must be factual, authoritative, and 2-3 sentences long. Use plain language. Do not mention the podcast or website in answers.`;

    const prompt = `Generate 3-5 FAQ items for this blog post.

Title: ${data.title}
Excerpt: ${data.excerpt || ""}
Keywords: ${(data.keywords || []).join(", ")}

Content preview:
${first500}

Format your response EXACTLY like this (no numbering, no markdown):
Q: [question ending with ?]
A: [2-3 sentence answer]

Q: [question ending with ?]
A: [2-3 sentence answer]`;

    try {
      const result = await aiCall({
        system,
        prompt,
        model: "haiku",
        maxTokens: 1024,
        dryRun,
      });

      if (dryRun) {
        processed++;
        continue;
      }

      const faqs = parseFaqResponse(result.text);
      if (faqs.length < 2) {
        console.log(`   ⚠ Only parsed ${faqs.length} FAQs, skipping`);
        console.log(`   Raw: ${result.text.slice(0, 200)}`);
        failed++;
        continue;
      }

      // Inject FAQ into frontmatter
      data.faq = faqs;
      const updated = matter.stringify(content, data);
      fs.writeFileSync(filePath, updated, "utf-8");

      console.log(`   ✅ Added ${faqs.length} FAQs`);
      for (const faq of faqs) {
        console.log(`      Q: ${faq.question.slice(0, 80)}`);
      }
      processed++;
    } catch (error) {
      console.error(`   ❌ Failed: ${error instanceof Error ? error.message : error}`);
      failed++;
    }
  }

  console.log(`\n\n📊 Results:`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped (already has FAQ): ${skipped}`);
  console.log(`   Failed: ${failed}`);

  printCostSummary();
}

main().catch(console.error);
