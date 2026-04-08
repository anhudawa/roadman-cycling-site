export type ABElementType = "headline" | "cta_button" | "form_copy" | "hero_image" | "layout";
export type ABTestStatus = "draft" | "running" | "completed";

export interface ABVariant {
  id: string;
  label: string;
  content: string;
}

export interface ABTest {
  id: string;
  name: string;
  page: string;
  element: ABElementType;
  variants: ABVariant[];
  status: ABTestStatus;
  startedAt?: string;
  endedAt?: string;
  winnerVariantId?: string;
  createdBy: "manual" | "agent";
}

export interface ABResult {
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  isSignificant: boolean;
  confidence: number;
}
