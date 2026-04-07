interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Roadman Cycling",
        url: "https://roadmancycling.com",
        logo: "https://roadmancycling.com/images/logo-white.png",
        description:
          "The podcast trusted by 1 million monthly listeners. Expert cycling coaching, training, nutrition, and community.",
        founder: {
          "@type": "Person",
          name: "Anthony Walsh",
        },
        sameAs: [
          "https://youtube.com/@theroadmanpodcast",
          "https://instagram.com/roadman.cycling",
          "https://facebook.com/roadmancycling",
          "https://x.com/Roadman_Podcast",
          "https://tiktok.com/@roadmancyclingpodcast",
        ],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Roadman Cycling",
        url: "https://roadmancycling.com",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://roadmancycling.com/podcast?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}
