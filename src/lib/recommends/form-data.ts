import { z } from "zod";
import { EVIDENCE_STATUSES, RECOMMENDATION_STATUSES } from "./types";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => !value || value.startsWith("/") || URL.canParse(value), "Enter a valid URL");

export const recommendationProductInput = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(RECOMMENDATION_STATUSES),
  categoryId: z.number().int().positive().nullable(),
  brandName: z.string().trim().max(120).optional().default(""),
  badge: z.string().trim().max(80).optional().default(""),
  evidenceStatus: z.enum(EVIDENCE_STATUSES),
  verdict: z.string().trim().min(5).max(240),
  shortDescription: z.string().trim().min(10).max(500),
  whyRecommend: z.string().trim().min(10),
  whoFor: z.string().trim().min(5),
  whoSkip: z.string().trim().optional().default(""),
  strengths: z.array(z.string().trim().min(1)).max(12),
  limitations: z.array(z.string().trim().min(1)).max(12),
  specifications: z.record(z.string(), z.string()),
  useCases: z.array(z.string().trim().min(1)).max(20),
  tags: z.array(z.string().trim().min(1)).max(30),
  disciplines: z.array(z.string().trim().min(1)).max(12),
  seasons: z.array(z.string().trim().min(1)).max(12),
  priceBand: z.string().trim().max(80).optional().default(""),
  imageUrl: optionalUrl.optional().default(""),
  imageAlt: z.string().trim().max(240).optional().default(""),
  relatedArticleUrl: optionalUrl.optional().default(""),
  featured: z.boolean(),
  bestValue: z.boolean(),
  sortOrder: z.number().int().min(0).max(100000),
  scheduledAt: z.string().trim().optional().default(""),
  offers: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        retailerName: z.string().trim().min(2).max(120),
        affiliateProgram: z.string().trim().max(120).optional().default(""),
        destinationUrl: z.string().trim().url(),
        regions: z.array(z.string().trim().min(2).max(8)).min(1),
        currency: z.string().trim().max(8).optional().default(""),
        priceLabel: z.string().trim().max(80).optional().default(""),
        promoCode: z.string().trim().max(80).optional().default(""),
        priority: z.number().int().min(0).max(100000),
        active: z.boolean(),
      }),
    )
    .max(30),
});

function list(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function specs(value: FormDataEntryValue | null): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of String(value ?? "").split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const detail = line.slice(separator + 1).trim();
    if (key && detail) result[key] = detail;
  }
  return result;
}

export function parseRecommendationProductForm(formData: FormData) {
  let offers: unknown[] = [];
  try {
    offers = JSON.parse(String(formData.get("offers") ?? "[]"));
  } catch {
    offers = [];
  }
  const categoryRaw = Number(formData.get("categoryId") ?? 0);
  return recommendationProductInput.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    categoryId: categoryRaw > 0 ? categoryRaw : null,
    brandName: formData.get("brandName"),
    badge: formData.get("badge"),
    evidenceStatus: formData.get("evidenceStatus"),
    verdict: formData.get("verdict"),
    shortDescription: formData.get("shortDescription"),
    whyRecommend: formData.get("whyRecommend"),
    whoFor: formData.get("whoFor"),
    whoSkip: formData.get("whoSkip"),
    strengths: list(formData.get("strengths")),
    limitations: list(formData.get("limitations")),
    specifications: specs(formData.get("specifications")),
    useCases: list(formData.get("useCases")),
    tags: list(formData.get("tags")),
    disciplines: list(formData.get("disciplines")),
    seasons: list(formData.get("seasons")),
    priceBand: formData.get("priceBand"),
    imageUrl: formData.get("imageUrl"),
    imageAlt: formData.get("imageAlt"),
    relatedArticleUrl: formData.get("relatedArticleUrl"),
    featured: formData.get("featured") === "on",
    bestValue: formData.get("bestValue") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    scheduledAt: formData.get("scheduledAt"),
    offers,
  });
}
