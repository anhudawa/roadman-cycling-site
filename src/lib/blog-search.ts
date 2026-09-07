import type { ContentPillar } from "@/types";

export interface BlogSearchItem {
  slug: string;
  title: string;
  excerpt: string;
  pillar: ContentPillar;
  publishDate: string;
  readTime: string;
  featuredImage?: string;
  keywords: string[];
}

/** Topic filters — keyword-based filters that cut across pillars */
export const TOPIC_FILTERS: Array<{
  id: string;
  label: string;
  match: (post: BlogSearchItem) => boolean;
}> = [
  {
    id: "mtb",
    label: "Mountain Biking",
    match: (p) => {
      const haystack =
        `${p.title} ${(p.keywords ?? []).join(" ")} ${p.excerpt}`.toLowerCase();
      return /\bmtb\b|mountain.?bik|fork.?setup|suspension.?setup|dropper|trail.?rid|enduro|shock.?pressur|tyre.?pressure.?mtb|rostrevor|ballinastoe|mtb.?trail|mountain.?bike.?trail/.test(
        haystack,
      );
    },
  },
  {
    id: "triathlon",
    label: "Triathlon",
    match: (p) => {
      const haystack =
        `${p.title} ${(p.keywords ?? []).join(" ")} ${p.excerpt}`.toLowerCase();
      return /triath|ironman|70\.3|bike.?leg|tri.?bike/.test(haystack);
    },
  },
  {
    // Cycling's horology cluster — the watch features sit in the `community`
    // pillar (cycling culture / le metier), so without a cross-cutting filter
    // they're invisible on /blog unless you already know the brand name. This
    // surfaces them as their own browsable group. Brand-name anchored to stay
    // precise: bare "watch" would catch "57M watch hours" (the Netflix piece),
    // and bare "omega" would catch omega-3 nutrition posts.
    id: "watches",
    label: "Watches",
    match: (p) => {
      const haystack =
        `${p.title} ${(p.keywords ?? []).join(" ")} ${p.excerpt}`.toLowerCase();
      return /\bwatches\b|cycling watch|wristwatch|smartwatch|chronograph|horolog|\btudor\b|breitling|richard mille|\brolex\b|\bcasio\b|\bbravur\b|omega (olympic|velodrome|timekeep)|f-?91w|black bay/.test(
        haystack,
      );
    },
  },
];


// Explicit projection: do not serialize article evidence, FAQ or full metadata into archive HTML.
export function toBlogSearchItem(post: BlogSearchItem): BlogSearchItem {
  return { slug: post.slug, title: post.title, excerpt: post.excerpt,
    pillar: post.pillar, publishDate: post.publishDate, readTime: post.readTime,
    featuredImage: post.featuredImage, keywords: post.keywords ?? [] };
}
export function getBlogSearchCounts(posts: BlogSearchItem[]) {
  return {
    total: posts.length,
    pillars: Object.fromEntries([...new Set(posts.map(p => p.pillar))].map(p => [p, posts.filter(x => x.pillar === p).length])),
    topics: Object.fromEntries(TOPIC_FILTERS.map(t => [t.id, posts.filter(t.match).length])),
  };
}
