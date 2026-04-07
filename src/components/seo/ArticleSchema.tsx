import { JsonLd } from "./JsonLd";

interface ArticleSchemaProps {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  keywords?: string[];
}

/**
 * BlogPosting structured data for Google rich results.
 * Includes publisher (Roadman Cycling) and author with E-E-A-T signals.
 */
export function ArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  url,
  image,
  keywords,
}: ArticleSchemaProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline,
        description,
        author: {
          "@type": "Person",
          name: author,
          url: "https://roadmancycling.com/about",
        },
        publisher: {
          "@type": "Organization",
          name: "Roadman Cycling",
          url: "https://roadmancycling.com",
        },
        datePublished,
        dateModified: dateModified || datePublished,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        ...(keywords && { keywords: keywords.join(", ") }),
        ...(image && {
          image: {
            "@type": "ImageObject",
            url: image,
            width: 1200,
            height: 630,
          },
        }),
      }}
    />
  );
}
