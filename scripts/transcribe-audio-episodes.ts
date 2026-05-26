#!/usr/bin/env tsx
// ---------------------------------------------------------------------------
// Roadman Cycling — Audio back-catalogue transcription pipeline
//
// We have ~338 episodes transcribed from YouTube captions. The full audio
// podcast (Spotify/Apple, via the Anchor RSS feed) has ~1,277 episodes; the
// remainder are audio-only with no YouTube video. This pipeline:
//
//   1. Fetches the RSS feed and finds episodes with no MDX yet
//   2. Downloads the audio enclosure
//   3. Transcribes it locally with open-source Whisper (faster-whisper)
//   4. Writes an MDX file matching content/podcast/ schema (transcript in
//      frontmatter) + a canonical .txt in content/podcast/transcripts/
//
// Resumable + batch-friendly: progress is keyed by RSS guid in
// scripts/transcribe-audio-state.json, so re-running skips finished episodes.
//
// Usage:
//   npm run transcribe:audio -- --dry-run            # plan only, no audio/ASR
//   npm run transcribe:audio -- --limit=10           # process 10 missing eps
//   npm run transcribe:audio -- --limit=20 --order=newest
//   WHISPER_MODEL=small.en npm run transcribe:audio -- --limit=10
// ---------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import matter from "gray-matter";
import {
  classifyPillar,
  classifyType,
  extractGuest,
} from "./lib/classifier.js";
import { secondsToReadable, formatDate, extractKeywords, truncate } from "./lib/utils.js";

// ---------------------------------------------------------------------------
// Env loading (mirrors enrich-transcripts.ts)
// ---------------------------------------------------------------------------
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

// ---------------------------------------------------------------------------
// Config & CLI
// ---------------------------------------------------------------------------
const DEFAULT_FEED = "https://anchor.fm/s/a09110e0/podcast/rss";
const FEED_URL = process.env.PODCAST_RSS || DEFAULT_FEED;
const WHISPER_MODEL = process.env.WHISPER_MODEL || "base.en";
const WHISPER_COMPUTE = process.env.WHISPER_COMPUTE || "int8";

const PODCAST_DIR = path.join(process.cwd(), "content/podcast");
const TRANSCRIPT_DIR = path.join(PODCAST_DIR, "transcripts");
const STATE_FILE = path.join(process.cwd(), "scripts/transcribe-audio-state.json");
const TMP_DIR = path.join(process.cwd(), "tmp/transcribe-audio");
const PY_WORKER = path.join(process.cwd(), "scripts/transcribe_audio.py");

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const val = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];

const dryRun = flag("dry-run");
// Re-generate MDX for already-transcribed episodes from saved .txt transcripts
// (re-applies classifier/format changes; no re-download or re-transcription).
const rebuild = flag("rebuild");
const limit = Number(val("limit") ?? (dryRun ? 0 : 8));
const order = (val("order") as "oldest" | "newest") ?? "oldest";
const minChars = Number(val("min-chars") ?? 200);
const modelOverride = val("model");
// Cap processing at this publish date (inclusive). The audio feed and YouTube
// use divergent titles for the same recent episode, so title dedup is
// unreliable after ~2024 — use --max-date to stay in the safe back-catalogue.
const maxDate = val("max-date");

// ---------------------------------------------------------------------------
// RSS parsing
// ---------------------------------------------------------------------------
interface RssItem {
  title: string;
  guid: string;
  pubDate: string;
  enclosureUrl?: string;
  durationSeconds: number;
  description: string;
  keywords: string[];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function extractTag(block: string, tag: string): string | null {
  const cdata = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    "i",
  );
  const m1 = block.match(cdata);
  if (m1) return m1[1].trim();
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m2 = block.match(plain);
  return m2 ? decodeEntities(m2[1].trim()) : null;
}

/** "HH:MM:SS" | "MM:SS" | "<seconds>" -> seconds */
function parseDuration(raw: string | null): number {
  if (!raw) return 0;
  const t = raw.trim();
  if (/^\d+$/.test(t)) return Number(t);
  const parts = t.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>(?=\S)/gi, " ")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function parseFeed(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const raw of blocks) {
    const end = raw.indexOf("</item>");
    const block = end >= 0 ? raw.slice(0, end) : raw;

    const title = extractTag(block, "title");
    const guid = extractTag(block, "guid") || extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate") ?? "";
    const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i)?.[1];
    const durationSeconds = parseDuration(
      extractTag(block, "itunes:duration") ?? extractTag(block, "duration"),
    );
    const description =
      extractTag(block, "description") ??
      extractTag(block, "itunes:summary") ??
      extractTag(block, "content:encoded") ??
      "";
    const kwRaw = extractTag(block, "itunes:keywords") ?? "";
    const keywords = kwRaw
      ? kwRaw.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    if (title && guid) {
      items.push({
        title,
        guid,
        pubDate,
        enclosureUrl: enclosure,
        durationSeconds,
        description: stripHtml(description),
        keywords,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Dedup helpers
// ---------------------------------------------------------------------------
/** Aggressive title normalisation so YouTube + audio titles for the same
 *  episode collapse to one key (strip ep numbers, bracketed cruft, punctuation). */
function normTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ") // (parenthetical) / [bracketed]
    .replace(/\b(?:ep|episode|pod|podcast|vlog)\.?\s*#?\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(title: string): string {
  const clean = title
    .replace(/^(?:EP?|Episode|#)\s*\d+\s*[:\-–—|]\s*/i, "")
    .trim();
  return clean
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");
}

/** MDX-safe body text (escape JSX-significant chars; mirror mdx-generator). */
function sanitizeMdx(text: string): string {
  return text
    .replace(/[⁠​﻿]/g, "")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/(https?:\/\/[^\s)]+)/g, "[$1]($1)")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(?!\/?\w)/g, "\\<")
    .replace(/(?<!\w)>/g, "\\>")
    .trim();
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface EpisodeState {
  status: "written" | "skipped" | "failed";
  slug?: string;
  title: string;
  words?: number;
  error?: string;
  updatedAt: string;
}
interface State {
  version: 1;
  feedUrl: string;
  lastRun: string;
  episodes: Record<string, EpisodeState>;
}

function loadState(): State {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) as State;
    } catch {
      /* fall through to fresh state */
    }
  }
  return { version: 1, feedUrl: FEED_URL, lastRun: "", episodes: {} };
}

function saveState(state: State) {
  state.lastRun = new Date().toISOString();
  const tmp = STATE_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf-8");
  fs.renameSync(tmp, STATE_FILE);
}

// ---------------------------------------------------------------------------
// Existing episode index
// ---------------------------------------------------------------------------
function titleTokens(title: string): Set<string> {
  return new Set(normTitle(title).split(" ").filter((w) => w.length > 3));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

interface ExistingIndex {
  titleKeys: Set<string>;
  /** epoch-day -> token sets of episodes published that day */
  byDay: Map<number, Set<string>[]>;
}

function buildExistingIndex(): ExistingIndex {
  const titleKeys = new Set<string>();
  const byDay = new Map<number, Set<string>[]>();
  if (!fs.existsSync(PODCAST_DIR)) return { titleKeys, byDay };
  for (const f of fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"))) {
    try {
      const { data } = matter(fs.readFileSync(path.join(PODCAST_DIR, f), "utf-8"));
      if (!data.title) continue;
      titleKeys.add(normTitle(String(data.title)));
      const d = data.publishDate ? new Date(String(data.publishDate)).getTime() : NaN;
      if (!isNaN(d)) {
        const day = Math.floor(d / 86_400_000);
        const toks = titleTokens(String(data.title));
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day)!.push(toks);
      }
    } catch {
      /* skip unreadable file */
    }
  }
  return { titleKeys, byDay };
}

/** Conservative duplicate guard for the recent overlap era: an existing
 *  episode within ±2 days whose title tokens strongly overlap (Jaccard ≥ 0.5)
 *  is treated as the same episode under a different (YouTube) title. */
function looksDuplicate(idx: ExistingIndex, item: RssItem): boolean {
  if (!item.pubDate) return false;
  const t = new Date(item.pubDate).getTime();
  if (isNaN(t)) return false;
  const day = Math.floor(t / 86_400_000);
  const toks = titleTokens(item.title);
  for (let d = day - 2; d <= day + 2; d++) {
    for (const other of idx.byDay.get(d) ?? []) {
      if (jaccard(toks, other) >= 0.5) return true;
    }
  }
  return false;
}

function existingSlugs(): Set<string> {
  const slugs = new Set<string>();
  if (!fs.existsSync(PODCAST_DIR)) return slugs;
  for (const f of fs.readdirSync(PODCAST_DIR).filter((f) => f.endsWith(".mdx"))) {
    slugs.add(f.replace(/\.mdx$/, ""));
  }
  return slugs;
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base || "episode";
  let i = 2;
  while (taken.has(slug)) slug = `${base}-${i++}`;
  taken.add(slug);
  return slug;
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------
async function downloadAudio(url: string, dest: string): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: {
          // anchor.fm drops UA-less connections, surfacing as "fetch failed".
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "*/*",
        },
      });
      if (!res.ok) {
        console.log(`      download ${res.status} (attempt ${attempt})`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      return buf.length > 1024; // sanity: non-trivial file
    } catch (err) {
      console.log(`      download error (attempt ${attempt}): ${(err as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  return false;
}

// ---------------------------------------------------------------------------
// MDX generation
// ---------------------------------------------------------------------------
function buildMdx(item: RssItem, transcript: string, slug: string): string {
  const cleanTitle = item.title
    .replace(/^(?:EP?|Episode|#)\s*\d+\s*[:\-–—|]\s*/i, "")
    .trim();

  // Guest extraction is gated on an explicit interview connector IN THE TITLE.
  // The shared classifier's loose dash/colon patterns otherwise turn solo
  // race-recap titles ("Egan Bernal - Tour de France Winner") into fake guests
  // with bogus /guests/<slug> profile links — bad on an SEO-sensitive site.
  // (The description is not used for the gate: prose "with" is far too noisy.)
  const connector =
    /\b(?:with|ft\.?|feat\.?|featuring|interview|joins|in conversation|talks? to|sits down with|chats? (?:to|with))\b/i;
  const guestRaw = extractGuest(item.title, item.description);
  const guest = guestRaw && connector.test(item.title) ? guestRaw : undefined;

  const pillar = classifyPillar(item.title, item.description, item.keywords);
  // No confident guest ⇒ treat as a solo cast (the show is solo-heavy) rather
  // than leaving a guest-less "interview" with an empty guest slot.
  let type = classifyType(item.title, item.description);
  if (!guest && type === "interview") type = "solo";
  const keywords = extractKeywords(item.title, item.keywords, guest);
  const descFirst = item.description.split("\n").find((l) => l.trim()) || cleanTitle;

  const frontmatter: Record<string, unknown> = {
    title: cleanTitle,
    ...(guest && { guest }),
    description: truncate(descFirst, 300),
    publishDate: item.pubDate ? formatDate(item.pubDate) : "",
    duration: secondsToReadable(item.durationSeconds),
    pillar,
    type,
    keywords,
    seoDescription: truncate(descFirst, 155),
    audioUrl: item.enclosureUrl,
    rssGuid: item.guid,
    source: "audio-rss",
    autoTranscribed: true,
    transcribedAt: new Date().toISOString(),
    transcript,
  };

  const showNotes = sanitizeMdx(item.description).trim();
  const body = showNotes.length > 20 ? showNotes : `Show notes for "${cleanTitle}".`;

  return matter.stringify(body, frontmatter);
}

function writeFileAtomic(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, content, "utf-8");
  fs.renameSync(tmp, filePath);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("🎙  Roadman audio-catalogue transcription");
  console.log(`   Feed:   ${FEED_URL}`);
  console.log(`   Model:  ${modelOverride || WHISPER_MODEL} (${WHISPER_COMPUTE})`);
  console.log(`   Mode:   ${dryRun ? "DRY RUN (no download/ASR)" : "process"}`);
  console.log(`   Limit:  ${limit || "all"}   Order: ${order}`);
  console.log("");

  console.log("Fetching RSS feed…");
  const res = await fetch(FEED_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (roadman-transcribe-bot)" },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
  const feed = parseFeed(await res.text());
  console.log(`   ${feed.length} episodes in feed`);

  const state = loadState();

  // --rebuild: regenerate MDX for transcribed episodes from saved .txt files.
  if (rebuild) {
    const byGuid = new Map(feed.map((ep) => [ep.guid, ep]));
    let rebuilt = 0;
    let missing = 0;
    for (const [guid, st] of Object.entries(state.episodes)) {
      if (st.status !== "written" || !st.slug) continue;
      const item = byGuid.get(guid);
      const txtPath = path.join(TRANSCRIPT_DIR, `${st.slug}.txt`);
      if (!item || !fs.existsSync(txtPath)) {
        missing++;
        continue;
      }
      const transcript = fs.readFileSync(txtPath, "utf-8").trim();
      const mdx = buildMdx(item, transcript, st.slug);
      writeFileAtomic(path.join(PODCAST_DIR, `${st.slug}.mdx`), mdx);
      rebuilt++;
    }
    console.log(`Rebuilt ${rebuilt} MDX file(s) from saved transcripts (${missing} could not be matched).`);
    return;
  }

  const idx = buildExistingIndex();
  const slugs = existingSlugs();
  console.log(`   ${idx.titleKeys.size} episodes already have MDX (YouTube + prior runs)`);

  const maxDateMs = maxDate ? new Date(maxDate).getTime() : Infinity;
  let dupGuarded = 0;
  let dateCapped = 0;

  // Missing = has audio, not already finished/skipped, not an obvious duplicate
  // of an existing (YouTube) episode, within the date cap.
  const missing = feed.filter((ep) => {
    const st = state.episodes[ep.guid];
    if (st && (st.status === "written" || st.status === "skipped")) return false;
    if (!ep.enclosureUrl) return false;
    if (idx.titleKeys.has(normTitle(ep.title))) return false;
    if (ep.pubDate && new Date(ep.pubDate).getTime() > maxDateMs) {
      dateCapped++;
      return false;
    }
    if (looksDuplicate(idx, ep)) {
      dupGuarded++;
      return false;
    }
    return true;
  });
  if (dupGuarded) console.log(`   ${dupGuarded} skipped as likely duplicates of existing episodes`);
  if (maxDate) console.log(`   ${dateCapped} skipped after --max-date=${maxDate}`);

  // Order: oldest-first backfills the genuinely-missing back catalogue.
  missing.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return order === "newest" ? db - da : da - db;
  });

  const batch = limit > 0 ? missing.slice(0, limit) : missing;
  console.log(`   ${missing.length} missing audio-only episodes; processing ${batch.length}`);
  console.log("");

  if (dryRun) {
    console.log("DRY RUN — first up to 15 episodes that would be processed:\n");
    for (const ep of batch.slice(0, 15)) {
      const slug = slugify(ep.title);
      const pillar = classifyPillar(ep.title, ep.description, ep.keywords);
      const type = classifyType(ep.title, ep.description);
      console.log(
        `   • [${ep.pubDate ? formatDate(ep.pubDate) : "????"}] ${secondsToReadable(ep.durationSeconds).padStart(7)} ${pillar}/${type}`,
      );
      console.log(`     ${ep.title}`);
      console.log(`     -> ${slug}.mdx`);
    }
    console.log(`\n(${batch.length} total would be processed this run.)`);
    return;
  }

  if (batch.length === 0) {
    console.log("Nothing to do — all caught up.");
    return;
  }

  fs.mkdirSync(TMP_DIR, { recursive: true });

  // 1) Download audio + build the worker manifest.
  type Job = { item: RssItem; slug: string; mp3: string; txt: string };
  const jobs: Job[] = [];
  for (let i = 0; i < batch.length; i++) {
    const ep = batch[i];
    console.log(`[${i + 1}/${batch.length}] ⬇  ${ep.title}`);
    const safe = ep.guid.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 60);
    const mp3 = path.join(TMP_DIR, `${safe}.mp3`);
    const txt = path.join(TMP_DIR, `${safe}.txt`);
    const ok = await downloadAudio(ep.enclosureUrl!, mp3);
    if (!ok) {
      console.log("      ✗ download failed — marking failed");
      state.episodes[ep.guid] = {
        status: "failed",
        title: ep.title,
        error: "download failed",
        updatedAt: new Date().toISOString(),
      };
      continue;
    }
    const slug = uniqueSlug(slugify(ep.title), slugs);
    jobs.push({ item: ep, slug, mp3, txt });
  }
  saveState(state);

  if (jobs.length === 0) {
    console.log("No audio downloaded — aborting transcription step.");
    return;
  }

  // 2) Transcribe the whole batch in ONE python process (model loads once).
  const manifestPath = path.join(TMP_DIR, "manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        model: modelOverride || WHISPER_MODEL,
        compute_type: WHISPER_COMPUTE,
        language: "en",
        jobs: jobs.map((j) => ({ mp3: j.mp3, txt: j.txt })),
      },
      null,
      2,
    ),
  );

  console.log(`\n🧠 Transcribing ${jobs.length} episode(s) with Whisper…\n`);
  const proc = spawnSync("python3", [PY_WORKER, manifestPath], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  if (proc.status !== 0) {
    console.log(`Whisper worker exited with code ${proc.status}.`);
  }

  // 3) Turn each transcript into an MDX file + canonical .txt.
  let written = 0;
  let skipped = 0;
  for (const job of jobs) {
    const { item, slug, mp3, txt } = job;
    try {
      if (!fs.existsSync(txt)) {
        console.log(`   ✗ ${item.title} — no transcript produced`);
        state.episodes[item.guid] = {
          status: "failed",
          title: item.title,
          error: "no transcript file",
          updatedAt: new Date().toISOString(),
        };
        continue;
      }
      const transcript = fs.readFileSync(txt, "utf-8").trim();
      if (transcript.length < minChars) {
        console.log(`   ⚠ ${item.title} — transcript too short (${transcript.length} chars), skipping`);
        state.episodes[item.guid] = {
          status: "skipped",
          slug,
          title: item.title,
          words: transcript.split(/\s+/).length,
          error: "transcript too short",
          updatedAt: new Date().toISOString(),
        };
        skipped++;
        continue;
      }

      const mdx = buildMdx(item, transcript, slug);
      writeFileAtomic(path.join(PODCAST_DIR, `${slug}.mdx`), mdx);
      writeFileAtomic(path.join(TRANSCRIPT_DIR, `${slug}.txt`), transcript);

      const words = transcript.split(/\s+/).length;
      state.episodes[item.guid] = {
        status: "written",
        slug,
        title: item.title,
        words,
        updatedAt: new Date().toISOString(),
      };
      written++;
      console.log(`   ✓ ${slug}.mdx (${words} words)`);
    } catch (err) {
      console.log(`   ✗ ${item.title} — ${(err as Error).message}`);
      state.episodes[item.guid] = {
        status: "failed",
        title: item.title,
        error: (err as Error).message,
        updatedAt: new Date().toISOString(),
      };
    } finally {
      for (const f of [mp3, txt]) {
        try {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        } catch {
          /* ignore cleanup error */
        }
      }
    }
  }

  saveState(state);

  const doneCount = Object.values(state.episodes).filter((e) => e.status === "written").length;
  console.log("\n" + "=".repeat(56));
  console.log(`   This run: ${written} written, ${skipped} skipped`);
  console.log(`   Total transcribed (all runs): ${doneCount}`);
  console.log(`   Remaining missing: ~${missing.length - written - skipped}`);
  console.log("=".repeat(56));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
