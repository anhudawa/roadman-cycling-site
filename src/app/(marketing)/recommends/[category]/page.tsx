import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getPublicRecommendationCategories,
  getPublicRecommendationCollections,
  getPublicRecommendationProducts,
} from "@/lib/recommends/queries";
import { LocalNav } from "../_components/LocalNav";
import { RecommendsBrowser } from "../_components/RecommendsBrowser";
import styles from "../Recommends.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await getPublicRecommendationCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return { title: "Recommendations Not Found" };
  return {
    title: `${category.name} — Roadman Recommends`,
    description:
      category.description ??
      `Roadman Cycling recommendations for ${category.name.toLowerCase()}.`,
    alternates: {
      canonical: `https://roadmancycling.com/recommends/${category.slug}`,
    },
  };
}

export default async function RecommendationCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const [categories, products, collections] = await Promise.all([
    getPublicRecommendationCategories(),
    getPublicRecommendationProducts(),
    getPublicRecommendationCollections(),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const categoryProducts = products.filter((product) => product.categorySlug === slug);

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${category.name} — Roadman Recommends`,
          numberOfItems: categoryProducts.length,
          itemListElement: categoryProducts.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.name,
            url: `https://roadmancycling.com/recommends/${slug}/${product.slug}`,
          })),
        }}
      />
      <section className={styles.categoryHero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/recommends">Recommends</Link><span>/</span>
            <span>{category.name}</span>
          </nav>
          <p className={styles.eyebrow}>ROADMAN RECOMMENDS</p>
          <h1>{category.name.toUpperCase()}</h1>
          <p className={styles.heroLead}>{category.description}</p>
        </div>
      </section>
      <LocalNav categories={categories} collections={collections} />
      <Suspense fallback={<section id="recommendations" className={styles.browser}>Loading recommendations…</section>}>
        <RecommendsBrowser
          products={products}
          collections={collections}
          initialCategory={slug}
        />
      </Suspense>
    </div>
  );
}
