import matter from 'gray-matter';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

// Slop terms. Some are context-sensitive (metaphor vs literal cycling usage).
// We use regexes and then apply literal-usage filters.
const SLOP = [
  { key: 'unlock', re: /\bunlock(s|ed|ing)?\b/i },
  { key: 'dive into', re: /\bdiv(e|es|ing) (in|into)\b/i },
  { key: 'dive in', re: /\bdive in\b/i },
  { key: 'game-changer', re: /\bgame[- ]chang(er|ers|ing)\b/i },
  { key: 'journey', re: /\bjourney(s)?\b/i },
  { key: 'landscape', re: /\blandscape(s)?\b/i },
  { key: 'leverage', re: /\bleverag(e|es|ed|ing)\b/i },
  { key: 'tapestry', re: /\btapestr(y|ies)\b/i },
  { key: 'delve', re: /\bdelv(e|es|ed|ing)\b/i },
  { key: 'harness', re: /\bharness(es|ed|ing)?\b/i },
  { key: 'navigate', re: /\bnavigat(e|es|ed|ing)\b/i },
  { key: 'elevate', re: /\belevat(e|es|ed|ing)\b/i },
  { key: "it's important to note", re: /it'?s important to note/i },
  { key: "in today's world", re: /in today'?s (world|fast-paced)/i },
];

// Editorial fields safe to rewrite. NOT transcript/keyQuotes/claims (verbatim or paraphrased speech).
const EDITORIAL_FIELDS = new Set([
  'title', 'seoTitle', 'seoDescription', 'description', 'excerpt', 'summary',
  'answerCapsule', 'metaDescription', 'guestBio', 'intro',
]);
// Array/object fields whose string leaves are editorial
const EDITORIAL_ARRAY_FIELDS = new Set([
  'keyTakeaways', 'segmentTitles', 'faq', 'takeaways',
]);

function literalUsage(term, context) {
  const c = context.toLowerCase();
  if (term === 'elevate') {
    // Only the motivational METAPHOR is slop ("elevate your training/performance/game").
    // Everything else (elevated HR, elevated cortisol, elevated leg, elevation) is literal.
    const metaphor = /elevat\w*\s+(your|their|the\s+rider'?s|our|his|her|my)?\s*(training|performance|riding|game|fitness|results?|season|racing|cycling|level|potential|ability|abilities|experience|status)\b/.test(c)
      || /elevat\w*\s+(to|towards)\s+(the\s+)?(next|a\s+(?:higher|new|whole)|world[- ]class|elite|pro)\b/.test(c)
      || /elevat\w*\s+you\b/.test(c);
    return !metaphor; // literal unless it matches the metaphor pattern
  }
  if (term === 'journey') {
    // literal trip = a physical journey of distance/time
    if (/(car|train|bus|commut\w+|urban|short|daily|return|each|every|round[- ]?trip|outward)\s+journey/.test(c)) return true;
    if (/journey\s+(time|under|of\s+\d|distance|to\s+work|home)/.test(c)) return true;
    if (/\d\s*(km|kms|kilometres?|kilometers?|miles?|min|minutes?|hours?)\b[^.]*journey/.test(c)) return true;
  }
  if (term === 'navigate') {
    // navigating a route/descent/junction/roundabout literal
    if (/navigat\w*\s+(a|the|this|that|technical|tight|the\s+route|descents?|corners?|junctions?|roundabouts?|traffic|gravel|terrain|switchbacks?|the\s+course)/.test(c)) return true;
  }
  if (term === 'leverage') {
    // physical leverage: crank, pedal, gear, bar, body weight
    if (/(crank|pedal|gear|handlebar|bar|body[\s-]?weight|mechanical|torque|hip|knee)\s+leverage/.test(c)) return true;
    if (/leverage\s+(from|on|of)\s+(the\s+)?(crank|pedal|bar|saddle|hips?|core)/.test(c)) return true;
    if (/more\s+leverage\s+(on|over|through)/.test(c) && /(pedal|crank|bar|bike|gear)/.test(c)) return true;
  }
  if (term === 'harness') {
    // physical harness (bike fit harness, turbo) - rare; treat 'harness the' verb as slop
    if (/(turbo|chest|safety|trainer)\s+harness/.test(c)) return true;
  }
  if (term === 'landscape') {
    if (/landscape\s+(orientation|mode|format|photo|image|view)/.test(c)) return true;
  }
  return false;
}

function snippet(text, idx, len) {
  const start = Math.max(0, idx - 45);
  const end = Math.min(text.length, idx + len + 45);
  return (start > 0 ? '…' : '') + text.slice(start, end).replace(/\n/g, ' ').replace(/\s+/g, ' ') + (end < text.length ? '…' : '');
}

function scanString(text, field, file, hits) {
  for (const { key, re } of SLOP) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = g.exec(text)) !== null) {
      const ctx = snippet(text, m.index, m[0].length);
      if (literalUsage(key, ctx)) continue;
      hits.push({ file, field, term: key, match: m[0], ctx });
      if (m.index === g.lastIndex) g.lastIndex++;
    }
  }
}

function walkValue(val, fieldName, file, hits, topLevel) {
  if (typeof val === 'string') {
    // only scan if this field (or its top-level container) is editorial
    if (EDITORIAL_FIELDS.has(topLevel) || EDITORIAL_ARRAY_FIELDS.has(topLevel)) {
      scanString(val, topLevel, file, hits);
    }
  } else if (Array.isArray(val)) {
    for (const v of val) walkValue(v, fieldName, file, hits, topLevel);
  } else if (val && typeof val === 'object') {
    for (const [k, v] of Object.entries(val)) walkValue(v, k, file, hits, topLevel);
  }
}

function scanFrontmatter(data, file, hits) {
  for (const [k, v] of Object.entries(data)) {
    if (EDITORIAL_FIELDS.has(k) || EDITORIAL_ARRAY_FIELDS.has(k)) {
      walkValue(v, k, file, hits, k);
    }
  }
}

function isLikelyTranscriptBody(body) {
  // Podcast bodies are often empty or just transcript echoes; blog bodies are prose.
  return false;
}

function scanFile(file, opts) {
  const raw = readFileSync(file, 'utf8');
  const hits = [];
  if (file.endsWith('.mdx') || file.endsWith('.md')) {
    let parsed;
    try { parsed = matter(raw); } catch { return hits; }
    scanFrontmatter(parsed.data, file, hits);
    if (opts.scanBody) {
      scanString(parsed.content, '(body)', file, hits);
    }
  }
  return hits;
}

function walkDir(dir, exts, out) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) { if (e !== 'node_modules' && e !== '.next') walkDir(p, exts, out); }
    else if (exts.includes(extname(p))) out.push(p);
  }
}

const targets = [
  { dir: 'content/podcast', scanBody: false },
  { dir: 'content/blog', scanBody: true },
  { dir: 'content/seo', scanBody: true },
  { dir: 'content/topics', scanBody: true },
  { dir: 'content/method', scanBody: true },
  { dir: 'content/entities', scanBody: true },
  { dir: 'content/repurposed', scanBody: true },
  { dir: 'content/emails', scanBody: true },
  { dir: 'content/drafts', scanBody: true },
];

const allHits = [];
for (const t of targets) {
  let files = [];
  try { walkDir(t.dir, ['.mdx', '.md'], files); } catch { continue; }
  for (const f of files) allHits.push(...scanFile(f, t));
}

// Summary
const byTerm = {};
const byFile = {};
for (const h of allHits) {
  byTerm[h.term] = (byTerm[h.term] || 0) + 1;
  byFile[h.file] = (byFile[h.file] || 0) + 1;
}
console.log('=== SLOP by term (editorial fields + blog/content bodies; transcripts & verbatim quotes excluded) ===');
for (const [k, v] of Object.entries(byTerm).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log(`\nTotal hits: ${allHits.length} across ${Object.keys(byFile).length} files`);

if (process.argv.includes('--detail')) {
  console.log('\n=== DETAIL ===');
  for (const h of allHits) {
    console.log(`${h.file}\t[${h.field}]\t${h.term} :: ${h.ctx}`);
  }
}
