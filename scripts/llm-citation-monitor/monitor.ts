#!/usr/bin/env tsx
/**
 * LLM Citation Monitor — AEO Scoreboard for Roadman Cycling
 *
 * Runs ~20 persona-based queries against Google search, logs which domains
 * appear in results, and tracks whether roadmancycling.com gets cited.
 *
 * Usage:
 *   npx tsx scripts/llm-citation-monitor/monitor.ts
 *   npx tsx scripts/llm-citation-monitor/monitor.ts --dry-run
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QueryEntry {
  id: string;
  persona: string;
  query: string;
  intent: string;
  priority: string;
}

interface PersonaEntry {
  id: string;
  name: string;
  description: string;
}

interface QueryBank {
  version: number;
  updated: string;
  personas: PersonaEntry[];
  queries: QueryEntry[];
}

interface DomainHit {
  domain: string;
  url: string;
  title: string;
  position: number;
}

interface QueryResult {
  id: string;
  persona: string;
  query: string;
  intent: string;
  priority: string;
  timestamp: string;
  domains: DomainHit[];
  roadmanPosition: number | null;
  roadmanUrl: string | null;
  topCompetitors: string[];
  error: string | null;
}

interface ReportSummary {
  totalQueries: number;
  queriesChecked: number;
  queriesFailed: number;
  roadmanAppearances: number;
  roadmanAppearanceRate: string;
  averagePosition: number | null;
  bestPosition: number | null;
  worstPosition: number | null;
  topCompetitorsByFrequency: { domain: string; count: number }[];
  personaBreakdown: {
    persona: string;
    name: string;
    queriesChecked: number;
    roadmanAppearances: number;
    appearanceRate: string;
  }[];
}

interface PreviousComparison {
  previousDate: string;
  appearanceRateDelta: string;
  averagePositionDelta: string;
  newAppearances: string[];
  lostAppearances: string[];
}

interface CitationReport {
  reportDate: string;
  generatedAt: string;
  targetDomain: string;
  results: QueryResult[];
  summary: ReportSummary;
  comparison: PreviousComparison | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARGET_DOMAIN = 'roadmancycling.com';
const REPORTS_DIR = join(__dirname, 'reports');
const QUERIES_PATH = join(__dirname, 'queries.json');

const MAX_RESULTS_PER_QUERY = 20;
const DELAY_BETWEEN_QUERIES_MS = 3000; // Be respectful to Google
const FETCH_TIMEOUT_MS = 15000;

const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function log(msg: string): void {
  const ts = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${ts}] ${msg}`);
}

function warn(msg: string): void {
  const ts = new Date().toISOString().split('T')[1].split('.')[0];
  console.warn(`[${ts}] WARN: ${msg}`);
}

// ---------------------------------------------------------------------------
// Google search via HTML scraping
// ---------------------------------------------------------------------------

/**
 * Fetches Google search results by parsing the HTML response.
 * This is a lightweight approach that doesn't require an API key.
 *
 * Note: Google may block automated requests. The script handles this
 * gracefully by logging errors and continuing with remaining queries.
 */
async function searchGoogle(query: string): Promise<DomainHit[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://www.google.com/search?q=${encoded}&num=${MAX_RESULTS_PER_QUERY}&hl=en`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    }

    const html = await resp.text();
    return parseSearchResults(html);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse organic results from Google's HTML.
 * Looks for anchor tags with actual outbound URLs (not Google internal links).
 */
function parseSearchResults(html: string): DomainHit[] {
  const hits: DomainHit[] = [];
  const seen = new Set<string>();

  // Strategy 1: Extract URLs from href attributes pointing to external sites.
  // Google wraps results in <a> tags with href="/url?q=ACTUAL_URL&..." or direct hrefs.
  const urlPatterns = [
    // Google redirect URLs: /url?q=https://example.com/page&...
    /\/url\?q=(https?:\/\/[^&"]+)/g,
    // Direct href URLs in result blocks
    /href="(https?:\/\/(?!(?:www\.)?google\.com|accounts\.google\.com|support\.google\.com|maps\.google\.com|play\.google\.com|policies\.google\.com|consent\.google\.com)[^"]+)"/g,
  ];

  for (const pattern of urlPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      let resultUrl = decodeURIComponent(match[1]);
      // Clean trailing Google tracking params
      resultUrl = resultUrl.split('&sa=')[0].split('&ved=')[0];

      const domain = extractDomain(resultUrl);
      if (!domain || seen.has(resultUrl)) continue;
      // Skip Google properties, YouTube shorts, image results, etc.
      if (domain.includes('google.') || domain === 'youtube.com' || domain === 'youtu.be') continue;
      // Skip common non-content domains
      if (domain === 'schema.org' || domain === 'w3.org') continue;

      seen.add(resultUrl);
      hits.push({
        domain,
        url: resultUrl,
        title: '', // Title extraction is unreliable from raw HTML; domain+url is sufficient
        position: hits.length + 1,
      });
    }
  }

  return hits;
}

// ---------------------------------------------------------------------------
// Alternative: SearXNG public instance fallback
// ---------------------------------------------------------------------------

async function searchSearXNG(query: string): Promise<DomainHit[]> {
  // Try a few public SearXNG instances as fallback
  const instances = [
    'https://search.sapti.me',
    'https://searx.be',
    'https://search.bus-hit.me',
  ];

  for (const instance of instances) {
    try {
      const encoded = encodeURIComponent(query);
      const url = `${instance}/search?q=${encoded}&format=json&categories=general&engines=google,bing,duckduckgo`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeout);

      if (!resp.ok) continue;

      const data = (await resp.json()) as {
        results?: { url: string; title: string }[];
      };

      if (!data.results || data.results.length === 0) continue;

      const seen = new Set<string>();
      return data.results
        .filter((r) => {
          const domain = extractDomain(r.url);
          if (!domain || seen.has(domain)) return false;
          if (domain.includes('google.') || domain === 'youtube.com') return false;
          seen.add(domain);
          return true;
        })
        .slice(0, MAX_RESULTS_PER_QUERY)
        .map((r, i) => ({
          domain: extractDomain(r.url),
          url: r.url,
          title: r.title || '',
          position: i + 1,
        }));
    } catch {
      continue;
    }
  }

  return [];
}

// ---------------------------------------------------------------------------
// Combined search with fallback
// ---------------------------------------------------------------------------

async function runSearch(query: string): Promise<DomainHit[]> {
  // Try Google first
  try {
    const results = await searchGoogle(query);
    if (results.length > 0) return results;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    warn(`Google search failed for "${query}": ${msg}`);
  }

  // Fallback to SearXNG
  try {
    const results = await searchSearXNG(query);
    if (results.length > 0) {
      log(`  Used SearXNG fallback`);
      return results;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    warn(`SearXNG fallback also failed for "${query}": ${msg}`);
  }

  return [];
}

// ---------------------------------------------------------------------------
// Process a single query
// ---------------------------------------------------------------------------

async function processQuery(entry: QueryEntry): Promise<QueryResult> {
  const timestamp = new Date().toISOString();

  if (DRY_RUN) {
    log(`  [DRY RUN] Would search: "${entry.query}"`);
    return {
      id: entry.id,
      persona: entry.persona,
      query: entry.query,
      intent: entry.intent,
      priority: entry.priority,
      timestamp,
      domains: [],
      roadmanPosition: null,
      roadmanUrl: null,
      topCompetitors: [],
      error: 'dry-run',
    };
  }

  try {
    const domains = await runSearch(entry.query);

    // Find Roadman position
    const roadmanHit = domains.find(
      (d) => d.domain === TARGET_DOMAIN || d.domain === `www.${TARGET_DOMAIN}`
    );

    // Top competitors (excluding Roadman)
    const topCompetitors = domains
      .filter((d) => d.domain !== TARGET_DOMAIN && d.domain !== `www.${TARGET_DOMAIN}`)
      .slice(0, 3)
      .map((d) => d.domain);

    return {
      id: entry.id,
      persona: entry.persona,
      query: entry.query,
      intent: entry.intent,
      priority: entry.priority,
      timestamp,
      domains,
      roadmanPosition: roadmanHit?.position ?? null,
      roadmanUrl: roadmanHit?.url ?? null,
      topCompetitors,
      error: domains.length === 0 ? 'no-results' : null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      id: entry.id,
      persona: entry.persona,
      query: entry.query,
      intent: entry.intent,
      priority: entry.priority,
      timestamp,
      domains: [],
      roadmanPosition: null,
      roadmanUrl: null,
      topCompetitors: [],
      error: msg,
    };
  }
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function buildSummary(results: QueryResult[], personas: PersonaEntry[]): ReportSummary {
  const checked = results.filter((r) => r.error !== 'dry-run');
  const failed = checked.filter((r) => r.error && r.error !== 'dry-run');
  const successful = checked.filter((r) => !r.error);

  const appearances = successful.filter((r) => r.roadmanPosition !== null);
  const positions = appearances.map((r) => r.roadmanPosition!);

  // Competitor frequency across all results
  const competitorCounts = new Map<string, number>();
  for (const result of successful) {
    for (const hit of result.domains) {
      if (hit.domain !== TARGET_DOMAIN && hit.domain !== `www.${TARGET_DOMAIN}`) {
        competitorCounts.set(hit.domain, (competitorCounts.get(hit.domain) || 0) + 1);
      }
    }
  }
  const topCompetitors = Array.from(competitorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  // Per-persona breakdown
  const personaBreakdown = personas.map((p) => {
    const pResults = successful.filter((r) => r.persona === p.id);
    const pAppearances = pResults.filter((r) => r.roadmanPosition !== null);
    return {
      persona: p.id,
      name: p.name,
      queriesChecked: pResults.length,
      roadmanAppearances: pAppearances.length,
      appearanceRate:
        pResults.length > 0
          ? `${Math.round((pAppearances.length / pResults.length) * 100)}%`
          : 'N/A',
    };
  });

  return {
    totalQueries: results.length,
    queriesChecked: checked.length,
    queriesFailed: failed.length,
    roadmanAppearances: appearances.length,
    roadmanAppearanceRate:
      successful.length > 0
        ? `${Math.round((appearances.length / successful.length) * 100)}%`
        : 'N/A',
    averagePosition:
      positions.length > 0
        ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
        : null,
    bestPosition: positions.length > 0 ? Math.min(...positions) : null,
    worstPosition: positions.length > 0 ? Math.max(...positions) : null,
    topCompetitorsByFrequency: topCompetitors,
    personaBreakdown,
  };
}

function findPreviousReport(): CitationReport | null {
  if (!existsSync(REPORTS_DIR)) return null;

  const files = readdirSync(REPORTS_DIR)
    .filter((f) => f.startsWith('citation-report-') && f.endsWith('.json'))
    .sort()
    .reverse();

  // Skip today's report if it exists (we're about to overwrite it)
  const todayFile = `citation-report-${today()}.json`;
  const previous = files.find((f) => f !== todayFile);
  if (!previous) return null;

  try {
    const raw = readFileSync(join(REPORTS_DIR, previous), 'utf-8');
    return JSON.parse(raw) as CitationReport;
  } catch {
    return null;
  }
}

function buildComparison(
  current: QueryResult[],
  previous: CitationReport
): PreviousComparison | null {
  const currentSuccess = current.filter((r) => !r.error);
  const prevSuccess = previous.results.filter((r) => !r.error);

  if (currentSuccess.length === 0 || prevSuccess.length === 0) return null;

  const currentRate =
    currentSuccess.filter((r) => r.roadmanPosition !== null).length / currentSuccess.length;
  const prevRate =
    prevSuccess.filter((r) => r.roadmanPosition !== null).length / prevSuccess.length;
  const rateDelta = currentRate - prevRate;

  const currentPositions = currentSuccess
    .filter((r) => r.roadmanPosition !== null)
    .map((r) => r.roadmanPosition!);
  const prevPositions = prevSuccess
    .filter((r) => r.roadmanPosition !== null)
    .map((r) => r.roadmanPosition!);

  const currentAvg =
    currentPositions.length > 0
      ? currentPositions.reduce((a, b) => a + b, 0) / currentPositions.length
      : null;
  const prevAvg =
    prevPositions.length > 0
      ? prevPositions.reduce((a, b) => a + b, 0) / prevPositions.length
      : null;

  // Queries where Roadman now appears but didn't before
  const prevAppearing = new Set(
    prevSuccess.filter((r) => r.roadmanPosition !== null).map((r) => r.id)
  );
  const currentAppearing = new Set(
    currentSuccess.filter((r) => r.roadmanPosition !== null).map((r) => r.id)
  );

  const newAppearances = Array.from(currentAppearing).filter((id) => !prevAppearing.has(id));
  const lostAppearances = Array.from(prevAppearing).filter((id) => !currentAppearing.has(id));

  let positionDelta = 'N/A';
  if (currentAvg !== null && prevAvg !== null) {
    const delta = currentAvg - prevAvg;
    positionDelta = delta > 0 ? `+${delta.toFixed(1)} (worse)` : `${delta.toFixed(1)} (better)`;
  } else if (currentAvg !== null && prevAvg === null) {
    positionDelta = 'New appearances (no previous data)';
  }

  return {
    previousDate: previous.reportDate,
    appearanceRateDelta: `${rateDelta >= 0 ? '+' : ''}${(rateDelta * 100).toFixed(1)}pp`,
    averagePositionDelta: positionDelta,
    newAppearances,
    lostAppearances,
  };
}

// ---------------------------------------------------------------------------
// Markdown report
// ---------------------------------------------------------------------------

function generateMarkdown(report: CitationReport, personas: PersonaEntry[]): string {
  const { summary, comparison, results } = report;
  const lines: string[] = [];

  lines.push(`# Citation Monitor Report — ${report.reportDate}`);
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Target: ${report.targetDomain}`);
  lines.push('');

  // Executive summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Queries checked | ${summary.queriesChecked} |`);
  lines.push(`| Failed queries | ${summary.queriesFailed} |`);
  lines.push(`| Roadman appearances | ${summary.roadmanAppearances} |`);
  lines.push(`| Appearance rate | ${summary.roadmanAppearanceRate} |`);
  lines.push(
    `| Average position | ${summary.averagePosition !== null ? summary.averagePosition : 'N/A'} |`
  );
  lines.push(
    `| Best position | ${summary.bestPosition !== null ? summary.bestPosition : 'N/A'} |`
  );
  lines.push(
    `| Worst position | ${summary.worstPosition !== null ? summary.worstPosition : 'N/A'} |`
  );
  lines.push('');

  // Month-over-month comparison
  if (comparison) {
    lines.push('## Month-over-Month Comparison');
    lines.push('');
    lines.push(`Previous report: ${comparison.previousDate}`);
    lines.push('');
    lines.push(`| Metric | Delta |`);
    lines.push(`| --- | --- |`);
    lines.push(`| Appearance rate | ${comparison.appearanceRateDelta} |`);
    lines.push(`| Avg position | ${comparison.averagePositionDelta} |`);
    lines.push('');

    if (comparison.newAppearances.length > 0) {
      lines.push('**New appearances** (Roadman now shows up):');
      for (const id of comparison.newAppearances) {
        const q = results.find((r) => r.id === id);
        lines.push(`- ${id}: "${q?.query}"`);
      }
      lines.push('');
    }

    if (comparison.lostAppearances.length > 0) {
      lines.push('**Lost appearances** (Roadman no longer shows up):');
      for (const id of comparison.lostAppearances) {
        const q = results.find((r) => r.id === id);
        lines.push(`- ${id}: "${q?.query}"`);
      }
      lines.push('');
    }
  }

  // Per-persona breakdown
  lines.push('## Persona Breakdown');
  lines.push('');
  lines.push(`| Persona | Checked | Appearances | Rate |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const pb of summary.personaBreakdown) {
    const persona = personas.find((p) => p.id === pb.persona);
    const desc = persona ? ` (${persona.description})` : '';
    lines.push(
      `| ${pb.name}${desc} | ${pb.queriesChecked} | ${pb.roadmanAppearances} | ${pb.appearanceRate} |`
    );
  }
  lines.push('');

  // Detailed results per persona
  lines.push('## Detailed Results');
  lines.push('');

  const personaIds = Array.from(new Set(results.map((r) => r.persona)));
  for (const pid of personaIds) {
    const persona = personas.find((p) => p.id === pid);
    lines.push(`### ${persona?.name || pid}`);
    lines.push('');

    const pResults = results.filter((r) => r.persona === pid);
    for (const r of pResults) {
      const status = r.error
        ? `ERROR: ${r.error}`
        : r.roadmanPosition !== null
          ? `FOUND at position ${r.roadmanPosition}`
          : 'NOT FOUND';

      const statusMarker = r.error ? '?' : r.roadmanPosition !== null ? '+' : '-';

      lines.push(`**[${statusMarker}] "${r.query}"** — ${status}`);

      if (!r.error && r.topCompetitors.length > 0) {
        lines.push(`  Top competitors: ${r.topCompetitors.join(', ')}`);
      }
      if (r.roadmanUrl) {
        lines.push(`  Roadman URL: ${r.roadmanUrl}`);
      }
      lines.push('');
    }
  }

  // Top competitors
  lines.push('## Top Competitors by Frequency');
  lines.push('');
  lines.push(`| Domain | Appearances |`);
  lines.push(`| --- | --- |`);
  for (const c of summary.topCompetitorsByFrequency) {
    lines.push(`| ${c.domain} | ${c.count} |`);
  }
  lines.push('');

  // Action items
  const missing = results.filter((r) => !r.error && r.roadmanPosition === null);
  if (missing.length > 0) {
    lines.push('## Action Items');
    lines.push('');
    lines.push(
      'Queries where Roadman Cycling does not appear in results. These are content gaps or ranking opportunities.'
    );
    lines.push('');
    for (const m of missing) {
      const persona = personas.find((p) => p.id === m.persona);
      lines.push(
        `- **"${m.query}"** (${persona?.name || m.persona}, ${m.priority} priority, ${m.intent})`
      );
      if (m.topCompetitors.length > 0) {
        lines.push(`  Currently dominated by: ${m.topCompetitors.join(', ')}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('');
  console.log('===========================================');
  console.log('  LLM Citation Monitor — AEO Scoreboard');
  console.log('  Target: roadmancycling.com');
  console.log('===========================================');
  console.log('');

  if (DRY_RUN) {
    console.log('  MODE: DRY RUN (no network requests)');
    console.log('');
  }

  // Load query bank
  const queryBank: QueryBank = JSON.parse(readFileSync(QUERIES_PATH, 'utf-8'));
  log(`Loaded ${queryBank.queries.length} queries across ${queryBank.personas.length} personas`);

  // Ensure reports directory exists
  mkdirSync(REPORTS_DIR, { recursive: true });

  // Process queries
  const results: QueryResult[] = [];
  for (let i = 0; i < queryBank.queries.length; i++) {
    const entry = queryBank.queries[i];
    const persona = queryBank.personas.find((p) => p.id === entry.persona);
    log(
      `[${i + 1}/${queryBank.queries.length}] ${persona?.name || entry.persona}: "${entry.query}"`
    );

    const result = await processQuery(entry);
    results.push(result);

    if (!DRY_RUN && result.roadmanPosition !== null) {
      log(`  >> FOUND at position ${result.roadmanPosition}`);
    } else if (!DRY_RUN && !result.error) {
      log(`  >> Not found in results`);
    }

    if (result.error && result.error !== 'dry-run' && result.error !== 'no-results') {
      warn(`  Error: ${result.error}`);
    }

    // Delay between queries (skip after last query)
    if (!DRY_RUN && i < queryBank.queries.length - 1) {
      await sleep(DELAY_BETWEEN_QUERIES_MS);
    }
  }

  // Build summary
  const summary = buildSummary(results, queryBank.personas);

  // Check for previous report
  const previousReport = findPreviousReport();
  const comparison = previousReport ? buildComparison(results, previousReport) : null;

  if (previousReport) {
    log(`Found previous report from ${previousReport.reportDate} for comparison`);
  }

  // Build report
  const report: CitationReport = {
    reportDate: today(),
    generatedAt: new Date().toISOString(),
    targetDomain: TARGET_DOMAIN,
    results,
    summary,
    comparison,
  };

  // Write JSON report
  const jsonPath = join(REPORTS_DIR, `citation-report-${today()}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  log(`JSON report written to ${jsonPath}`);

  // Write markdown report
  const mdPath = join(REPORTS_DIR, `citation-report-${today()}.md`);
  const markdown = generateMarkdown(report, queryBank.personas);
  writeFileSync(mdPath, markdown);
  log(`Markdown report written to ${mdPath}`);

  // Print summary to console
  console.log('');
  console.log('===========================================');
  console.log('  Summary');
  console.log('===========================================');
  console.log(`  Queries checked:     ${summary.queriesChecked}`);
  console.log(`  Failed:              ${summary.queriesFailed}`);
  console.log(`  Roadman appearances: ${summary.roadmanAppearances}`);
  console.log(`  Appearance rate:     ${summary.roadmanAppearanceRate}`);
  console.log(
    `  Average position:    ${summary.averagePosition !== null ? summary.averagePosition : 'N/A'}`
  );
  console.log(
    `  Best position:       ${summary.bestPosition !== null ? summary.bestPosition : 'N/A'}`
  );

  if (comparison) {
    console.log('');
    console.log('  Month-over-month:');
    console.log(`    Rate delta:        ${comparison.appearanceRateDelta}`);
    console.log(`    Position delta:    ${comparison.averagePositionDelta}`);
    console.log(`    New appearances:   ${comparison.newAppearances.length}`);
    console.log(`    Lost appearances:  ${comparison.lostAppearances.length}`);
  }

  console.log('');
  console.log(`  Reports saved to: ${REPORTS_DIR}/`);
  console.log('===========================================');
  console.log('');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
