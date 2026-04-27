import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProblemBySlug, getAllProblemSlugs } from "@/lib/problems";
import {
  DiagnosisTemplate,
  type DiagnosisCause,
  type DiagnosisFix,
} from "@/components/templates";

export function generateStaticParams() {
  return getAllProblemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getProblemBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `https://roadmancycling.com/problem/${slug}` },
  };
}

export default async function ProblemPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getProblemBySlug(slug);
  if (!page) notFound();

  const causes: DiagnosisCause[] = page.causes.map((c) => ({ body: c }));
  const fixes: DiagnosisFix[] = page.solutions.map((s) => ({
    title: s.title,
    description: s.description,
    href: s.href,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.seoDescription,
          url: `https://roadmancycling.com/problem/${slug}`,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".problem-description"],
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: page.title, item: `https://roadmancycling.com/problem/${slug}` },
          ],
        }}
      />

      <Header />

      <DiagnosisTemplate
        title={page.title}
        pillar={page.pillar}
        problem={page.problem}
        causes={causes}
        fixes={fixes}
        tool={
          page.toolHref
            ? { href: page.toolHref, label: page.toolLabel || "Try the free tool" }
            : undefined
        }
        source={`problem-${slug}`}
      />

      <Footer />
    </>
  );
}
