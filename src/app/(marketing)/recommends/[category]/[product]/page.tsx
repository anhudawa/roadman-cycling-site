import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getPublicRecommendationBySlug,
  getPublicRecommendationCategories,
  getPublicRecommendationCollections,
  getPublicRecommendationProducts,
  getRecommendationSettings,
} from "@/lib/recommends/queries";
import { EVIDENCE_LABELS } from "@/lib/recommends/types";
import { LocalNav } from "../../_components/LocalNav";
import { OfferSelector } from "../../_components/OfferSelector";
import styles from "../../Recommends.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}): Promise<Metadata> {
  const { category, product: slug } = await params;
  const product = await getPublicRecommendationBySlug(slug);
  if (!product || product.categorySlug !== category) {
    return { title: "Recommendation Not Found" };
  }
  return {
    title: `${product.name} Review & Recommendation`,
    description: product.shortDescription,
    alternates: {
      canonical: `https://roadmancycling.com/recommends/${category}/${slug}`,
    },
    openGraph: {
      title: `${product.name} — Roadman Recommends`,
      description: product.verdict,
      url: `https://roadmancycling.com/recommends/${category}/${slug}`,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.imageAlt || product.name }] : undefined,
    },
  };
}

export default async function RecommendationProductPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}) {
  const { category, product: slug } = await params;
  const [product, categories, collections, settings] = await Promise.all([
    getPublicRecommendationBySlug(slug),
    getPublicRecommendationCategories(),
    getPublicRecommendationCollections(),
    getRecommendationSettings(),
  ]);
  if (!product || product.categorySlug !== category) notFound();

  const allProducts = await getPublicRecommendationProducts();
  const alternatives = allProducts
    .filter(
      (item) =>
        item.id !== product.id && item.categorySlug === product.categorySlug,
    )
    .slice(0, 3);
  const canonical = `https://roadmancycling.com/recommends/${category}/${slug}`;

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${product.name} — Roadman Recommends`,
          description: product.shortDescription,
          url: canonical,
          dateModified: product.updatedAt.toISOString(),
          reviewedBy: {
            "@type": "Person",
            name: "Anthony Walsh",
            url: "https://roadmancycling.com/author/anthony-walsh",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Recommends", item: "https://roadmancycling.com/recommends" },
            { "@type": "ListItem", position: 3, name: product.categoryName, item: `https://roadmancycling.com/recommends/${category}` },
            { "@type": "ListItem", position: 4, name: product.name, item: canonical },
          ],
        }}
      />

      <section className={styles.detailHero}>
        <div className={styles.sectionInner}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/recommends">Recommends</Link><span>/</span>
            <Link href={`/recommends/${category}`}>{product.categoryName}</Link><span>/</span>
            <span>{product.name}</span>
          </nav>
          <div className={styles.detailGrid}>
            <div className={styles.detailImage}>
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt || product.name}
                  fill
                  priority
                  sizes="(max-width: 980px) 100vw, 50vw"
                />
              ) : (
                <span className={styles.productInitial} aria-hidden="true">
                  {product.name.slice(0, 1)}
                </span>
              )}
            </div>
            <div className={styles.detailCopy}>
              <p className={styles.brand}>{product.brandName ?? product.categoryName}</p>
              <h1>{product.name.toUpperCase()}</h1>
              <p className={styles.detailVerdict}>{product.verdict}</p>
              <span className={styles.evidence}>
                {EVIDENCE_LABELS[product.evidenceStatus]}
              </span>
              <OfferSelector
                offers={product.offers}
                productName={product.name}
                disclosure={settings.affiliateDisclosure}
                defaultRegion={settings.defaultRegion}
              />
            </div>
          </div>
        </div>
      </section>

      <LocalNav categories={categories} collections={collections} />

      <section className={styles.detailBody}>
        <div className={`${styles.sectionInner} ${styles.editorialGrid}`}>
          <article className={styles.prose}>
            <h2>THE ROADMAN VERDICT.</h2>
            <p>{product.shortDescription}</p>

            <h3>Why I recommend it</h3>
            <p>{product.whyRecommend}</p>

            <h3>Who it is for</h3>
            <p>{product.whoFor}</p>

            {product.whoSkip ? (
              <>
                <h3>Who should skip it</h3>
                <p>{product.whoSkip}</p>
              </>
            ) : null}

            {product.strengths.length ? (
              <>
                <h3>What it gets right</h3>
                <ul>
                  {product.strengths.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            ) : null}

            {product.limitations.length ? (
              <>
                <h3>Where it falls short</h3>
                <ul>
                  {product.limitations.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            ) : null}

            {product.relatedArticleUrl ? (
              <p>
                <Link className={styles.secondaryAction} href={product.relatedArticleUrl}>
                  Read the related Roadman guide
                </Link>
              </p>
            ) : null}
          </article>

          <aside className={styles.facts}>
            <h2>AT A GLANCE.</h2>
            <div className={styles.specRow}><span>Best for</span><span>{product.whoFor}</span></div>
            {product.priceBand ? <div className={styles.specRow}><span>Price band</span><span>{product.priceBand}</span></div> : null}
            {product.disciplines.length ? <div className={styles.specRow}><span>Disciplines</span><span>{product.disciplines.join(", ")}</span></div> : null}
            {product.seasons.length ? <div className={styles.specRow}><span>Season</span><span>{product.seasons.join(", ")}</span></div> : null}
            {Object.entries(product.specifications).map(([label, value]) => (
              <div className={styles.specRow} key={label}><span>{label}</span><span>{value}</span></div>
            ))}
            <div className={styles.specRow}>
              <span>Last reviewed</span>
              <span>{(product.lastReviewedAt ?? product.updatedAt).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </aside>
        </div>
      </section>

      {alternatives.length ? (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}><h2>ALSO WORTH A LOOK.</h2></div>
            <div className={styles.categoryGrid}>
              {alternatives.map((item) => (
                <Link
                  key={item.id}
                  href={`/recommends/${item.categorySlug}/${item.slug}`}
                  className={styles.categoryCard}
                >
                  <span className={styles.categoryNumber}>{item.brandName ?? item.categoryName}</span>
                  <h3>{item.name.toUpperCase()}</h3>
                  <p>{item.verdict}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
