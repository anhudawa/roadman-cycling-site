"use client";

import { useEffect, useMemo, useState } from "react";
import type { RecommendationOffer } from "@/lib/recommends/types";
import styles from "../Recommends.module.css";

const REGION_KEY = "roadman_recommends_region";

export function OfferSelector({
  offers,
  productName,
  disclosure,
  defaultRegion,
}: {
  offers: RecommendationOffer[];
  productName: string;
  disclosure: string;
  defaultRegion: string;
}) {
  const [region, setRegion] = useState(defaultRegion);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRegion(localStorage.getItem(REGION_KEY) ?? defaultRegion);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [defaultRegion]);

  const available = useMemo(() => {
    return offers.filter(
      (offer) => offer.active && offer.regions.includes(region),
    );
  }, [offers, region]);

  return (
    <div className={styles.offerBox}>
      <strong>Where are you shopping?</strong>
      <div>
        <label>
          <span className="sr-only">Shopping region</span>
          <select
            className={styles.regionSelect}
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
      </div>

      <div style={{ marginTop: "1rem" }}>
        {available.map((offer) => (
          <div key={offer.id} className={styles.offerRow}>
            <div className={styles.offerMeta}>
              <strong>{offer.retailerName}</strong>
              <span>
                {offer.priceLabel || "Check current price"}
                {offer.lastCheckedAt
                  ? ` · checked ${offer.lastCheckedAt.toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                    })}`
                  : ""}
              </span>
              {offer.promoCode ? (
                <span className={styles.promoCode}>
                  Use code <strong>{offer.promoCode}</strong>
                </span>
              ) : null}
            </div>
            <a
              className={styles.retailerLink}
              href={`/go/recommends/${offer.id}?region=${encodeURIComponent(region)}&placement=detail`}
              target="_blank"
              rel="sponsored nofollow noopener"
              aria-label={`View ${productName} at ${offer.retailerName}`}
            >
              View at {offer.retailerName}
            </a>
          </div>
        ))}

        {available.length === 0 ? (
          <p className={styles.disclosure}>
            No approved retailer is available for this region yet.
          </p>
        ) : null}
      </div>

      <p className={styles.disclosure} style={{ marginTop: "1rem" }}>
        {disclosure}
      </p>
    </div>
  );
}
