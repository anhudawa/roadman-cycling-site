export const RECOMMENDATION_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "archived",
] as const;

export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

export const EVIDENCE_STATUSES = [
  "editorial",
  "personally_used",
  "team_tested",
  "research_based",
  "community_favourite",
] as const;

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const EVIDENCE_LABELS: Record<EvidenceStatus, string> = {
  editorial: "Roadman editorial",
  personally_used: "Personally used",
  team_tested: "Team tested",
  research_based: "Research-based",
  community_favourite: "Community favourite",
};

export interface RecommendationCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  active: boolean;
}

export interface RecommendationCollection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  rule: "manual" | "featured" | "best_value";
  active: boolean;
  sortOrder: number;
  startsAt: Date | null;
  endsAt: Date | null;
  productIds: number[];
}

export interface RecommendationSettings {
  affiliateDisclosure: string;
  defaultRegion: string;
  staleOfferDays: number;
}

export interface RecommendationOffer {
  id: number;
  retailerName: string;
  affiliateProgram: string | null;
  regions: string[];
  currency: string | null;
  priceLabel: string | null;
  promoCode: string | null;
  priority: number;
  active: boolean;
  lastCheckedAt: Date | null;
  lastHttpStatus: number | null;
  lastError: string | null;
}

export interface RecommendationProduct {
  id: number;
  name: string;
  slug: string;
  status: RecommendationStatus;
  brandId: number | null;
  brandName: string | null;
  brandSlug: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  badge: string | null;
  evidenceStatus: EvidenceStatus;
  verdict: string;
  shortDescription: string;
  whyRecommend: string;
  whoFor: string;
  whoSkip: string | null;
  strengths: string[];
  limitations: string[];
  specifications: Record<string, string>;
  useCases: string[];
  tags: string[];
  disciplines: string[];
  seasons: string[];
  priceBand: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  relatedArticleUrl: string | null;
  featured: boolean;
  bestValue: boolean;
  sortOrder: number;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  offers: RecommendationOffer[];
}

export interface RecommendationDashboardStats {
  products: number;
  published: number;
  clicks: number;
  conversions: number;
  pendingCommission: number;
  approvedCommission: number;
  currency: string;
  staleOffers: number;
}
