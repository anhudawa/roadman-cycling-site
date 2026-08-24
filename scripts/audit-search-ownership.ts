/** Audit canonical search ownership and likely content cannibalisation. */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  SEARCH_OWNERS,
  hasDistinctSupportingIntent,
  normaliseSearchText,
  resolveSearchOwner,
  stripRoadmanBrandSuffix,
} from "../src/lib/seo/search-ownership";

type Severity = "error" | "warning";
interface Finding {
  severity: Severity;
  rule: string;
  owner: string | null;
  pages: string[];
  detail: string;
}
interface Document {
  path: string;
  type: "blog" | "podcast";
  title: string;
  searchText: string[];
}

const root = process.cwd();
const strict = process.argv.includes("--strict");
const noWrite = process.argv.includes("--no-write");

function loadDocuments(): Document[] {
  return (["blog", "podcast"] as const).flatMap((type) => {
    const dir = path.join(root, "content", type);
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => {
        const slug = entry.name.replace(/\.mdx$/, "");
        const { data } = matter(fs.readFileSync(path.join(dir, entry.name), "utf8"));
        const title = stripRoadmanBrandSuffix(String(data.title ?? slug));
        return {
          path: `/${type}/${slug}`,
          type,
          title,
          searchText: [
            title,
            typeof data.seoTitle === "string"
              ? stripRoadmanBrandSuffix(data.seoTitle)
              : data.seoTitle,
            data.seoDescription,
            ...(Array.isArray(data.keywords) ? data.keywords : []),
            ...(Array.isArray(data.topicTags) ? data.topicTags : []),
          ].filter((value): value is string => typeof value === "string"),
        };
      });
  });
}

function intentKey(title: string): string {
  const stop = new Set([
    "a", "an", "and", "are", "best", "complete", "cycling", "for", "guide",
    "how", "in", "of", "roadman", "the", "to", "what", "why", "with",
  ]);
  return normaliseSearchText(title)
    .split(" ")
    // Keep non-year numbers: "7 day" and "30 day" plans are different
    // intents, as are numbered series instalments.
    .filter((token) => !stop.has(token) && !/^20\d{2}$/.test(token))
    .sort()
    .join(" ");
}

function routeExists(routePath: string): boolean {
  const target = routePath.replace(/^\//, "");
  const appDir = path.join(root, "src/app");
  const stack = [appDir];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = path.join(dir, entry.name);
      if (entry.name.startsWith("(") || entry.name === target.split("/")[0]) stack.push(child);
    }
    const relative = path.relative(appDir, dir).replace(/\([^/]+\)\/?/g, "");
    if (relative === target && fs.existsSync(path.join(dir, "page.tsx"))) return true;
  }
  return false;
}

const documents = loadDocuments();
const findings: Finding[] = [];
const ownerPaths = new Set<string>();
const primaryQueries = new Set<string>();

function resolveDocumentOwner(document: Document) {
  return resolveSearchOwner(document.searchText, {
    fallbackId: document.type === "podcast" ? "cycling-podcast" : undefined,
  });
}

for (const owner of SEARCH_OWNERS) {
  if (ownerPaths.has(owner.path)) {
    findings.push({ severity: "error", rule: "duplicate-owner-path", owner: owner.id, pages: [owner.path], detail: "Two search families declare the same canonical path." });
  }
  if (primaryQueries.has(owner.primaryQuery)) {
    findings.push({ severity: "error", rule: "duplicate-primary-query", owner: owner.id, pages: [owner.path], detail: "Two owners declare the same primary query." });
  }
  if (!routeExists(owner.path)) {
    findings.push({ severity: "error", rule: "missing-owner-route", owner: owner.id, pages: [owner.path], detail: "Canonical owner route does not exist." });
  }
  ownerPaths.add(owner.path);
  primaryQueries.add(owner.primaryQuery);
}

const titleGroups = new Map<string, Document[]>();
const intentGroups = new Map<string, Document[]>();
for (const document of documents) {
  const titleKey = normaliseSearchText(document.title);
  titleGroups.set(titleKey, [...(titleGroups.get(titleKey) ?? []), document]);
  const key = intentKey(document.title);
  if (key.split(" ").length >= 3) {
    intentGroups.set(key, [...(intentGroups.get(key) ?? []), document]);
  }

  const owner = resolveDocumentOwner(document);
  if (
    owner &&
    normaliseSearchText(document.title).includes(
      normaliseSearchText(owner.primaryQuery),
    ) &&
    !hasDistinctSupportingIntent(document.title, owner)
  ) {
    findings.push({
      severity: "warning",
      rule: "undifferentiated-head-term-title",
      owner: owner.id,
      pages: [owner.path, document.path],
      detail: `Supporting title targets “${owner.primaryQuery}” without a distinct segment, format, comparison, duration or question intent.`,
    });
  }
}

for (const group of titleGroups.values()) {
  if (group.length > 1) {
    findings.push({ severity: "warning", rule: "duplicate-title", owner: null, pages: group.map((doc) => doc.path), detail: `Exact normalised title is shared by ${group.length} pages.` });
  }
}
for (const group of intentGroups.values()) {
  const uniqueTitles = new Set(group.map((doc) => normaliseSearchText(doc.title)));
  if (group.length > 1 && uniqueTitles.size > 1) {
    findings.push({ severity: "warning", rule: "near-duplicate-intent", owner: null, pages: group.map((doc) => doc.path), detail: `${group.length} titles reduce to the same search-intent tokens.` });
  }
}

const ownerSupport = SEARCH_OWNERS.map((owner) => ({
  id: owner.id,
  path: owner.path,
  primaryQuery: owner.primaryQuery,
  supportingPages: documents
    .filter((document) => resolveDocumentOwner(document)?.id === owner.id)
    .map((document) => document.path),
}));
const errors = findings.filter((finding) => finding.severity === "error");
const warnings = findings.filter((finding) => finding.severity === "warning");
const ruleCounts = warnings.reduce<Record<string, number>>((counts, finding) => {
  counts[finding.rule] = (counts[finding.rule] ?? 0) + 1;
  return counts;
}, {});

console.log("Search Ownership & Cannibalisation Audit");
console.log(`  Documents: ${documents.length}`);
console.log(`  Canonical owners: ${SEARCH_OWNERS.length}`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Review queue: ${warnings.length}`);
for (const [rule, count] of Object.entries(ruleCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${rule}: ${count}`);
}
for (const owner of ownerSupport) {
  console.log(`  ${owner.primaryQuery} -> ${owner.path}: ${owner.supportingPages.length} supporting pages`);
}

if (!noWrite) {
  const reportDir = path.join(root, "seo-reports");
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, "search-ownership.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), owners: ownerSupport, findings }, null, 2),
  );
  const csv = [
    "severity,rule,owner,pages,detail",
    ...findings.map((finding) =>
      [finding.severity, finding.rule, finding.owner ?? "", finding.pages.join(" | "), finding.detail]
        .map((value) => `"${value.replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");
  fs.writeFileSync(path.join(reportDir, "search-cannibalisation.csv"), csv);
}

if (strict && errors.length > 0) process.exitCode = 1;
