import {
  EVIDENCE_STATUSES,
  RECOMMENDATION_STATUSES,
  type EvidenceStatus,
  type RecommendationStatus,
} from "./types";

export interface RecommendationCatalogCsvRow {
  name: string;
  slug: string;
  status: RecommendationStatus;
  brandName: string;
  categorySlug: string;
  badge: string;
  evidenceStatus: EvidenceStatus;
  verdict: string;
  shortDescription: string;
  whyRecommend: string;
  whoFor: string;
  whoSkip: string;
  strengths: string[];
  limitations: string[];
  specifications: Record<string, string>;
  priceBand: string;
  imageUrl: string;
  imageAlt: string;
  relatedArticleUrl: string;
  tags: string[];
  useCases: string[];
  disciplines: string[];
  seasons: string[];
  featured: boolean;
  bestValue: boolean;
  sortOrder: number;
  retailerName: string;
  affiliateProgram: string;
  destinationUrl: string;
  regions: string[];
  currency: string;
  priceLabel: string;
  promoCode: string;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  cells.push(current.trim());
  return cells;
}

function list(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function truthy(value: string) {
  return ["1", "true", "yes", "y"].includes(value.trim().toLowerCase());
}

function specifications(value: string) {
  return Object.fromEntries(
    list(value)
      .map((item) => {
        const separator = item.indexOf(":");
        return separator > 0
          ? [item.slice(0, separator).trim(), item.slice(separator + 1).trim()]
          : null;
      })
      .filter((item): item is [string, string] => Boolean(item)),
  );
}

export function parseRecommendationCatalogCsv(
  csv: string,
): RecommendationCatalogCsvRow[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) =>
    header.trim().toLowerCase(),
  );
  const required = [
    "name",
    "slug",
    "category_slug",
    "verdict",
    "short_description",
    "why_recommend",
    "who_for",
  ];
  for (const header of required) {
    if (!headers.includes(header)) {
      throw new Error(`CSV is missing required column: ${header}`);
    }
  }

  return lines.slice(1).map((line, rowIndex) => {
    const cells = splitCsvLine(line);
    const row = Object.fromEntries(
      headers.map((header, index) => [header, cells[index] ?? ""]),
    );
    const status = (row.status || "draft") as RecommendationStatus;
    const evidenceStatus = (row.evidence_status ||
      "editorial") as EvidenceStatus;
    if (!RECOMMENDATION_STATUSES.includes(status)) {
      throw new Error(`CSV row ${rowIndex + 2} has unsupported status`);
    }
    if (!EVIDENCE_STATUSES.includes(evidenceStatus)) {
      throw new Error(
        `CSV row ${rowIndex + 2} has unsupported evidence_status`,
      );
    }
    if (
      !row.name ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) ||
      !row.category_slug ||
      !row.verdict ||
      !row.short_description ||
      !row.why_recommend ||
      !row.who_for
    ) {
      throw new Error(`CSV row ${rowIndex + 2} has invalid required fields`);
    }
    if (row.destination_url) {
      const destination = new URL(row.destination_url);
      if (!["https:", "http:"].includes(destination.protocol)) {
        throw new Error(`CSV row ${rowIndex + 2} has an invalid destination`);
      }
      if (!row.retailer) {
        throw new Error(
          `CSV row ${rowIndex + 2} needs retailer when destination_url is set`,
        );
      }
    }

    return {
      name: row.name,
      slug: row.slug,
      status,
      brandName: row.brand || "",
      categorySlug: row.category_slug,
      badge: row.badge || "",
      evidenceStatus,
      verdict: row.verdict,
      shortDescription: row.short_description,
      whyRecommend: row.why_recommend,
      whoFor: row.who_for,
      whoSkip: row.who_skip || "",
      strengths: list(row.strengths || ""),
      limitations: list(row.limitations || ""),
      specifications: specifications(row.specifications || ""),
      priceBand: row.price_band || "",
      imageUrl: row.image_url || "",
      imageAlt: row.image_alt || "",
      relatedArticleUrl: row.related_article_url || "",
      tags: list(row.tags || ""),
      useCases: list(row.use_cases || ""),
      disciplines: list(row.disciplines || ""),
      seasons: list(row.seasons || ""),
      featured: truthy(row.featured || ""),
      bestValue: truthy(row.best_value || ""),
      sortOrder: Number(row.sort_order || 0) || 0,
      retailerName: row.retailer || "",
      affiliateProgram: row.affiliate_program || "",
      destinationUrl: row.destination_url || "",
      regions: list(row.regions || "IE|GB|EU"),
      currency: (row.currency || "").toUpperCase(),
      priceLabel: row.price_label || "",
      promoCode: row.promo_code || "",
    };
  });
}

export const RECOMMENDATION_CATALOG_HEADERS = [
  "name",
  "slug",
  "status",
  "brand",
  "category_slug",
  "badge",
  "evidence_status",
  "verdict",
  "short_description",
  "why_recommend",
  "who_for",
  "who_skip",
  "strengths",
  "limitations",
  "specifications",
  "price_band",
  "image_url",
  "image_alt",
  "related_article_url",
  "tags",
  "use_cases",
  "disciplines",
  "seasons",
  "featured",
  "best_value",
  "sort_order",
  "retailer",
  "affiliate_program",
  "destination_url",
  "regions",
  "currency",
  "price_label",
  "promo_code",
] as const;

export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
