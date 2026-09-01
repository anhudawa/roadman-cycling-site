export const LIVE_SEARCH_OWNER_ROUTES = [
  "/coaching",
  "/masters",
  "/training-plans",
  "/training-camps",
  "/podcast",
  "/app",
] as const;

type JsonRecord = Record<string, unknown>;

export interface OwnerDocumentAudit {
  route: (typeof LIVE_SEARCH_OWNER_ROUTES)[number];
  errors: string[];
  relatedLinks: string[];
  entityReferences: Array<{ id: string; expectedType: string }>;
}

export interface LiveOwnerAuditReport {
  pagesChecked: number;
  relationshipsChecked: number;
  errors: string[];
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasType(node: JsonRecord, expectedType: string): boolean {
  const value = node["@type"];
  return value === expectedType ||
    (Array.isArray(value) && value.includes(expectedType));
}

function topLevelNodes(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) return value.flatMap(topLevelNodes);
  if (!isRecord(value)) return [];

  const graph = value["@graph"];
  return graph ? [value, ...topLevelNodes(graph)] : [value];
}

function deepNodes(value: unknown, output: JsonRecord[] = []): JsonRecord[] {
  if (Array.isArray(value)) {
    for (const item of value) deepNodes(item, output);
  } else if (isRecord(value)) {
    output.push(value);
    for (const item of Object.values(value)) deepNodes(item, output);
  }
  return output;
}

export function parseJsonLdRoots(html: string): JsonRecord[] {
  const roots: JsonRecord[] = [];
  const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    try {
      roots.push(...topLevelNodes(JSON.parse(match[1])));
    } catch {
      // A malformed block is reported separately by the missing-node checks.
    }
  }

  return roots;
}

export function extractCanonical(html: string): string | null {
  return html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;
}

function referenceId(value: unknown): string | null {
  return isRecord(value) && typeof value["@id"] === "string"
    ? value["@id"]
    : null;
}

export function auditOwnerDocument(
  route: (typeof LIVE_SEARCH_OWNER_ROUTES)[number],
  html: string,
  origin = "https://roadmancycling.com",
): OwnerDocumentAudit {
  const errors: string[] = [];
  const expectedUrl = `${origin}${route}`;
  const roots = parseJsonLdRoots(html);
  const canonical = extractCanonical(html);
  const breadcrumbs = roots.filter((node) => hasType(node, "BreadcrumbList"));
  const ownerId = `${expectedUrl}#webpage`;
  const ownerNodes = roots.filter((node) => node["@id"] === ownerId);
  const owner = ownerNodes[0];

  if (canonical !== expectedUrl) {
    errors.push(`${route}: expected canonical ${expectedUrl}, got ${canonical}`);
  }
  if (breadcrumbs.length !== 1) {
    errors.push(`${route}: expected one BreadcrumbList, got ${breadcrumbs.length}`);
  }
  if (ownerNodes.length !== 1) {
    errors.push(`${route}: expected one canonical owner node, got ${ownerNodes.length}`);
  }
  if (!html.includes('aria-label="Sources, author, and editorial standards"')) {
    errors.push(`${route}: visible sources and trust block is missing`);
  }
  if (!html.includes("Reviewed by") || !html.includes("Last reviewed")) {
    errors.push(`${route}: visible reviewer or review date is missing`);
  }

  const relatedLinks = owner && Array.isArray(owner.relatedLink)
    ? owner.relatedLink.filter((value): value is string => typeof value === "string")
    : [];
  if (relatedLinks.length < 2) {
    errors.push(`${route}: expected at least two related resources`);
  }

  const authorId = owner ? referenceId(owner.author) : null;
  const reviewerId = owner ? referenceId(owner.reviewedBy) : null;
  const websiteId = owner ? referenceId(owner.isPartOf) : null;
  const dateModified = owner?.dateModified;

  if (!authorId) errors.push(`${route}: author entity reference is missing`);
  if (!reviewerId) errors.push(`${route}: reviewer entity reference is missing`);
  if (!websiteId) errors.push(`${route}: website entity reference is missing`);
  if (typeof dateModified !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateModified)) {
    errors.push(`${route}: valid dateModified is missing`);
  }

  return {
    route,
    errors,
    relatedLinks,
    entityReferences: [
      ...(authorId ? [{ id: authorId, expectedType: "Person" }] : []),
      ...(reviewerId ? [{ id: reviewerId, expectedType: "Organization" }] : []),
      ...(websiteId ? [{ id: websiteId, expectedType: "WebSite" }] : []),
    ],
  };
}

export async function auditLiveSearchOwners(
  origin = "https://roadmancycling.com",
  fetcher: typeof fetch = fetch,
): Promise<LiveOwnerAuditReport> {
  const errors: string[] = [];
  const pageAudits: OwnerDocumentAudit[] = [];
  const responseCache = new Map<string, { status: number; html: string }>();

  async function fetchPage(url: string) {
    const cached = responseCache.get(url);
    if (cached) return cached;

    const response = await fetcher(url);
    const result = { status: response.status, html: await response.text() };
    responseCache.set(url, result);
    return result;
  }

  for (const route of LIVE_SEARCH_OWNER_ROUTES) {
    const url = `${origin}${route}`;
    const response = await fetchPage(url);
    if (response.status !== 200) {
      errors.push(`${route}: expected HTTP 200, got ${response.status}`);
      continue;
    }

    const audit = auditOwnerDocument(route, response.html, origin);
    pageAudits.push(audit);
    errors.push(...audit.errors);
  }

  const relatedLinks = new Set(pageAudits.flatMap((audit) => audit.relatedLinks));
  for (const url of relatedLinks) {
    const response = await fetchPage(url);
    if (response.status !== 200) {
      errors.push(`${url}: related resource returned HTTP ${response.status}`);
    } else if (extractCanonical(response.html) !== url) {
      errors.push(`${url}: related resource is not self-canonical`);
    }
  }

  const references = new Map<string, string>();
  for (const reference of pageAudits.flatMap((audit) => audit.entityReferences)) {
    references.set(reference.id, reference.expectedType);
  }
  for (const [id, expectedType] of references) {
    const url = id.split("#")[0] || origin;
    const response = await fetchPage(url);
    const nodes = parseJsonLdRoots(response.html).flatMap((node) => deepNodes(node));
    const resolved = nodes.some(
      (node) => node["@id"] === id && hasType(node, expectedType),
    );
    if (response.status !== 200 || !resolved) {
      errors.push(`${id}: did not resolve to a ${expectedType} node`);
    }
  }

  return {
    pagesChecked: pageAudits.length,
    relationshipsChecked: relatedLinks.size + references.size,
    errors,
  };
}
