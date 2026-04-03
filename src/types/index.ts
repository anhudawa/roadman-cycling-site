// ============================================
// Roadman Cycling — Core Types
// ============================================

export type ContentPillar =
  | "coaching"
  | "nutrition"
  | "strength"
  | "recovery"
  | "le-metier";

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
      "Fueling for performance, race weight, body composition, in-ride nutrition",
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
  "le-metier": {
    label: "Le Metier",
    color: "var(--color-pillar-le-metier)",
    description:
      "The culture of cycling: rides, skills, customs, traditions, the unwritten rules",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Podcast",
    href: "/podcast",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Tools",
    href: "/tools",
    children: [
      { label: "Tyre Pressure", href: "/tools/tyre-pressure" },
      { label: "FTP Zones", href: "/tools/ftp-zones" },
      { label: "Race Weight", href: "/tools/race-weight" },
      { label: "Energy Availability", href: "/tools/energy-availability" },
      { label: "In-Ride Fuelling", href: "/tools/fuelling" },
      { label: "Shock Pressure", href: "/tools/shock-pressure" },
    ],
  },
  {
    label: "Guests",
    href: "/guests",
  },
  {
    label: "Community",
    href: "/community",
    children: [
      { label: "Clubhouse (Free)", href: "/community/clubhouse" },
      { label: "Not Done Yet (Coaching)", href: "/community/not-done-yet" },
      { label: "Roadman CC (Dublin)", href: "/community/club" },
    ],
  },
  {
    label: "About",
    href: "/about",
  },
];
