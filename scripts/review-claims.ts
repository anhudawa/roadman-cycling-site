/**
 * scripts/review-claims.ts
 *
 * Interactive CLI to clear the editorial review queue for auto-extracted
 * claims and citations. Walks every episode that has at least one item
 * with `reviewed: false`, and for each, shows the item with its evidence
 * level, source, and surrounding transcript context, then prompts:
 *
 *   [a]pprove — sets reviewed:true and writes back to MDX
 *   [r]eject  — deletes the item
 *   [e]dit    — opens $EDITOR on the item, then approves on save
 *   [s]kip    — leaves it for next time
 *   [q]uit    — exits, save progress made so far
 *
 * Run this in a quiet terminal session — it's an editorial workflow,
 * not a CI step.
 *
 * SEO-NEW-20.
 *
 * CLI:
 *   tsx scripts/review-claims.ts                  # all unreviewed
 *   tsx scripts/review-claims.ts --slug=ep-...    # single episode
 *   tsx scripts/review-claims.ts --type=claims    # claims only
 *   tsx scripts/review-claims.ts --type=citations # citations only
 */

import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { spawnSync } from "child_process";
import matter from "gray-matter";

const args = process.argv.slice(2);
const slugFilter = args.find((a) => a.startsWith("--slug="))?.split("=")[1];
const typeFilter = args.find((a) => a.startsWith("--type="))?.split("=")[1] as
  | "claims"
  | "citations"
  | undefined;

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");

interface ClaimItem {
  claim: string;
  evidence: "study" | "expert" | "practice" | "anecdote" | "opinion";
  source?: string;
  reviewed?: boolean;
}

interface CitationItem {
  title: string;
  type: "paper" | "book" | "article" | "tool" | "episode" | "website";
  url?: string;
  author?: string;
  reviewed?: boolean;
}

interface EpisodeQueue {
  slug: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
  transcript: string;
  title: string;
  claims: ClaimItem[];
  citations: CitationItem[];
}

function loadQueue(): EpisodeQueue[] {
  const files = fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"));
  const out: EpisodeQueue[] = [];
  for (const filename of files) {
    const slug = filename.replace(/\.mdx$/, "");
    if (slugFilter && slug !== slugFilter) continue;
    const filePath = path.join(PODCAST_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const claims = Array.isArray(data.claims) ? (data.claims as ClaimItem[]) : [];
    const citations = Array.isArray(data.citations)
      ? (data.citations as CitationItem[])
      : [];
    const hasUnreviewed =
      (typeFilter !== "citations" && claims.some((c) => c.reviewed === false)) ||
      (typeFilter !== "claims" && citations.some((c) => c.reviewed === false));
    if (!hasUnreviewed) continue;
    out.push({
      slug,
      filePath,
      frontmatter: data,
      body: content,
      transcript: typeof data.transcript === "string" ? data.transcript : "",
      title: String(data.title ?? slug),
      claims,
      citations,
    });
  }
  return out;
}

function findContext(transcript: string, snippet: string, contextChars = 240): string {
  if (!transcript) return "";
  const target = snippet.slice(0, 50).toLowerCase();
  const lower = transcript.toLowerCase();
  const idx = lower.indexOf(target);
  if (idx === -1) return "";
  const start = Math.max(0, idx - contextChars);
  const end = Math.min(transcript.length, idx + target.length + contextChars);
  return (
    (start > 0 ? "..." : "") +
    transcript.slice(start, end) +
    (end < transcript.length ? "..." : "")
  );
}

function writeBack(ep: EpisodeQueue) {
  const updated = {
    ...ep.frontmatter,
    claims: ep.claims.length > 0 ? ep.claims : undefined,
    citations: ep.citations.length > 0 ? ep.citations : undefined,
  };
  // Drop undefined keys explicitly so gray-matter doesn't write null
  for (const k of Object.keys(updated)) {
    if ((updated as Record<string, unknown>)[k] === undefined)
      delete (updated as Record<string, unknown>)[k];
  }
  const output = matter.stringify(ep.body, updated);
  fs.writeFileSync(ep.filePath, output, "utf-8");
}

function editJson<T>(value: T): T {
  const editor = process.env.EDITOR || "vi";
  const tmp = path.join(os.tmpdir(), `review-${Date.now()}.json`);
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), "utf-8");
  const result = spawnSync(editor, [tmp], { stdio: "inherit" });
  if (result.status !== 0) {
    console.warn(`   Editor exited with status ${result.status}; keeping original`);
    fs.unlinkSync(tmp);
    return value;
  }
  try {
    const updated = JSON.parse(fs.readFileSync(tmp, "utf-8"));
    fs.unlinkSync(tmp);
    return updated as T;
  } catch (err) {
    console.warn(`   Failed to parse edited JSON: ${err instanceof Error ? err.message : err}`);
    fs.unlinkSync(tmp);
    return value;
  }
}

function makePrompt(rl: readline.Interface) {
  return (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, (a) => resolve(a)));
}

async function main() {
  console.log(`Editorial review queue`);
  if (slugFilter) console.log(`   Slug: ${slugFilter}`);
  if (typeFilter) console.log(`   Type: ${typeFilter}`);
  console.log(``);

  const queue = loadQueue();
  console.log(`   Episodes with pending items: ${queue.length}`);
  let unreviewedClaims = 0;
  let unreviewedCitations = 0;
  for (const ep of queue) {
    unreviewedClaims += ep.claims.filter((c) => c.reviewed === false).length;
    unreviewedCitations += ep.citations.filter((c) => c.reviewed === false).length;
  }
  console.log(`   Unreviewed claims: ${unreviewedClaims}`);
  console.log(`   Unreviewed citations: ${unreviewedCitations}`);
  console.log(``);
  if (queue.length === 0) {
    console.log(`Queue is clear.`);
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const prompt = makePrompt(rl);

  let approved = 0;
  let rejected = 0;
  let edited = 0;
  let skipped = 0;
  let quit = false;

  outer: for (const ep of queue) {
    if (quit) break;
    console.log(`\n========== ${ep.slug} ==========`);
    console.log(ep.title);

    if (typeFilter !== "citations") {
      for (let i = 0; i < ep.claims.length; i++) {
        if (quit) break outer;
        const c = ep.claims[i];
        if (c.reviewed !== false) continue;
        const ctx = findContext(ep.transcript, c.claim);
        console.log(`\n  Claim [${i + 1}/${ep.claims.length}]`);
        console.log(`    Evidence: ${c.evidence}`);
        if (c.source) console.log(`    Source:   ${c.source}`);
        console.log(`    Text:     ${c.claim}`);
        if (ctx) console.log(`    Context:  ${ctx}`);
        const a = (await prompt(`    [a]pprove [r]eject [e]dit [s]kip [q]uit: `)).trim().toLowerCase();
        if (a === "a") {
          c.reviewed = true;
          approved++;
        } else if (a === "r") {
          ep.claims.splice(i, 1);
          i--;
          rejected++;
        } else if (a === "e") {
          const updated = editJson(c);
          if (updated && typeof updated === "object" && "claim" in updated) {
            (updated as ClaimItem).reviewed = true;
            ep.claims[i] = updated as ClaimItem;
            edited++;
          }
        } else if (a === "q") {
          quit = true;
        } else {
          skipped++;
        }
      }
    }

    if (typeFilter !== "claims") {
      for (let i = 0; i < ep.citations.length; i++) {
        if (quit) break outer;
        const c = ep.citations[i];
        if (c.reviewed !== false) continue;
        console.log(`\n  Citation [${i + 1}/${ep.citations.length}]`);
        console.log(`    Type:     ${c.type}`);
        if (c.author) console.log(`    Author:   ${c.author}`);
        if (c.url) console.log(`    URL:      ${c.url}`);
        console.log(`    Title:    ${c.title}`);
        const a = (await prompt(`    [a]pprove [r]eject [e]dit [s]kip [q]uit: `)).trim().toLowerCase();
        if (a === "a") {
          c.reviewed = true;
          approved++;
        } else if (a === "r") {
          ep.citations.splice(i, 1);
          i--;
          rejected++;
        } else if (a === "e") {
          const updated = editJson(c);
          if (updated && typeof updated === "object" && "title" in updated) {
            (updated as CitationItem).reviewed = true;
            ep.citations[i] = updated as CitationItem;
            edited++;
          }
        } else if (a === "q") {
          quit = true;
        } else {
          skipped++;
        }
      }
    }

    // Persist after each episode so a Ctrl-C doesn't lose work.
    writeBack(ep);
  }

  rl.close();

  console.log(`\nReview complete.`);
  console.log(`  Approved: ${approved}`);
  console.log(`  Edited:   ${edited}`);
  console.log(`  Rejected: ${rejected}`);
  console.log(`  Skipped:  ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
