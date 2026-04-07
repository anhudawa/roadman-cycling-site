import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

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
          mainEntity: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
            email: "hello@roadmancycling.com",
          },
        }}
      />
      {children}
    </>
  );
}
