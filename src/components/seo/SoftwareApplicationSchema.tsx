import { ENTITY_IDS } from "@/lib/brand-facts";
import { JsonLd } from "./JsonLd";

interface SoftwareApplicationSchemaProps {
  /** Human-readable name of the calculator/tool, e.g. "FTP Zone Calculator" */
  name: string;
  /** One-sentence description that can be re-used from the page meta description */
  description: string;
  /** Absolute URL of the tool page */
  url: string;
  /** Optional list of feature bullets surfaced as featureList in rich results */
  features?: string[];
}

/**
 * WebApplication structured data for our free browser-based calculators.
 * WebApplication is a more specific schema.org subtype of SoftwareApplication;
 * it tells search engines the tool runs in the browser (no install) and
 * unlocks the "application" rich result for queries like "ftp calculator".
 */
export function SoftwareApplicationSchema({
  name,
  description,
  url,
  features,
}: SoftwareApplicationSchemaProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name,
        description,
        url,
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript, modern browser",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: { "@id": ENTITY_IDS.organization },
        ...(features && features.length > 0 && { featureList: features }),
      }}
    />
  );
}
