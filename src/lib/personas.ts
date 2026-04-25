import { type ContentPillar } from "@/types";

/**
 * Persona-specific landing page data. Each persona on the homepage
 * PersonaRouter routes to `/you/[slug]` which renders a curated bundle
 * of content + a specific coaching CTA matched to that persona's pain.
 *
 * Four personas, mapped from the Roadman brand bible:
 *   - plateau  $†’ Tom, plateau-stuck club racer
 *   - event    $†’ Mark, event-target gran fondo achiever
 *   - comeback $†’ James, comeback athlete reclaiming form
 *   - listener $†’ Dave, podcast loyalist who hasn't pulled the trigger
 *
 * Content bundles are hand-curated to match each persona's dominant
 * pain point rather than generic pillar tags.
 */

export type PersonaSlug = "plateau" | "event" | "comeback" | "listener";

export interface PersonaContent {
  slug: PersonaSlug;
  /** Short URL label, e.g. "plateau" */
  urlLabel: string;
  /** Hero strapline above H1 */
  kicker: string;
  /** Hero H1 $€” recognition statement. Not a value prop, a mirror. */
  headline: string;
  /** Hero subheading $€” extends the recognition statement */
  subheading: string;
  /** Meta title & description for SEO */
  metaTitle: string;
  metaDescription: string;
  /** 3 hand-picked blog post slugs (not auto-filtered by pillar) */
  blogSlugs: string[];
  /** 2 hand-picked podcast episode slugs */
  podcastSlugs: string[];
  /** The single YouTube episode that anchors the page */
  featuredYoutube: {
    id: string;
    title: string;
    guest: string;
    duration: string;
  };
  /** Whether to render the mini-diagnostic widget on this page */
  hasDiagnostic: boolean;
  /** CTA block $€” coaching pitch + fallback soft CTA */
  ctaHeadline: string;
  ctaBody: string;
  /** Subject-line preview for the Saturday Spin email capture */
  emailHook: string;
  /** Pillar used for Badge colour */
  pillar: ContentPillar;
}

export const PERSONAS: Record<PersonaSlug, PersonaContent> = {
  plateau: {
    slug: "plateau",
    urlLabel: "plateau",
    kicker: "YOU'RE HERE BECAUSE",
    headline: "YOU'VE STOPPED GETTING FASTER.",
    subheading:
      "FTP hasn't moved in months. Same Strava segments, same numbers. You're training consistently, following the plans, doing the intervals $€” and nothing is moving. This is the most common pattern in amateur cycling. It has a name, a cause, and a fix.",
    metaTitle:
      "Stuck at a Cycling Plateau? Here's What's Actually Going On (2026)",
    metaDescription:
      "If your FTP hasn't moved in months despite consistent training, the problem isn't effort. It's intensity distribution. Here's the Seiler-backed fix, plus curated resources from the Roadman Podcast.",
    blogSlugs: [
      "polarised-training-cycling-guide",
      "stephen-seiler-research-polarised-training-lessons",
      "ftp-plateau-breakthrough",
    ],
    podcastSlugs: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    ],
    featuredYoutube: {
      id: "j443DjmheHw",
      title: "80/20 Training $€” Why it Actually Works",
      guest: "Prof. Stephen Seiler",
      duration: "52 min",
    },
    hasDiagnostic: true,
    ctaHeadline: "Break the plateau for good.",
    ctaBody:
      "The Not Done Yet coaching community runs a coached 5-pillar system that breaks the grey-zone rut. Personalised plan, weekly calls, expert masterclasses, daily accountability. Same Seiler principles, structured into your week.",
    emailHook:
      "The week's training breakdown. What broke Damien's plateau. Every Saturday.",
    pillar: "coaching",
  },
  event: {
    slug: "event",
    urlLabel: "event",
    kicker: "YOU'RE HERE BECAUSE",
    headline: "YOU'VE GOT A TARGET EVENT.",
    subheading:
      "A sportive, race, or fondo on the calendar. Maybe the Wicklow 200. Maybe Ride London. Maybe a Cat 3 league. You don't just want to finish $€” you want to perform. And you've got a specific number of weeks to make it happen.",
    metaTitle:
      "Training for a Specific Cycling Event? Build the Right Plan (2026)",
    metaDescription:
      "Structured training for sportives, fondos, and races. Periodisation, peaking, taper $€” the exact framework amateur cyclists use when they've got a target date and can't afford to wing it.",
    blogSlugs: [
      "cycling-periodisation-plan-guide",
      "cycling-tapering-guide",
      "wicklow-200-training-plan",
    ],
    podcastSlugs: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
    ],
    featuredYoutube: {
      id: "ov9qv73_lH4",
      title: "The Ideal Cycling Training Week",
      guest: "Joe Friel",
      duration: "68 min",
    },
    hasDiagnostic: true,
    ctaHeadline: "Build your season around the date.",
    ctaBody:
      "The Not Done Yet coaching community builds your plan backwards from your target event. Base, build, peak, taper $€” all structured around the specific week your event lands. 7-day free trial.",
    emailHook:
      "One specific session a week, tied to where you are in the build. Every Saturday.",
    pillar: "coaching",
  },
  comeback: {
    slug: "comeback",
    urlLabel: "comeback",
    kicker: "YOU'RE HERE BECAUSE",
    headline: "YOU'RE COMING BACK.",
    subheading:
      "Life got in the way. An injury, a crash, kids, the job, burnout, winter $€” whatever it was, you're rebuilding. The engine isn't what it used to be. The numbers look unfamiliar. But you're not done. And the right way back is not just 'ride more'.",
    metaTitle:
      "Coming Back to Cycling After a Break? Rebuild Without Wasting Months",
    metaDescription:
      "How to rebuild cycling fitness after a break $€” injury, life, burnout. Evidence-based return-to-riding protocols, body composition, strength, and the mental side of comeback.",
    blogSlugs: [
      "cycling-returning-after-break",
      "cycling-over-40-getting-faster",
      "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    ],
    podcastSlugs: [
      "ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton",
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
    ],
    featuredYoutube: {
      id: "HBx18rxMpkk",
      title: "Why I Quit the World Tour",
      guest: "Lachlan Morton",
      duration: "62 min",
    },
    hasDiagnostic: false,
    ctaHeadline: "Rebuild the engine, properly.",
    ctaBody:
      "The Not Done Yet coaching community is the coached comeback $€” especially for cyclists over 40 and anyone returning after a break. Structured, gentle-to-intense progression. Strength training built in. Personal accountability. 7-day free trial.",
    emailHook:
      "Every Saturday: what the research shows actually works for cyclists rebuilding form. No guilt, no 'all or nothing'.",
    pillar: "coaching",
  },
  listener: {
    slug: "listener",
    urlLabel: "listener",
    kicker: "YOU'RE HERE BECAUSE",
    headline: "YOU WANT TO TRAIN LIKE THE PROS.",
    subheading:
      "You listen to the podcast. You know the names $€” Seiler, Lorang, LeMond, Morton, Friel. You've absorbed the principles. But knowing and doing are two different things. This page is the short path: the best conversations, the core concepts, and what to do with them.",
    metaTitle:
      "Train Like the Pros: The Essentials Playlist from the Roadman Podcast",
    metaDescription:
      "The core cycling concepts from 1,400+ Roadman Podcast episodes $€” polarised training, periodisation, nutrition, recovery $€” curated into one starting point. Plus what to do next.",
    blogSlugs: [
      "is-a-cycling-coach-worth-it",
      "what-does-a-cycling-coach-do",
      "how-much-does-online-cycling-coach-cost-2026",
    ],
    podcastSlugs: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    ],
    featuredYoutube: {
      id: "j443DjmheHw",
      title: "80/20 Training $€” Why it Actually Works",
      guest: "Prof. Stephen Seiler",
      duration: "52 min",
    },
    hasDiagnostic: false,
    ctaHeadline: "Listening is enough. Until it isn't.",
    ctaBody:
      "Most of the audience stays here. The ones who compound the knowledge into results join the Not Done Yet coaching community $€” structured plan, weekly coaching calls, expert masterclasses, the same principles every episode has been pointing at. 7-day free trial.",
    emailHook:
      "One practical takeaway from the week's best conversations. Every Saturday. Free.",
    pillar: "coaching",
  },
};

export function getPersona(slug: string): PersonaContent | null {
  if (!(slug in PERSONAS)) return null;
  return PERSONAS[slug as PersonaSlug];
}

export function getAllPersonaSlugs(): PersonaSlug[] {
  return Object.keys(PERSONAS) as PersonaSlug[];
}
