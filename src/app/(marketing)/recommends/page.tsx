import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getPublicRecommendationCategories,
  getPublicRecommendationCollections,
  getPublicRecommendationProducts,
  getRecommendationSettings,
} from "@/lib/recommends/queries";
import { LocalNav } from "./_components/LocalNav";
import { RecommendsBrowser } from "./_components/RecommendsBrowser";
import styles from "./Recommends.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Roadman Recommends — Cycling Gear That Earns Its Place",
  description:
    "Tyres, fuel, clothing, indoor trainers and cycling technology recommended by Roadman Cycling, with honest verdicts for real riders.",
  alternates: { canonical: "https://roadmancycling.com/recommends" },
  openGraph: {
    title: "Roadman Recommends — Gear That Earns Its Place",
    description:
      "The answer to the question Anthony gets asked every day: what cycling gear should I buy?",
    url: "https://roadmancycling.com/recommends",
  },
};

export default async function RecommendsPage() {
  const [categories, products, collections, settings] = await Promise.all([
    getPublicRecommendationCategories(),
    getPublicRecommendationProducts(),
    getPublicRecommendationCollections(),
    getRecommendationSettings(),
  ]);
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const bestValue = products.filter((product) => product.bestValue).slice(0, 4);
  const updated = [...products]
    .sort(
      (left, right) =>
        right.updatedAt.getTime() - left.updatedAt.getTime(),
    )
    .slice(0, 4);
  const intentCollections = collections.filter((collection) =>
    ["winter-riding", "new-to-ndy"].includes(collection.slug),
  );
  const problemLinks = [
    ["I need faster tyres", "/recommends?q=fast%20road%20riding#recommendations"],
    ["I keep puncturing", "/recommends?q=tubeless#recommendations"],
    ["I struggle to fuel long rides", "/recommends?q=fuel#recommendations"],
    ["I need to get through winter", "/recommends?collection=winter-riding#recommendations"],
    ["I want to train indoors", "/recommends?collection=indoor-setup#recommendations"],
    ["I am new to NDY", "/recommends?collection=new-to-ndy#recommendations"],
    ["I need better visibility", "/recommends?q=visibility#recommendations"],
    ["I want the best option on a budget", "/recommends?collection=best-value#recommendations"],
  ];

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Roadman Recommends",
          description: metadata.description,
          url: "https://roadmancycling.com/recommends",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.name,
              url: `https://roadmancycling.com/recommends/${product.categorySlug ?? "gear"}/${product.slug}`,
            })),
          },
        }}
      />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>ROADMAN RECOMMENDS</p>
          <h1>GEAR THAT EARNS ITS PLACE.</h1>
          <p className={styles.heroLead}>
            The answer to the question I get asked every day: what should I buy?
            Tyres, fuel, clothing, trainers and cycling technology—chosen to help
            you ride better and waste less money.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#recommendations">
              Browse recommendations
            </a>
            <a className={styles.secondaryAction} href="#recommendations">
              Search for a product
            </a>
          </div>
        </div>
      </section>

      <LocalNav categories={categories} collections={collections} />

      {intentCollections.length ? (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <h2>START WITH THE RIDE AHEAD.</h2>
              <p>
                Complete setups for the moments riders actually ask about—not
                another wall of product categories.
              </p>
            </div>
            <div className={styles.intentGrid}>
              {intentCollections.map((collection) => {
                const isWinter = collection.slug === "winter-riding";
                return (
                  <Link
                    key={collection.slug}
                    href={`/recommends?collection=${collection.slug}#recommendations`}
                    className={`${styles.intentCard} ${
                      isWinter ? styles.intentWinter : styles.intentNdy
                    }`}
                  >
                    <span>{isWinter ? "RIDE THROUGH IT" : "BUILD YOUR SETUP"}</span>
                    <h3>{collection.name.toUpperCase()}</h3>
                    <p>{collection.description}</p>
                    <strong>
                      {isWinter
                        ? "Grip · warmth · rain · indoor"
                        : "Computer · heart rate · trainer · power"}
                      <span aria-hidden="true"> →</span>
                    </strong>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>SHOP BY WHAT MATTERS.</h2>
            <p>
              Start with the job the product needs to do. No endless catalogue,
              no paid placement disguised as advice.
            </p>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/recommends/${category.slug}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{category.name.toUpperCase()}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>ROADMAN PICKS.</h2>
            <p>The first places to look when you want a decisive answer.</p>
          </div>
          <div className={styles.editGrid}>
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/recommends/${product.categorySlug}/${product.slug}`}
                className={styles.editCard}
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.imageAlt || product.name}
                    width={720}
                    height={540}
                    sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw"
                  />
                ) : null}
                <span>{product.brandName}</span>
                <h3>{product.name}</h3>
                <p>{product.verdict}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>WHAT DO YOU NEED RIGHT NOW?</h2>
            <p>Start with the problem. The products come second.</p>
          </div>
          <div className={styles.problemGrid}>
            {problemLinks.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={styles.problemLink}
              >
                {label} <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<section id="recommendations" className={styles.browser}>Loading recommendations…</section>}>
        <RecommendsBrowser products={products} collections={collections} />
      </Suspense>

      {(bestValue.length || updated.length) ? (
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.splitEdits}>
              <div>
                <div className={styles.sectionHeader}>
                  <h2>BEST VALUE.</h2>
                  <p>Useful performance without spending for the sake of it.</p>
                </div>
                {bestValue.map((product) => (
                  <Link
                    key={product.id}
                    className={styles.listEdit}
                    href={`/recommends/${product.categorySlug}/${product.slug}`}
                  >
                    <strong>{product.name}</strong>
                    <span>{product.priceBand || "Check current price"}</span>
                  </Link>
                ))}
              </div>
              <div>
                <div className={styles.sectionHeader}>
                  <h2>RECENTLY REVIEWED.</h2>
                  <p>Fresh checks on products, prices and retailer links.</p>
                </div>
                {updated.map((product) => (
                  <Link
                    key={product.id}
                    className={styles.listEdit}
                    href={`/recommends/${product.categorySlug}/${product.slug}`}
                  >
                    <strong>{product.name}</strong>
                    <span>
                      {(product.lastReviewedAt ?? product.updatedAt).toLocaleDateString(
                        "en-IE",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2>WHY THESE MAKE THE CUT.</h2>
            <p>
              Cool products that do their job well, suit real riders and feel
              worth the money. Simple as that.
            </p>
          </div>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <h3>GOOD ON THE BIKE.</h3>
              <p>Gear that works where it matters: on real roads, real rides and long days in the saddle.</p>
            </div>
            <div className={styles.trustCard}>
              <h3>RIGHT FOR THE RIDER.</h3>
              <p>Clear advice on who it suits, what it does brilliantly and anything worth knowing before you buy.</p>
            </div>
            <div className={styles.trustCard}>
              <h3>WORTH YOUR MONEY.</h3>
              <p>Clear value, honest trade-offs and no reason to spend more when a simpler option does the job.</p>
            </div>
          </div>
          <p className={styles.disclosure} style={{ marginTop: "1.5rem" }}>
            {settings.affiliateDisclosure}
          </p>
        </div>
      </section>
    </div>
  );
}
