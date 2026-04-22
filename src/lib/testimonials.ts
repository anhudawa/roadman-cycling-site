import { type PersonaSlug } from "./personas";

/**
 * Centralised testimonial library.
 *
 * Every real member quote scattered across /apply, /coaching,
 * /community/not-done-yet, /strength-training and /coaching/<loc>
 * pulled into one source, tagged with which personas they resonate
 * with so we can rotate them on the persona landing pages.
 *
 * Adding a new testimonial:
 *   1. Append here with persona tags.
 *   2. If it deserves a stat pull-out on a hero block, fill `stat`
 *      and `statLabel`.
 *   3. Optional `tag` is the uppercase chip label (BODY COMPOSITION
 *      etc) used on the /coaching in-their-words row.
 */

export interface Testimonial {
  name: string;
  /** Short sub-line under the name, e.g. "Ireland · FTP 205w → 295w" */
  detail: string;
  /** Full quote */
  quote: string;
  /** Shorter version for tight layouts (~2 sentences) */
  shortQuote?: string;
  /** Personas this testimonial most resonates with */
  personas: PersonaSlug[];
  /** Optional pull-out stat, e.g. "+90w", "3 → 1", "-16kg" */
  stat?: string;
  statLabel?: string;
  /** Chip label for visual categorisation */
  tag?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Damien Maloney",
    detail: "Ireland · FTP 205w → 295w",
    quote:
      "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined. The coaches are very generous with their time and knowledge.",
    shortQuote:
      "I was an average sportive rider who had plateaued. Roadman custom built a plan and I've gotten much more out of it than I ever imagined.",
    personas: ["plateau", "event", "listener"],
    stat: "+90w",
    statLabel: "FTP gain",
    tag: "PLATEAU BROKEN",
  },
  {
    name: "David Lundy",
    detail: "Comeback after crash · Back racing in 4 months",
    quote:
      "I signed up for Not Done Yet after a bad accident in March 2025 and was struggling to get back to the same level. I was starting to lose my enthusiasm for riding. Four months later, I've got my mojo back and I'm really enjoying riding again. Just signed up for my first race this coming Tuesday.",
    shortQuote:
      "After a bad accident I was losing my enthusiasm. Four months later I've got my mojo back. Just signed up for my first race.",
    personas: ["comeback"],
    stat: "4 months",
    statLabel: "Back racing",
    tag: "COMEBACK",
  },
  {
    name: "Chris O'Connor",
    detail: "Ireland · 20% body fat → 7% · 84kg → 68kg",
    quote:
      "Anthony is a visionary, an educator, a mentor, a coach. He set me on a dietary, mental and physical journey of true discovery. Average wattage doubled and now weekly 100km+ rides are the norm.",
    shortQuote:
      "Anthony set me on a dietary, mental and physical journey. Average wattage doubled. Weekly 100km+ rides are now the norm.",
    personas: ["comeback", "listener"],
    stat: "-16kg",
    statLabel: "Lost",
    tag: "BODY COMPOSITION",
  },
  {
    name: "Daniel Stone",
    detail: "Roadman Cycling Club · Category jump",
    quote:
      "One season with the system and I went from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
    shortQuote:
      "One season with the system and I went from Cat 3 to Cat 1. The structured approach changed everything.",
    personas: ["event", "plateau"],
    stat: "3 → 1",
    statLabel: "Category jump",
    tag: "CATEGORY JUMP",
  },
  {
    name: "Brian Morrissey",
    detail: "52yo shift worker · FTP 230w → 265w in 10 weeks",
    quote:
      "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193. FTP up 15%, hit 4 w/kg at age 52.",
    shortQuote:
      "I'm training less, at lower intensities, not getting sick. FTP up 15%, hit 4 w/kg at age 52.",
    personas: ["comeback", "plateau"],
    stat: "+15%",
    statLabel: "FTP at 52",
    tag: "AGE 50+",
  },
  {
    name: "Blair Corey",
    detail: "20-min power · 236w → 296w in 3 months",
    quote:
      "Did my second 20-min effort since joining NDY. December 19th avg power 236 — March 30th avg power 296. Hard to believe a 60-watt increase in 3 months. Also felt like I had nothing left back in December, today I was left feeling I paced it wrong and could have gone harder.",
    shortQuote:
      "Second 20-min effort since joining. Avg power 236 → 296 in 3 months. Hard to believe a 60-watt increase.",
    personas: ["plateau"],
    stat: "+60W",
    statLabel: "20-min power",
  },
  {
    name: "Gregory Gross",
    detail: "USA · 315lbs → under 100kg · 15-year low weight",
    quote:
      "2019 was planning to compete in RAAM. Nov 2019 I was 315 pounds, about to go on disability. Quarantine was a godsend. Jan 5 I started Not Done Yet. Today I'm down 5 pounds and 1% body fat to my lowest weight in 15 years. I cannot believe I'm under 100kg.",
    shortQuote:
      "Nov 2019 I was 315 pounds, about to go on disability. Today I'm under 100kg — my lowest weight in 15 years.",
    personas: ["comeback", "listener"],
    stat: "Sub-100kg",
    statLabel: "From 315lbs",
  },
  {
    name: "John Devlin",
    detail: "Ireland · -6.7kg since December",
    quote:
      "Work has been beyond crazy the last two weeks. Anthony recently said it's the tougher weeks that define your progress. Since mid-December I've gone from 103kg to 96.3kg — down 6.7kg. I'm really encouraged.",
    shortQuote:
      "Since mid-December I've gone from 103kg to 96.3kg — down 6.7kg. Really encouraged by the progress.",
    personas: ["listener", "plateau"],
    stat: "-6.7kg",
    statLabel: "Since December",
  },
  {
    name: "Aaron Kearney",
    detail: "Road racer → ultra cyclist",
    quote:
      "The expertise and personalised plan allowed me to utilise my past racing experience and gave me the adaptations needed for the changeover to ultra. If you're looking to unlock new potential, I couldn't recommend Anthony enough.",
    shortQuote:
      "The personalised plan gave me the adaptations needed for the changeover to ultra. Couldn't recommend Anthony enough.",
    personas: ["event", "comeback"],
    stat: "Ultra",
    statLabel: "Made the leap",
  },
  {
    name: "Kazim",
    detail: "Novice · 800km + 18,500m climbing in 7 days",
    quote:
      "From being a complete novice to completing a 7-day race covering more than 800km with 18,500m of climbing. They pushed me to the limits and I had full confidence and trust in them.",
    shortQuote:
      "Complete novice to completing a 7-day 800km race. They pushed me to the limits.",
    personas: ["event", "comeback"],
    stat: "800km",
    statLabel: "7-day race",
  },
  {
    name: "Ian McKnight",
    detail: "Commuter to racer in one season",
    quote:
      "I had a disappointing season dabbling in racing, mostly getting dropped. My coach gave me a structured pre-season programme and everything changed.",
    shortQuote:
      "I had a disappointing season mostly getting dropped. A structured pre-season programme and everything changed.",
    personas: ["event", "listener"],
    stat: "Racer",
    statLabel: "In one season",
  },
  {
    name: "Quinton Gothard",
    detail: "First Zwift race win",
    quote:
      "I've been riding the Zwift races and finally won a race despite the steep climbs coming at the end. Super pleased I had enough in the tank to cut sprint the small bunch that was left.",
    shortQuote:
      "Finally won a Zwift race despite the steep climbs at the end. Had enough in the tank to sprint the small bunch.",
    personas: ["event"],
    stat: "1st win",
    statLabel: "Zwift race",
  },
  {
    name: "Vern Locke",
    detail: "Power PR · 915W 5-sec",
    quote:
      "When I started pedalling, I noticed quickly that I felt like there was 'no chain'. Set a new 5-sec PB for the freewheel. MAX power from 77W to 832W, new 5-sec PR of 915W.",
    shortQuote:
      "Felt like there was no chain. New 5-sec PB: 915W. Power PR when you least expect it.",
    personas: ["plateau", "event"],
    stat: "915W",
    statLabel: "5-sec PR",
  },
  {
    name: "David Corrigan",
    detail: "New 15-sec power PB",
    quote:
      "Just back from a 3-hour endurance ride with some sprint efforts in the middle and end. Checked my data and I have just got a power PB for 15 seconds. Delighted. Shows the work is paying off.",
    shortQuote:
      "Back from a 3-hour endurance ride with sprint efforts. Just got a power PB for 15 seconds. The work is paying off.",
    personas: ["plateau"],
    stat: "15-sec PB",
    statLabel: "Power PR",
  },
  {
    name: "Keano Donne",
    detail: "2-min PB · 610W",
    quote:
      "Got another PB while doing descending 4x2 today. Beat an old Ramblers of 2023. My 2-min was 615W and the climb was sub-5 minutes. Big achievement. Today I wanted to beat that 2-min. I did a 25W improvement to get 610W/2min.",
    shortQuote:
      "Another PB on descending 4x2 today. 25W improvement to 610W/2min. Big achievement.",
    personas: ["plateau", "event"],
    stat: "610W",
    statLabel: "2-min PB",
  },
  {
    name: "Kevin L",
    detail: "Age 67 · 40+ years on the bike",
    quote:
      "I've been riding for over four decades and never realised how much I was leaving on the table. I'm more powerful, more stable, and recovering faster. I only wish I found this sooner.",
    shortQuote:
      "Riding for four decades and never realised how much I was leaving on the table. More powerful, more stable, recovering faster.",
    personas: ["comeback", "listener"],
    stat: "40+ yrs",
    statLabel: "On the bike",
  },
  {
    name: "Mary K",
    detail: "Age 56 · Strength that transfers",
    quote:
      "I love how targeted it is to cycling — not just general gym stuff. Every session feels like it's actually helping my performance on the bike. Core's stronger, legs feel more connected, and even my position on the bike feels better.",
    shortQuote:
      "Targeted to cycling — not general gym stuff. Core's stronger, legs feel more connected, position feels better.",
    personas: ["comeback", "listener"],
    stat: "S&C",
    statLabel: "That transfers",
  },
  {
    name: "Ciaran O Conluain",
    detail: "Cycling all over the world",
    quote:
      "Anthony has been the most influential person in my cycling experience. He always knew how to push when needed and encourage when times were tough. None of it would have been possible without Anthony and his team.",
    shortQuote:
      "Anthony has been the most influential person in my cycling experience. None of it would have been possible without him.",
    personas: ["listener", "comeback"],
  },
];

/**
 * Return up to `count` testimonials tagged for this persona, in priority
 * order. Deterministic (same input → same output) so SSR and client
 * render the same order. Falls back to cross-persona testimonials if
 * we run out of persona-tagged ones.
 */
export function getTestimonialsForPersona(
  persona: PersonaSlug,
  count = 3,
): Testimonial[] {
  const matched = TESTIMONIALS.filter((t) => t.personas.includes(persona));
  if (matched.length >= count) return matched.slice(0, count);
  // Top up with strongest cross-persona quotes if needed
  const extras = TESTIMONIALS.filter(
    (t) => !t.personas.includes(persona) && !matched.includes(t),
  );
  return [...matched, ...extras].slice(0, count);
}

/**
 * Get one "hero" testimonial for a persona — the first-priority quote
 * with a pull-out stat, intended for the trust block near the hero.
 */
export function getHeroTestimonial(persona: PersonaSlug): Testimonial {
  const matched = TESTIMONIALS.filter(
    (t) => t.personas.includes(persona) && t.stat,
  );
  return matched[0] ?? TESTIMONIALS[0];
}

/**
 * Pull a specific set of testimonials by name (in the order provided).
 * Useful for pages with editorial control over exact quotes, like
 * /coaching 'IN THEIR WORDS' row, /apply featured wins, etc.
 *
 * Silently drops names that don't match — safer than throwing in SSR.
 */
export function getTestimonialsByName(names: string[]): Testimonial[] {
  return names
    .map((n) => TESTIMONIALS.find((t) => t.name === n))
    .filter((t): t is Testimonial => t !== undefined);
}
