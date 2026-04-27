import type { ContentPillar } from "@/types";
import {
  INTENT_CTA_REGISTRY,
  PILLAR_FALLBACK,
  type IntentCTACategory,
  type IntentCTAVariant,
} from "./registry";

/**
 * IntentCTA — the wrapper used inside article and topic-hub
 * templates. It picks the right intent CTA from page metadata,
 * falling back to the page's content pillar when no explicit
 * intent is set.
 *
 * Two call shapes:
 *
 *   <IntentCTA category="plateau" />
 *   <IntentCTA category="event" props={{ event: "Etape du Tour" }} />
 *   <IntentCTA pillar="nutrition" />
 *
 * The `category` form is preferred when content-authors know which
 * CTA to surface. The `pillar` form is the fallback for pages that
 * only carry pillar metadata.
 */
export type IntentCTAProps =
  | (IntentCTAVariant & { pillar?: ContentPillar; source?: string })
  | { category?: undefined; pillar: ContentPillar; source?: string };

function isVariant(p: IntentCTAProps): p is IntentCTAVariant & {
  pillar?: ContentPillar;
  source?: string;
} {
  return typeof (p as { category?: string }).category === "string";
}

export function IntentCTA(props: IntentCTAProps) {
  const category: IntentCTACategory = isVariant(props)
    ? props.category
    : PILLAR_FALLBACK[props.pillar];

  const Component = INTENT_CTA_REGISTRY[category];

  // Pull through the optional shared `source` and the variant's own
  // props bag. Variants whose props are required (currently just
  // "event") will fail to typecheck at the call site without them —
  // see IntentCTAVariant in registry.ts.
  const variantProps = isVariant(props)
    ? ((props as { props?: Record<string, unknown> }).props ?? {})
    : {};
  const source = props.source;

  return <Component {...variantProps} {...(source ? { source } : {})} />;
}
