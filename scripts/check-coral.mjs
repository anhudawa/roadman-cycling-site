#!/usr/bin/env node
/**
 * check-coral.mjs
 *
 * Enforces the coral-allowlist rule for the Roadman admin panel.
 *
 * Background: we purged coral from the admin UI except for a tight allowlist.
 * Coral is a brand-signature accent and must not creep back into arbitrary
 * buttons, toggles, or status bits $— the surviving uses are intentional and
 * carry design meaning (primary CTA, sidebar active state, mission-control
 * glide path, and unread indicators).
 *
 * Allowed files:
 *   1. src/components/admin/ui.tsx
 *      (primitives file $— owns Button-primary + UnreadBadge coral)
 *   2. src/app/admin/(dashboard)/AdminSidebar.tsx
 *      (coral active-nav indicator $— brand signature)
 *   3. src/app/admin/(dashboard)/mission-control/page.tsx
 *      (the glide-path gradient $— single brand moment)
 *   4. Any file whose basename matches /[uU]nread/ (unread-badge components)
 *
 * Everywhere else under src/app/admin/** and src/components/admin/** this
 * script flags the following tokens (Tailwind classes AND the CSS variable):
 *   text-coral, bg-coral, border-coral, from-coral, to-coral, ring-coral,
 *   via-coral, decoration-coral, placeholder-coral, shadow-coral,
 *   outline-coral, fill-coral, stroke-coral, accent-coral, coral-hover,
 *   --color-coral (in var(...) / arbitrary-value class usage)
 *
 * Exit code: 0 if clean, 1 if any offender is found.
 *
 * Spec: docs/design/admin-coral-allowlist.md (or search "coral purge" in
 * recent commit history).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SCAN_DIRS = [
  path.join(ROOT, 'src/app/admin'),
  path.join(ROOT, 'src/components/admin'),
];

// Allowlisted absolute file paths.
const ALLOWLIST_FILES = new Set([
  path.join(ROOT, 'src/components/admin/ui.tsx'),
  path.join(ROOT, 'src/app/admin/(dashboard)/AdminSidebar.tsx'),
  path.join(ROOT, 'src/app/admin/(dashboard)/mission-control/page.tsx'),
]);

// Regexes to flag. Ordered longest-first so "coral-hover" is reported before
// a bare "coral" token inside it.
const PATTERNS = [
  { name: 'coral-hover',       re: /coral-hover/g },
  { name: 'text-coral',        re: /\btext-coral\b/g },
  { name: 'bg-coral',          re: /\bbg-coral\b/g },
  { name: 'border-coral',      re: /\bborder-[a-z-]*coral\b/g },
  { name: 'from-coral',        re: /\bfrom-coral\b/g },
  { name: 'to-coral',          re: /\bto-coral\b/g },
  { name: 'via-coral',         re: /\bvia-coral\b/g },
  { name: 'ring-coral',        re: /\bring-coral\b/g },
  { name: 'decoration-coral',  re: /\bdecoration-coral\b/g },
  { name: 'placeholder-coral', re: /\bplaceholder-coral\b/g },
  { name: 'shadow-coral',      re: /\bshadow-coral\b/g },
  { name: 'outline-coral',     re: /\boutline-coral\b/g },
  { name: 'fill-coral',        re: /\bfill-coral\b/g },
  { name: 'stroke-coral',      re: /\bstroke-coral\b/g },
  { name: 'accent-coral',      re: /\baccent-coral\b/g },
  { name: '--color-coral',     re: /--color-coral/g },
];

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);

function isAllowlisted(absPath) {
  if (ALLOWLIST_FILES.has(absPath)) return true;
  const base = path.basename(absPath);
  if (/unread/i.test(base)) return true;
  return false;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walk(full, out);
    } else if (entry.isFile()) {
      if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
    }
  }
  return out;
}

function scanFile(absPath) {
  const rel = path.relative(ROOT, absPath);
  const content = fs.readFileSync(absPath, 'utf8');
  const lines = content.split('\n');
  const offenders = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip obvious comment-only lines so narrative mentions of "coral" in
    // spec comments don't trip the guard.
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue;
    }
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      if (re.test(line)) {
        offenders.push({ file: rel, line: i + 1, token: name, snippet: trimmed.slice(0, 200) });
      }
    }
  }
  return offenders;
}

function main() {
  const allFiles = SCAN_DIRS.flatMap((d) => walk(d));
  const offenders = [];
  for (const f of allFiles) {
    if (isAllowlisted(f)) continue;
    offenders.push(...scanFile(f));
  }

  if (offenders.length === 0) {
    console.log('coral-allowlist: clean. No coral usage outside allowlist.');
    process.exit(0);
  }

  console.error('');
  console.error('coral-allowlist violation: coral class or CSS variable used outside the allowlist.');
  console.error('');
  console.error('Coral is reserved for:');
  console.error('  1. src/components/admin/ui.tsx           (Button-primary + UnreadBadge)');
  console.error('  2. src/app/admin/(dashboard)/AdminSidebar.tsx  (active-nav indicator)');
  console.error('  3. src/app/admin/(dashboard)/mission-control/page.tsx  (glide-path gradient)');
  console.error('  4. Any file named *[uU]nread* (unread indicator components)');
  console.error('');
  console.error('Fix: use a neutral/brand token from the admin palette, or import');
  console.error('a primitive from src/components/admin/ui.tsx (Button, UnreadBadge).');
  console.error('See the coral-purge commit series (git log --grep="coral purge") for examples.');
  console.error('');
  console.error(`Offenders (${offenders.length}):`);
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}  [${o.token}]  ${o.snippet}`);
  }
  console.error('');
  process.exit(1);
}

main();
