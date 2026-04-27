import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Contact — Roadman Cycling",
  description:
    "Get in touch with the Roadman Cycling team. Sponsorship, press, partnerships, podcast guest suggestions, or general enquiries.",
  alternates: {
    canonical: "https://roadmancycling.com/contact",
  },
  openGraph: {
    title: "Contact — Roadman Cycling",
    description:
      "Get in touch with the Roadman Cycling team. Sponsorship, press, partnerships, podcast guest suggestions, or general enquiries.",
    type: "website",
    url: "https://roadmancycling.com/contact",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Roadman Cycling",
          description:
            "Get in touch with the Roadman Cycling team. Sponsorship, press, partnerships, podcast guest suggestions, or general enquiries.",
          url: "https://roadmancycling.com/contact",
          mainEntity: { "@id": ENTITY_IDS.organization },
          contactPoint: {
            "@type": "ContactPoint",
            email: "hello@roadmancycling.com",
            contactType: "customer support",
            availableLanguage: ["en"],
          },
        }}
      />
      {children}
    </>
  );
}
