import { FAQSchema } from "./FAQSchema";
import { HowToSchema } from "./HowToSchema";
import { JsonLd } from "./JsonLd";
import { SoftwareApplicationSchema } from "./SoftwareApplicationSchema";
import { getToolLanding } from "@/lib/tools/landing-content";
import { ENTITY_IDS } from "@/lib/brand-facts";

interface ToolSchemasProps {
  /** Tool slug — must exist in TOOL_LANDING_CONTENT. */
  slug: string;
}

/**
 * Renders the four pieces of structured data we want on every tool
 * landing page: WebApplication, HowTo, BreadcrumbList, FAQPage. All
 * pulled from the central landing-content registry so the visible page
 * and the JSON-LD never drift.
 */
export function ToolSchemas({ slug }: ToolSchemasProps) {
  const c = getToolLanding(slug);
  if (!c) return null;

  return (
    <>
      <SoftwareApplicationSchema
        name={c.title}
        description={c.description}
        url={c.url}
        features={c.webAppFeatures}
      />
      <HowToSchema
        name={`How to use the ${c.title}`}
        description={c.howItWorks}
        totalTime={c.howToTotalTime}
        steps={c.howToSteps}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${c.url}#webpage`,
          url: c.url,
          name: c.title,
          description: c.description,
          isPartOf: { "@id": ENTITY_IDS.website },
          publisher: { "@id": ENTITY_IDS.organization },
          author: { "@id": ENTITY_IDS.person },
          mainEntity: { "@id": `${c.url}#webapplication` },
          ...(c.dateModified && { dateModified: c.dateModified }),
          ...(c.reviewedBy && {
            reviewedBy: c.reviewedBy === "Anthony Walsh"
              ? { "@id": ENTITY_IDS.person }
              : { "@type": "Person", name: c.reviewedBy },
          }),
          ...(c.evidenceSources && c.evidenceSources.length > 0 && {
            citation: c.evidenceSources.map((source) => source.href),
          }),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: c.breadcrumbName, item: c.url },
          ],
        }}
      />
      <FAQSchema faqs={c.faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
    </>
  );
}
