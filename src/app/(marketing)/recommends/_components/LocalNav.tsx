import Link from "next/link";
import type {
  RecommendationCategory,
  RecommendationCollection,
} from "@/lib/recommends/types";
import styles from "../Recommends.module.css";

export function LocalNav({
  categories,
  collections,
}: {
  categories: RecommendationCategory[];
  collections: RecommendationCollection[];
}) {
  return (
    <nav className={styles.localNav} aria-label="Roadman Recommends">
      <div className={styles.localNavInner}>
        <Link href="/recommends">All recommendations</Link>
        {categories.slice(0, 8).map((category) => (
          <Link key={category.slug} href={`/recommends/${category.slug}`}>
            {category.name}
          </Link>
        ))}
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/recommends?collection=${collection.slug}`}
          >
            {collection.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
