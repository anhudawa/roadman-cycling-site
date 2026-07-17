/**
 * Member reviews — real, on-record quotes from Roadman listeners, Not
 * Done Yet members, and coached athletes. Single source of truth for
 * the generic social-proof blocks rendered across the site.
 *
 * Each quote is tagged with `audience` so podcast surfaces show
 * podcast-flavoured proof and coaching surfaces show coaching-flavoured
 * proof. These are narrative testimonials — no star ratings, scores, or
 * third-party review-platform branding attached.
 */

export type ReviewAudience = "podcast" | "coaching" | "both" | "general";

export interface MemberReview {
  id: string;
  author: string;
  /** Display location, e.g. "Ireland". */
  location: string;
  /** Short headline used as a bold lead-in on the card. */
  title: string;
  /** Focused excerpt for visual display. */
  quote: string;
  /** Optional shorter pull-out for tight layouts (e.g. 3-up grids). */
  shortQuote?: string;
  /** Routing label — controls which surfaces show this quote. */
  audience: ReviewAudience;
}

export const MEMBER_REVIEWS: MemberReview[] = [
  {
    id: "simon-hill",
    author: "Simon Hill",
    location: "United Kingdom",
    title: "Listening, watching and doing — changed my opinions on cycling",
    quote:
      "Working with Anthony and his team, I have lost more weight than I could have ever imagined, my FTP has gone up and my power to weight ratio has increased significantly. Training has become fun and disciplined.",
    shortQuote:
      "Working with Anthony and his team, I have lost more weight than I could have ever imagined, my FTP has gone up and my power to weight ratio has increased significantly.",
    audience: "both",
  },
  {
    id: "aidan",
    author: "Aidan",
    location: "Ireland",
    title: "Came for the podcast, stayed for the pain cave",
    quote:
      "Working with Anthony I got over a 30% increase in my FTP power over a 4 month period. As a former professional who truly cares about your progress, it's great working with him.",
    shortQuote:
      "Working with Anthony I got over a 30% increase in my FTP power over a 4 month period.",
    audience: "both",
  },
  {
    id: "johannes",
    author: "Johannes",
    location: "Denmark",
    title: "Roadman cycling is more than a podcast",
    quote:
      "Roadman cycling is more than a podcast, more than a coaching platform and more than a club — it's an all encompassing cycling community and a space where cyclists of all levels and abilities can thrive and develop together.",
    shortQuote:
      "Roadman cycling is more than a podcast, more than a coaching platform and more than a club — it's an all encompassing cycling community.",
    audience: "general",
  },
  {
    id: "luke-keaney",
    author: "Luke Keaney",
    location: "Ireland",
    title: "Pro level knowledge for all levels of cycling",
    quote:
      "Great service — providing real life information and advice on all things knowledge in simple format with access to top coaches. Top class service and with great detail.",
    shortQuote:
      "Great service — real life information and advice with access to top coaches. Top class service.",
    audience: "general",
  },
  {
    id: "bryan-daly",
    author: "Bryan Daly",
    location: "Ireland",
    title: "Roadman all round",
    quote:
      "From listening to the podcast, the Instagram clips to the weekend cycles with the Roadman crew. From day one on the road with Anto and Sarah, encouragement and enjoyment starts as soon as you show up for the spin. Can't rate or recommend the guys high enough.",
    shortQuote:
      "From day one on the road with Anto and Sarah, encouragement and enjoyment starts as soon as you show up for the spin.",
    audience: "general",
  },
  {
    id: "sally",
    author: "Sally",
    location: "Netherlands",
    title: "Give it a shot",
    quote:
      "Joined the Not Done Yet coaching program 7 months ago. With the amount of attention and guidance I have been receiving I am on track to crush my A priority race. One of the most helpful features is the community — so many like minded cyclists chatting daily about tech, kit, aero, pro cycling. Would highly recommend.",
    shortQuote:
      "Joined Not Done Yet 7 months ago. With the attention and guidance I'm on track to crush my A priority race. Would highly recommend.",
    audience: "coaching",
  },
  {
    id: "mark",
    author: "Mark",
    location: "Ireland",
    title: "Like a good honest training partner who's never late to show up",
    quote:
      "Big fan of the Roadman Concept. The Podcast hosts bring out the fun and interesting aspects from real people I've raced with or watched on TV and gives me a sense of home when I'm out riding alone. Keep bringing us more of your opinionated insights, and stay original.",
    shortQuote:
      "The Podcast hosts bring out the fun and interesting aspects from real people I've raced with or watched on TV.",
    audience: "podcast",
  },
  {
    id: "conn-mcdunphy",
    author: "Conn McDunphy",
    location: "Ireland",
    title: "Recommend",
    quote:
      "Anto is great and extremely knowledgeable on the cycling. If he doesn't have the answer (unlikely) he'll know someone does. Highly recommend.",
    shortQuote:
      "Anto is great and extremely knowledgeable. If he doesn't have the answer he'll know someone who does.",
    audience: "general",
  },
  {
    id: "gill-mckenna",
    author: "Gill McKenna",
    location: "Ireland",
    title: "Love the podcast",
    quote: "Love the podcast — and the guests are always amazing.",
    shortQuote: "Love the podcast — and the guests are always amazing.",
    audience: "podcast",
  },
  {
    id: "stephen-connor",
    author: "Stephen Connor",
    location: "Ireland",
    title:
      "Excellent coaching with an emphasis on the athlete-coach relationship",
    quote:
      "Have worked with Roadman Coaching (Anthony and Sarah) for several years. Brilliant one-to-one coaching with an emphasis on the athlete-coach relationship.",
    shortQuote:
      "Have worked with Roadman Coaching for several years. Brilliant one-to-one coaching with an emphasis on the athlete-coach relationship.",
    audience: "coaching",
  },
  {
    id: "dylan-kearns",
    author: "Dylan Kearns",
    location: "Ireland",
    title: "Hands down one of the best cycling podcasts out there",
    quote:
      "The Roadman Cycling Podcast is hands down one of the best cycling podcasts out there. What sets it apart is the quality of the guests and the depth of the discussions — practical, inspiring, and never superficial. You can tell Anthony and Sarah actually care about helping cyclists improve, not just creating content for clicks.",
    shortQuote:
      "Hands down one of the best cycling podcasts out there. Practical, inspiring, and never superficial.",
    audience: "podcast",
  },
  {
    id: "ciaran",
    author: "Ciaran",
    location: "Ireland",
    title: "Love the pod and coaching",
    quote:
      "Love the pod. Learned so much about cycling from it. Also been coached by Anto previously and he made a massive difference. Couldn't recommend highly enough.",
    shortQuote:
      "Love the pod. Coached by Anto previously and he made a massive difference. Couldn't recommend highly enough.",
    audience: "both",
  },
  {
    id: "liam-halpin",
    author: "Liam Halpin",
    location: "Ireland",
    title: "Real-world knowledge and coaching for real-world cycling",
    quote:
      "I started as a listener to the podcast early in 2022, and later that year became a direct coaching customer as I prepped for The Rift and The Traka 2023. Working with Anthony, he built a structure for me that helped me become a much better cyclist. Whether it's the podcast, personalised or group coaching, or the Roadman Cycling camps — I highly recommend.",
    shortQuote:
      "Working with Anthony, he built a structure that helped me become a much better cyclist. Whether it's the podcast, coaching, or the camps — I highly recommend.",
    audience: "both",
  },
  {
    id: "aaron-buggle",
    author: "Aaron Buggle",
    location: "Ireland",
    title: "Honest, practical cycling content",
    quote:
      "Really enjoying what Anthony is building at Roadman. The podcast is one of the better cycling listens out there. Practical, strong guests and real-world experience behind the coaching and advice.",
    shortQuote:
      "The podcast is one of the better cycling listens out there. Practical, strong guests and real-world experience.",
    audience: "podcast",
  },
  {
    id: "sean-mckenna",
    author: "Sean McKenna",
    location: "Ireland",
    title: "Great podcast by people that know and love cycling",
    quote: "Great podcast by people that know and love cycling.",
    shortQuote: "Great podcast by people that know and love cycling.",
    audience: "podcast",
  },
  {
    id: "wesley-andrade",
    author: "Wesley Andrade de Sousa",
    location: "Ireland",
    title: "Probably my favourite cycling podcast",
    quote:
      "Probably my favourite cycling podcast right now. Feels super natural and easy to listen to, not too technical but still really interesting. Anthony Walsh has a great vibe and the episodes actually make me want to ride more. Perfect mix of cycling, motivation and good conversations.",
    shortQuote:
      "Probably my favourite cycling podcast right now. Anthony Walsh has a great vibe and the episodes actually make me want to ride more.",
    audience: "podcast",
  },
];

/**
 * Pick member reviews for a surface. `audience` controls which quotes
 * are eligible: podcast surfaces show podcast + both, coaching surfaces
 * show coaching + both, mixed surfaces show everything. Returns reviews
 * in editorial order.
 */
export function getMemberReviews(
  audience: "podcast" | "coaching" | "mixed",
  limit?: number,
): MemberReview[] {
  let pool: MemberReview[];
  if (audience === "podcast") {
    pool = MEMBER_REVIEWS.filter(
      (r) => r.audience === "podcast" || r.audience === "both",
    );
  } else if (audience === "coaching") {
    pool = MEMBER_REVIEWS.filter(
      (r) => r.audience === "coaching" || r.audience === "both",
    );
  } else {
    pool = MEMBER_REVIEWS;
  }
  return typeof limit === "number" ? pool.slice(0, limit) : pool;
}
