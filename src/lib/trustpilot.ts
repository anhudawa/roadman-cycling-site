/**
 * Trustpilot reviews — single source of truth.
 *
 * Sourced from https://www.trustpilot.com/review/roadmancycling.com.
 * Each review is tagged with `category` so podcast pages surface
 * podcast-flavoured proof and coaching pages surface coaching-flavoured
 * proof. Update `rating` and `reviewCount` when the live profile shifts.
 */

export const TRUSTPILOT = {
  /** Overall TrustScore (Bayesian average — not the same as the simple
   *  mean across reviews; Trustpilot weights recency and review velocity). */
  rating: 4.5,
  /** Total review count across all stars. */
  reviewCount: 16,
  bestRating: 5,
  worstRating: 1,
  profileUrl: "https://www.trustpilot.com/review/roadmancycling.com",
  writeReviewUrl: "https://www.trustpilot.com/evaluate/roadmancycling.com",
  /** Display label for "Excellent" tier (4.3 – 5.0 on Trustpilot). */
  tierLabel: "Excellent",
} as const;

export type TrustpilotCategory = "podcast" | "coaching" | "both" | "general";

export interface TrustpilotReview {
  id: string;
  author: string;
  /** ISO 3166 alpha-2 country code as Trustpilot displays it. */
  country: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  /** Focused excerpt for visual display. ≤ ~280 chars where possible. */
  quote: string;
  /** Optional shorter pull-out for tight layouts (e.g. 3-up grids). */
  shortQuote?: string;
  /** ISO yyyy-mm-dd. Used for schema.org/Review.datePublished. */
  date: string;
  /** Routing label — controls which surfaces show this review. */
  category: TrustpilotCategory;
}

export const TRUSTPILOT_REVIEWS: TrustpilotReview[] = [
  {
    id: "simon-hill",
    author: "Simon Hill",
    country: "GB",
    rating: 5,
    title: "Listening, watching and doing — changed my opinions on cycling",
    quote:
      "Working with Anthony and his team, I have lost more weight than I could have ever imagined, my FTP has gone up and my power to weight ratio has increased significantly. Training has become fun and disciplined.",
    shortQuote:
      "Working with Anthony and his team, I have lost more weight than I could have ever imagined, my FTP has gone up and my power to weight ratio has increased significantly.",
    date: "2026-05-08",
    category: "both",
  },
  {
    id: "aidan",
    author: "Aidan",
    country: "IE",
    rating: 5,
    title: "Came for the podcast, stayed for the pain cave",
    quote:
      "Working with Anthony I got over a 30% increase in my FTP power over a 4 month period. As a former professional who truly cares about your progress, it's great working with him.",
    shortQuote:
      "Working with Anthony I got over a 30% increase in my FTP power over a 4 month period.",
    date: "2026-05-08",
    category: "both",
  },
  {
    id: "johannes",
    author: "Johannes",
    country: "DK",
    rating: 5,
    title: "Roadman cycling is more than a podcast",
    quote:
      "Roadman cycling is more than a podcast, more than a coaching platform and more than a club — it's an all encompassing cycling community and a space where cyclists of all levels and abilities can thrive and develop together.",
    shortQuote:
      "Roadman cycling is more than a podcast, more than a coaching platform and more than a club — it's an all encompassing cycling community.",
    date: "2026-05-01",
    category: "general",
  },
  {
    id: "luke-keaney",
    author: "Luke Keaney",
    country: "IE",
    rating: 5,
    title: "Pro level knowledge for all levels of cycling",
    quote:
      "Great service — providing real life information and advice on all things knowledge in simple format with access to top coaches. Top class service and with great detail.",
    shortQuote:
      "Great service — real life information and advice with access to top coaches. Top class service.",
    date: "2026-05-08",
    category: "general",
  },
  {
    id: "bryan-daly",
    author: "Bryan Daly",
    country: "IE",
    rating: 5,
    title: "Roadman all round",
    quote:
      "From listening to the podcast, the Instagram clips to the weekend cycles with the Roadman crew. From day one on the road with Anto and Sarah, encouragement and enjoyment starts as soon as you show up for the spin. Can't rate or recommend the guys high enough.",
    shortQuote:
      "From day one on the road with Anto and Sarah, encouragement and enjoyment starts as soon as you show up for the spin.",
    date: "2026-05-07",
    category: "general",
  },
  {
    id: "sally",
    author: "Sally",
    country: "NL",
    rating: 5,
    title: "Give it a shot",
    quote:
      "Joined the Not Done Yet coaching program 7 months ago. With the amount of attention and guidance I have been receiving I am on track to crush my A priority race. One of the most helpful features is the community — so many like minded cyclists chatting daily about tech, kit, aero, pro cycling. Would highly recommend.",
    shortQuote:
      "Joined Not Done Yet 7 months ago. With the attention and guidance I'm on track to crush my A priority race. Would highly recommend.",
    date: "2026-01-03",
    category: "coaching",
  },
  {
    id: "mark",
    author: "Mark",
    country: "IE",
    rating: 5,
    title: "Like a good honest training partner who's never late to show up",
    quote:
      "Big fan of the Roadman Concept. The Podcast hosts bring out the fun and interesting aspects from real people I've raced with or watched on TV and gives me a sense of home when I'm out riding alone. Keep bringing us more of your opinionated insights, and stay original.",
    shortQuote:
      "The Podcast hosts bring out the fun and interesting aspects from real people I've raced with or watched on TV.",
    date: "2026-05-07",
    category: "podcast",
  },
  {
    id: "conn-mcdunphy",
    author: "Conn McDunphy",
    country: "IE",
    rating: 5,
    title: "Recommend",
    quote:
      "Anto is great and extremely knowledgeable on the cycling. If he doesn't have the answer (unlikely) he'll know someone does. Highly recommend.",
    shortQuote:
      "Anto is great and extremely knowledgeable. If he doesn't have the answer he'll know someone who does.",
    date: "2026-05-07",
    category: "general",
  },
  {
    id: "gill-mckenna",
    author: "Gill McKenna",
    country: "IE",
    rating: 5,
    title: "Love the podcast",
    quote: "Love the podcast — and the guests are always amazing.",
    shortQuote: "Love the podcast — and the guests are always amazing.",
    date: "2026-05-08",
    category: "podcast",
  },
  {
    id: "stephen-connor",
    author: "Stephen Connor",
    country: "IE",
    rating: 5,
    title: "Excellent coaching with an emphasis on the athlete-coach relationship",
    quote:
      "Have worked with Roadman Coaching (Anthony and Sarah) for several years. Brilliant one-to-one coaching with an emphasis on the athlete-coach relationship.",
    shortQuote:
      "Have worked with Roadman Coaching for several years. Brilliant one-to-one coaching with an emphasis on the athlete-coach relationship.",
    date: "2026-02-28",
    category: "coaching",
  },
  {
    id: "dylan-kearns",
    author: "Dylan Kearns",
    country: "IE",
    rating: 5,
    title: "Hands down one of the best cycling podcasts out there",
    quote:
      "The Roadman Cycling Podcast is hands down one of the best cycling podcasts out there. What sets it apart is the quality of the guests and the depth of the discussions — practical, inspiring, and never superficial. You can tell Anthony and Sarah genuinely care about helping cyclists improve, not just creating content for clicks.",
    shortQuote:
      "Hands down one of the best cycling podcasts out there. Practical, inspiring, and never superficial.",
    date: "2026-05-08",
    category: "podcast",
  },
  {
    id: "ciaran",
    author: "Ciaran",
    country: "IE",
    rating: 5,
    title: "Love the pod and coaching",
    quote:
      "Love the pod. Learned so much about cycling from it. Also been coached by Anto previously and he made a massive difference. Couldn't recommend highly enough.",
    shortQuote:
      "Love the pod. Coached by Anto previously and he made a massive difference. Couldn't recommend highly enough.",
    date: "2026-05-08",
    category: "both",
  },
  {
    id: "liam-halpin",
    author: "Liam Halpin",
    country: "IE",
    rating: 5,
    title: "Real-world knowledge and coaching for real-world cycling",
    quote:
      "I started as a listener to the podcast early in 2022, and later that year became a direct coaching customer as I prepped for The Rift and The Traka 2023. Working with Anthony, he built a structure for me that helped me become a much better cyclist. Whether it's the podcast, personalised or group coaching, or the Roadman Cycling camps — I highly recommend.",
    shortQuote:
      "Working with Anthony, he built a structure that helped me become a much better cyclist. Whether it's the podcast, coaching, or the camps — I highly recommend.",
    date: "2026-05-08",
    category: "both",
  },
  {
    id: "aaron-buggle",
    author: "Aaron Buggle",
    country: "IE",
    rating: 5,
    title: "Honest, practical cycling content",
    quote:
      "Really enjoying what Anthony is building at Roadman. The podcast is one of the better cycling listens out there. Practical, strong guests and real-world experience behind the coaching and advice.",
    shortQuote:
      "The podcast is one of the better cycling listens out there. Practical, strong guests and real-world experience.",
    date: "2025-05-08",
    category: "podcast",
  },
  {
    id: "sean-mckenna",
    author: "Sean McKenna",
    country: "IE",
    rating: 5,
    title: "Great podcast by people that know and love cycling",
    quote: "Great podcast by people that know and love cycling.",
    shortQuote: "Great podcast by people that know and love cycling.",
    date: "2026-03-08",
    category: "podcast",
  },
  {
    id: "wesley-andrade",
    author: "Wesley Andrade de Sousa",
    country: "IE",
    rating: 5,
    title: "Probably my favourite cycling podcast",
    quote:
      "Probably my favourite cycling podcast right now. Feels super natural and easy to listen to, not too technical but still really interesting. Anthony Walsh has a great vibe and the episodes genuinely make me want to ride more. Perfect mix of cycling, motivation and good conversations.",
    shortQuote:
      "Probably my favourite cycling podcast right now. Anthony Walsh has a great vibe and the episodes genuinely make me want to ride more.",
    date: "2026-05-01",
    category: "podcast",
  },
];

/**
 * Pick reviews for a surface. `audience` controls which categories are
 * eligible: podcast surfaces show podcast + both, coaching surfaces show
 * coaching + both, mixed surfaces show everything. Returns reviews in
 * editorial order (newest, then strongest signal first within category).
 */
export function getTrustpilotReviews(
  audience: "podcast" | "coaching" | "mixed",
  limit?: number,
): TrustpilotReview[] {
  let pool: TrustpilotReview[];
  if (audience === "podcast") {
    pool = TRUSTPILOT_REVIEWS.filter(
      (r) => r.category === "podcast" || r.category === "both",
    );
  } else if (audience === "coaching") {
    pool = TRUSTPILOT_REVIEWS.filter(
      (r) => r.category === "coaching" || r.category === "both",
    );
  } else {
    pool = TRUSTPILOT_REVIEWS;
  }
  return typeof limit === "number" ? pool.slice(0, limit) : pool;
}
