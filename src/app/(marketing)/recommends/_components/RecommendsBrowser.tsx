"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  RecommendationCollection,
  RecommendationProduct,
} from "@/lib/recommends/types";
import styles from "../Recommends.module.css";

const SAVED_KEY = "roadman_recommends_saved";
const REGION_KEY = "roadman_recommends_region";

function matches(product: RecommendationProduct, query: string): boolean {
  if (!query) return true;
  const haystack = [
    product.name,
    product.brandName,
    product.verdict,
    product.shortDescription,
    product.categoryName,
    ...product.tags,
    ...product.useCases,
    ...product.disciplines,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => {
      if (term === "tire") return "tyre";
      if (term === "tires") return "tyres";
      if (term === "gps") return "computer";
      if (term === "turbo") return "trainer";
      return term;
    });
  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  return terms.every(
    (term) =>
      haystack.includes(term) ||
      words.some(
        (word) =>
          Math.abs(word.length - term.length) <= 1 &&
          oneEditApart(word, term),
      ),
  );
}

function oneEditApart(left: string, right: string): boolean {
  if (left === right) return true;
  if (Math.abs(left.length - right.length) > 1) return false;
  let leftIndex = 0;
  let rightIndex = 0;
  let edits = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }
  return edits + Number(leftIndex < left.length || rightIndex < right.length) <= 1;
}

function selectedOffer(product: RecommendationProduct, region: string) {
  return product.offers.find(
    (offer) => offer.active && offer.regions.includes(region),
  );
}

export function RecommendsBrowser({
  products,
  collections,
  initialCategory,
}: {
  products: RecommendationProduct[];
  collections: RecommendationCollection[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [collection, setCollection] = useState(searchParams.get("collection") ?? "all");
  const [region, setRegion] = useState("IE");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [useCase, setUseCase] = useState("all");
  const [discipline, setDiscipline] = useState("all");
  const [season, setSeason] = useState("all");
  const [evidence, setEvidence] = useState("all");
  const [saved, setSaved] = useState<number[]>([]);
  const [compare, setCompare] = useState<number[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setSaved(JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"));
        setRegion(localStorage.getItem(REGION_KEY) ?? "IE");
      } catch {
        setSaved([]);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (query) next.set("q", query);
      else next.delete("q");
      if (collection !== "all") next.set("collection", collection);
      else next.delete("collection");
      const nextQuery = next.toString();
      if (nextQuery === searchParams.toString()) return;
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [collection, pathname, query, router, searchParams]);

  const visible = useMemo(
    () =>
      products.filter((product) => {
        if (initialCategory && product.categorySlug !== initialCategory) return false;
        if (
          !initialCategory &&
          category !== "all" &&
          product.categorySlug !== category
        ) return false;
        const selectedCollection = collections.find(
          (item) => item.slug === collection,
        );
        if (
          selectedCollection?.rule === "featured" &&
          !product.featured
        ) return false;
        if (
          selectedCollection?.rule === "best_value" &&
          !product.bestValue
        ) return false;
        if (
          selectedCollection?.rule === "manual" &&
          !selectedCollection.productIds.includes(product.id)
        ) return false;
        if (collection === "saved" && !saved.includes(product.id)) return false;
        if (brand !== "all" && product.brandSlug !== brand) return false;
        if (useCase !== "all" && !product.useCases.includes(useCase)) return false;
        if (
          discipline !== "all" &&
          !product.disciplines.includes(discipline)
        ) return false;
        if (season !== "all" && !product.seasons.includes(season)) return false;
        if (evidence !== "all" && product.evidenceStatus !== evidence) return false;
        return matches(product, query);
      }),
    [
      brand,
      category,
      collection,
      collections,
      discipline,
      evidence,
      initialCategory,
      products,
      query,
      saved,
      season,
      useCase,
    ],
  );

  const filterOptions = useMemo(
    () => ({
      brands: Array.from(
        new Map(
          products
            .filter((product) => product.brandSlug && product.brandName)
            .map((product) => [
              product.brandSlug as string,
              product.brandName as string,
            ]),
        ),
      ),
      useCases: [...new Set(products.flatMap((product) => product.useCases))],
      disciplines: [
        ...new Set(products.flatMap((product) => product.disciplines)),
      ],
      seasons: [...new Set(products.flatMap((product) => product.seasons))],
      categories: Array.from(
        new Map(
          products
            .filter((product) => product.categorySlug && product.categoryName)
            .map((product) => [
              product.categorySlug as string,
              product.categoryName as string,
            ]),
        ),
      ),
    }),
    [products],
  );

  const comparedProducts = compare
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is RecommendationProduct => Boolean(product));

  function toggleSaved(id: number) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  }

  function toggleCompare(id: number) {
    setCompare((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  return (
    <section id="recommendations" className={styles.browser}>
      <div className={styles.sectionInner}>
        <div className={styles.browserTop}>
          <label className={styles.searchWrap}>
            <span className="sr-only">Search recommendations</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              className={styles.search}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tyres, fuel, trainers, GPS…"
              autoComplete="off"
              list="recommendation-search-options"
            />
            <datalist id="recommendation-search-options">
              {[...new Set([
                ...products.map((product) => product.name),
                ...filterOptions.brands.map(([, name]) => name),
                ...filterOptions.useCases,
              ])].map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </label>
          <p className={styles.resultCount} aria-live="polite">
            {visible.length} {visible.length === 1 ? "recommendation" : "recommendations"}
          </p>
        </div>

        <div className={styles.filterRow} aria-label="Recommendation filters">
          {[
            ["all", "All"],
            ...collections.map((item) => [item.slug, item.name]),
            ["saved", `Saved${saved.length ? ` (${saved.length})` : ""}`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={collection === value ? styles.filterActive : styles.filter}
              onClick={() => setCollection(value)}
            >
              {label}
            </button>
          ))}
          <label>
            <span className="sr-only">Shopping region</span>
            <select
              className={styles.filter}
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                localStorage.setItem(REGION_KEY, event.target.value);
              }}
            >
              <option value="IE">Ireland</option>
              <option value="GB">United Kingdom</option>
              <option value="EU">Europe</option>
              <option value="US">United States</option>
            </select>
          </label>
          {!initialCategory ? (
            <label>
              <span className="sr-only">Category</span>
              <select
                className={styles.filter}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">All categories</option>
                {filterOptions.categories.map(([slug, name]) => (
                  <option key={slug} value={slug}>{name}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span className="sr-only">Brand</span>
            <select
              className={styles.filter}
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              <option value="all">All brands</option>
              {filterOptions.brands.map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Intended use</span>
            <select
              className={styles.filter}
              value={useCase}
              onChange={(event) => setUseCase(event.target.value)}
            >
              <option value="all">Any use</option>
              {filterOptions.useCases.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Cycling discipline</span>
            <select
              className={styles.filter}
              value={discipline}
              onChange={(event) => setDiscipline(event.target.value)}
            >
              <option value="all">Any discipline</option>
              {filterOptions.disciplines.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Season</span>
            <select
              className={styles.filter}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              <option value="all">Any season</option>
              {filterOptions.seasons.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Evidence</span>
            <select
              className={styles.filter}
              value={evidence}
              onChange={(event) => setEvidence(event.target.value)}
            >
              <option value="all">Any evidence</option>
              <option value="personally_used">Personally used</option>
              <option value="team_tested">Team tested</option>
              <option value="research_based">Research-based</option>
              <option value="community_favourite">Community favourite</option>
              <option value="editorial">Roadman editorial</option>
            </select>
          </label>
          {(category !== "all" ||
            brand !== "all" ||
            useCase !== "all" ||
            discipline !== "all" ||
            season !== "all" ||
            evidence !== "all") ? (
            <button
              type="button"
              className={styles.filter}
              onClick={() => {
                setCategory("all");
                setBrand("all");
                setUseCase("all");
                setDiscipline("all");
                setSeason("all");
                setEvidence("all");
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className={styles.productGrid}>
          {visible.map((product) => {
            const offer = selectedOffer(product, region);
            const categoryPath = product.categorySlug ?? "gear";
            return (
              <article key={product.id} className={styles.productCard}>
                <div className={styles.productImage}>
                  {product.badge ? <span className={styles.cardBadge}>{product.badge}</span> : null}
                  <button
                    type="button"
                    className={`${styles.saveButton} ${saved.includes(product.id) ? styles.saveButtonActive : ""}`}
                    onClick={() => toggleSaved(product.id)}
                    aria-label={saved.includes(product.id) ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
                    aria-pressed={saved.includes(product.id)}
                  >
                    {saved.includes(product.id) ? "♥" : "♡"}
                  </button>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt || product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                    />
                  ) : (
                    <span className={styles.productInitial} aria-hidden="true">
                      {product.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className={styles.productBody}>
                  <p className={styles.brand}>{product.brandName ?? product.categoryName ?? "ROADMAN PICK"}</p>
                  <h3>{product.name}</h3>
                  <p className={styles.verdict}>{product.verdict}</p>
                  <p className={styles.description}>{product.shortDescription}</p>
                  <p className={styles.bestFor}>
                    <strong>Best for:</strong> {product.whoFor}
                  </p>
                  <p className={styles.offerLine}>
                    {offer
                      ? `${offer.priceLabel || "Check current price"} · ${offer.retailerName}`
                      : `No approved retailer for ${region}`}
                  </p>
                  <div className={styles.cardActions}>
                    <Link className={styles.cardLink} href={`/recommends/${categoryPath}/${product.slug}`}>
                      Read verdict
                    </Link>
                    {offer ? (
                      <a
                        className={styles.retailerLink}
                        href={`/go/recommends/${offer.id}?region=${encodeURIComponent(region)}&placement=card`}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                      >
                        {offer.promoCode
                          ? `Use ${offer.promoCode} at ${offer.retailerName}`
                          : `View at ${offer.retailerName}`}
                      </a>
                    ) : null}
                  </div>
                  <label className={styles.compareControl}>
                    <input
                      type="checkbox"
                      checked={compare.includes(product.id)}
                      disabled={!compare.includes(product.id) && compare.length >= 3}
                      onChange={() => toggleCompare(product.id)}
                    />
                    Compare
                  </label>
                </div>
              </article>
            );
          })}

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <h3>{products.length === 0 ? "THE LIBRARY IS BEING STOCKED." : "NO GEAR MATCHES THAT SEARCH."}</h3>
              <p>
                {products.length === 0
                  ? "Recommendations only appear after they have been reviewed and published. Check back shortly, or ask Roadman for an answer now."
                  : "Try a broader search, clear the collection filter, or browse a different category."}
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.secondaryAction} href="/ask">Ask Roadman</Link>
                {products.length > 0 ? (
                  <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={() => {
                      setQuery("");
                      setCollection("all");
                    }}
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {comparedProducts.length > 0 ? (
        <aside className={styles.compareTray} aria-label="Product comparison">
          <div className={styles.compareHeader}>
            <strong>COMPARE {comparedProducts.length}/3</strong>
            <button type="button" onClick={() => setCompare([])}>Clear</button>
          </div>
          <div className={styles.compareGrid}>
            {comparedProducts.map((product) => (
              <div key={product.id} className={styles.compareItem}>
                <strong>{product.name}</strong>
                <span>{product.verdict}</span>
                <span>Best for: {product.whoFor}</span>
                <span>{product.priceBand || "Check current price"}</span>
              </div>
            ))}
          </div>
        </aside>
      ) : null}
    </section>
  );
}
