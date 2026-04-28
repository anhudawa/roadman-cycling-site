import { FAQSchema } from "./FAQSchema";
import { HowToSchema } from "./HowToSchema";
import { JsonLd } from "./JsonLd";
import { SoftwareApplicationSchema } from "./SoftwareApplicationSchema";
import { getToolLanding } from "@/lib/tools/landing-content";

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
