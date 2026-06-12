import { JsonLd } from "./JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { resolveAuthorSlug } from "@/lib/authors";

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
  // Reference the author and publisher by their canonical @id so this
  // BlogPosting connects to the same Person/Organization nodes emitted
  // site-wide in OrganizationJsonLd — never spawn a disconnected
  // duplicate entity. Anthony resolves to ENTITY_IDS.person; any other
  // contributor resolves to their /author/<slug>#person node.
  const authorSlug = resolveAuthorSlug(author);
  const authorId =
    authorSlug === "anthony-walsh"
      ? ENTITY_IDS.person
      : `${SITE_ORIGIN}/author/${authorSlug}#person`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline,
        description,
        author: { "@id": authorId },
        publisher: { "@id": ENTITY_IDS.organization },
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
