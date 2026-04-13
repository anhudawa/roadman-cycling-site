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
        alternateName: "The Roadman Cycling Podcast",
        url: "https://roadmancycling.com",
        logo: "https://roadmancycling.com/images/logo-white.png",
        description:
          "The world's largest cycling performance podcast. Evidence-based coaching, nutrition, strength, recovery, and community for serious amateur cyclists. Trusted by 1 million monthly listeners.",
        founder: {
          "@type": "Person",
          name: "Anthony Walsh",
          jobTitle: "Cycling Coach & Podcast Host",
          url: "https://roadmancycling.com/about",
          sameAs: [
            "https://instagram.com/roadman.cycling",
            "https://youtube.com/@theroadmanpodcast",
          ],
        },
        sameAs: [
          "https://youtube.com/@theroadmanpodcast",
          "https://instagram.com/roadman.cycling",
          "https://facebook.com/roadmancycling",
          "https://x.com/Roadman_Podcast",
          "https://tiktok.com/@roadmancyclingpodcast",
          "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC",
          "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: "anthony@roadmancycling.com",
          contactType: "customer service",
        },
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
              "https://roadmancycling.com/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// Article schema for blog posts
export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  category,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        ...(image && { image }),
        author: {
          "@type": "Person",
          name: "Anthony Walsh",
          url: "https://roadmancycling.com/about",
        },
        publisher: {
          "@type": "Organization",
          name: "Roadman Cycling",
          logo: {
            "@type": "ImageObject",
            url: "https://roadmancycling.com/images/logo-white.png",
          },
        },
        datePublished,
        ...(dateModified && { dateModified }),
        mainEntityOfPage: url,
        ...(category && {
          articleSection: category,
          about: {
            "@type": "Thing",
            name: category,
          },
        }),
      }}
    />
  );
}

// FAQ schema for articles with FAQ sections
export function FAQPageJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  if (!questions.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}

// Breadcrumb schema
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// Podcast episode schema
export function PodcastEpisodeJsonLd({
  title,
  description,
  url,
  datePublished,
  duration,
  episodeNumber,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  duration?: string;
  episodeNumber?: number;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "PodcastEpisode",
        name: title,
        description,
        url,
        datePublished,
        ...(duration && { timeRequired: duration }),
        ...(episodeNumber && { episodeNumber }),
        partOfSeries: {
          "@type": "PodcastSeries",
          name: "The Roadman Cycling Podcast",
          url: "https://roadmancycling.com/podcast",
        },
      }}
    />
  );
}
