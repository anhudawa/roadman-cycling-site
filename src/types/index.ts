// ============================================
// Roadman Cycling — Core Types
// ============================================

export type ContentPillar =
  | "coaching"
  | "nutrition"
  | "strength"
  | "recovery"
  | "community";

export type EpisodeType = "interview" | "solo" | "panel" | "sarah-anthony";

export interface Episode {
  slug: string;
  title: string;
  episodeNumber: number;
  guest?: string;
  guestImage?: string;
  guestCredential?: string;
  description: string;
  publishDate: string;
  duration: string;
  audioUrl: string;
  pillar: ContentPillar;
  type: EpisodeType;
  keywords: string[];
  transcript?: string;
  blogContent?: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  publishDate: string;
  updatedDate?: string;
  pillar: ContentPillar;
  excerpt: string;
  content: string;
  featuredImage: string;
  readTime: number;
  keywords: string[];
  relatedEpisodes?: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: string;
  pillar: ContentPillar;
}

export interface Testimonial {
  name: string;
  avatar?: string;
  tier: "clubhouse" | "standard" | "premium" | "vip";
  quote: string;
  result?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const CONTENT_PILLARS: Record<
  ContentPillar,
  { label: string; color: string; description: string }
> = {
  coaching: {
    label: "Coaching",
    color: "var(--color-pillar-coaching)",
    description:
      "Training methodology, periodisation, structured plans, what the pros actually do",
  },
  nutrition: {
    label: "Nutrition",
    color: "var(--color-pillar-nutrition)",
    description:
      "Fuelling for performance, race weight, body composition, in-ride nutrition",
  },
  strength: {
    label: "Strength & Conditioning",
    color: "var(--color-pillar-strength)",
    description:
      "S&C for cyclists, injury prevention, power development off the bike",
  },
  recovery: {
    label: "Recovery",
    color: "var(--color-pillar-recovery)",
    description:
      "Sleep, stress management, adaptation, longevity in the sport",
  },
  community: {
    label: "Community",
    color: "var(--color-pillar-community)",
    description:
      "The culture of cycling: rides, skills, customs, traditions, the unwritten rules — and the community you do them with",
  },
};

/**
 * Top-level nav: intent-led navigation per blueprint.
 *
 * Guide by user problem, not by content type. Podcast stays
 * (brand anchor), Learn groups educational surfaces, Tools is
 * the utility engine, Coaching is the revenue channel.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Podcast",
    href: "/podcast",
  },
  {
    label: "Learn",
    href: "/start-here",
    children: [
      { label: "Start Here", href: "/start-here" },
      { label: "Blog", href: "/blog" },
      { label: "Topic Hubs", href: "/topics" },
      { label: "Glossary", href: "/glossary" },
      { label: "Comparisons", href: "/compare" },
      { label: "Training Plans", href: "/plan" },
      { label: "Research & Evidence", href: "/research" },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    children: [
      { label: "Race Predictor", href: "/predict" },
      { label: "FTP Zones", href: "/tools/ftp-zones" },
      { label: "HR Zones", href: "/tools/hr-zones" },
      { label: "W/kg Calculator", href: "/tools/wkg" },
      { label: "Tyre Pressure", href: "/tools/tyre-pressure" },
      { label: "Race Weight", href: "/tools/race-weight" },
      { label: "In-Ride Fuelling", href: "/tools/fuelling" },
      { label: "Energy Availability", href: "/tools/energy-availability" },
      { label: "MTB Setup", href: "/tools/shock-pressure" },
      { label: "Plateau Diagnostic", href: "/plateau" },
      { label: "Coaching Assessment", href: "/assessment" },
    ],
  },
  {
    label: "Ask Roadman",
    href: "/ask",
  },
  {
    label: "Coaching",
    href: "/coaching",
    children: [
      { label: "Apply for Coaching", href: "/apply" },
      { label: "How It Works", href: "/coaching" },
      { label: "Triathlon Coaching", href: "/coaching/triathletes" },
      { label: "Strength Training", href: "/strength-training" },
      { label: "Not Done Yet Community", href: "/community/not-done-yet" },
      { label: "Clubhouse (Free)", href: "/community/clubhouse" },
    ],
  },
  {
    label: "About",
    href: "/about",
  },
];
