import { JsonLd } from "./JsonLd";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList structured data for Google rich results.
 * Automatically prepends Home as the first item.
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const allItems = [
    { name: "Home", url: "https://roadmancycling.com" },
    ...items,
  ];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: allItems.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
