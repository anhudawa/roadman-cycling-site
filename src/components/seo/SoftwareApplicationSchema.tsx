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
 * SoftwareApplication structured data for our free calculator tools.
 *
 * Signals to Google that the page is an interactive utility (distinct from
 * the HowTo/FAQ schema also emitted on each tool page) $— unlocks the
 * "application" rich result variant and improves discovery for queries like
 * "ftp calculator" or "tyre pressure calculator".
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
        "@type": "SoftwareApplication",
        name,
        description,
        url,
        applicationCategory: "SportsApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript, modern browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: {
          "@type": "Organization",
          name: "Roadman Cycling",
          url: "https://roadmancycling.com",
        },
        ...(features && features.length > 0 && { featureList: features }),
      }}
    />
  );
}
