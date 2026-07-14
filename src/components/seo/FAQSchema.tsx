import { JsonLd } from "./JsonLd";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQ[];
}

/**
 * Canonical FAQ structured data for Google rich results.
 * Add to any page with Q&A content (tools, community, blog posts with FAQs).
 *
 * This is the single source of truth for FAQPage schema across the site.
 * If you need FAQ schema, import this component — do not create a new one.
 */
export function FAQSchema({ faqs }: FAQSchemaProps) {
  if (!faqs.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}
