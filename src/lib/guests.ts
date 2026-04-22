import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import { type ContentPillar } from "@/types";

export type GuestTag = "triathlon" | "ultra-endurance" | "pro-rider" | "science" | "industry";

export interface GuestProfile {
  name: string;
  slug: string;
  credential?: string;
  episodeCount: number;
  episodes: EpisodeMeta[];
  pillars: ContentPillar[];
  tags: GuestTag[];
  latestAppearance: string;
  firstAppearance: string;
}

/**
 * Names that are actually show formats, video titles, or non-guest entries.
 * These get filtered out of the guest directory.
 */
const EXCLUDED_NAMES = new Set([
  "Rider Support",
  "Roadman Podcast",
  "RDMN Clips",
  "Rdmn Podcast Clips",
  "RDMN Podcast Clips",
  "Roadman Cycling Podcast",
  "Roadman Clips",
  "Team Jayco's Secret AI Tech",
  "Time Trial",
  "Tour of Flanders",
  "World Tour Nutritionist",
  "Eva Lovia",
  "Joss Ross",
]);

/**
 * Heuristic: is this a real person name vs. a video title shoved into the guest field?
 * Real names are 2-4 words, start with uppercase, no special chars.
 */
function isLikelyPersonName(name: string): boolean {
  if (EXCLUDED_NAMES.has(name)) return false;

  // Filter out obvious video titles (contain common title patterns)
  const titlePatterns = [
    /^(How|Why|What|When|The|My|I\b|Top|Best|Secret|Effect|First|Perfect|Racing|Reacting|Decoding|Pros?\b|BADLANDS|Majorca|Protein|Ultimate)/i,
    /[!?]/,
    /\d{4}/, // contains a year
    /Training|Cycling|Bike|Aero|Winter|Zone|Crash|Fight|Selected|Illness|Questions|Tips/i,
  ];

  for (const pattern of titlePatterns) {
    if (pattern.test(name)) return false;
  }

  // Must be 2-4 words (typical name length)
  const words = name.trim().split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;

  // First word should start with uppercase letter
  if (!/^[A-ZÀ-ÖØ-Ý]/.test(words[0])) return false;

  return true;
}

/**
 * Normalize guest names for deduplication.
 * "Dr Stephen Seiler" and "Professor Stephen Seiler" → "Stephen Seiler"
 */
const NAME_ALIASES: Record<string, string> = {
  "Dr Stephen Seiler": "Stephen Seiler",
  "Professor Stephen Seiler": "Stephen Seiler",
  "Prof Seiler": "Stephen Seiler",
  "Prof Tim Spector": "Tim Spector",
  "Dr Berry": "Dr Ken Berry",
  "Dr Gordan": "Dr Mark Gordon",
  "Dr Gervais": "Dr Michael Gervais",
  "Dr Lim": "Dr Allen Lim",
  "Dr Pruitt": "Dr Andy Pruitt",
  "Dowsett": "Alex Dowsett",
  "Hincapie": "George Hincapie",
  "Brownlee": "Alistair Brownlee",
  "Matthews": "Michael Matthews",
  "Bottas": "Valtteri Bottas",
  "Mads W": "Mads Wurtz Schmidt",
  "Lachlan Morton": "Lachlan Morton",
  '"Lachlan Morton"': "Lachlan Morton",
  '"Professor Stephen Seiler"': "Stephen Seiler",
  "Aron D": "Aron D'Souza",
  "Dr David Dunne": "David Dunne",
  "Dr Sam Impey": "Sam Impey",
  "Jack Ultra Cyclist": "Jack Thompson",
  "Trek Segafredo Star Taylor Wiles": "Tayler Wiles",
  "Dr Gordon Laing": "Dr Mark Gordon",
};

/** Known credentials for guests (enrichment data) */
const KNOWN_CREDENTIALS: Record<string, string> = {
  "Stephen Seiler": "Exercise physiologist, polarised training pioneer",
  "Cory Williams": "L39ION of Los Angeles co-founder, US criterium champion",
  "Derek Teel": "Founder of Dialed Health, S&C coach for cyclists",
  "Greg LeMond": "Three-time Tour de France winner",
  "Laurens Ten Dam": "Professional cyclist, GC rider turned gravel racer",
  "Alan Murchison": "Michelin-star chef turned sports nutritionist",
  "Alex Dowsett": "Former Hour Record holder, time trial specialist",
  "Alex Howes": "EF Education pro cyclist, alt-racing pioneer",
  "Alex Larson": "Registered dietitian for endurance athletes",
  "Alexey Vermeulen": "Former WorldTour rider, professional gravel racer",
  "Alistair Brownlee": "Olympic triathlon gold medallist",
  "André Greipel": "Grand Tour sprint legend, 22 Grand Tour stage wins",
  "Andy McGrath": "Cycling journalist, author of Lanterne Rouge",
  "Aron D'Souza": "Founder of the Enhanced Games",
  "Ben Hoffman": "Professional triathlete, Ironman podium finisher",
  "Brian Smith": "Former British pro cyclist, Olympic road racer",
  "Chris Kresser": "Functional medicine practitioner, author",
  "Chris Voss": "Former FBI lead negotiator, author of Never Split the Difference",
  "Colin O Brady": "Endurance athlete, first solo Antarctic crossing",
  "Courtney Conley": "Foot health specialist, founder of Gait Happens",
  "Cynthia Thurlow": "Intermittent fasting expert, nurse practitioner",
  "Dan Bigham": "Former Hour Record holder, Head of Engineering at Red Bull-Bora-Hansgrohe",
  "Dan Lorang": "Head of Performance, Red Bull–Bora–Hansgrohe",
  "David Gillick": "European indoor 400m champion",
  "Dr Allen Lim": "Sports physiologist, founder of Skratch Labs",
  "Dr Andy Pruitt": "Pioneering bike fit expert, founder of Boulder Center for Sports Medicine",
  "Dr David Dunne": "Sports scientist, World Tour nutritionist",
  "David Dunne": "Sports scientist, World Tour nutritionist",
  "Dr Sam Impey": "Sports nutritionist, World Tour performance researcher",
  "Sam Impey": "Sports nutritionist, World Tour performance researcher",
  "Tim Podlogar": "Sports nutritionist, carbohydrate metabolism researcher",
  "Dr David Lipman": "Sports physician, exercise science researcher",
  "Dr Ken Berry": "Family physician, carnivore diet advocate",
  "Dr Mark Gordon": "Endocrinologist, hormone and TBI specialist",
  "Dr Michael Gervais": "High-performance psychologist, host of Finding Mastery",
  "Ed Clancy": "Olympic gold medallist, team pursuit",
  "Eddie Dunbar": "Irish pro cyclist, Jayco-AlUla",
  "Erin Ayala": "Sport psychologist, mental performance consultant",
  "Gareth Joyce": "CEO of Wahoo Fitness",
  "Geneviève Jeanson": "Former pro cyclist",
  "George Hincapie": "17x Tour de France starter, team leader",
  "Ger Remond": "Irish cycling coach",
  "Hannah Grant": "Pro team chef, The Grand Tour Cookbook",
  "Hannah Otto": "Ultra-endurance cyclist, Transcontinental Race winner",
  "Jack Burke": "Irish cyclist, author of How To Become A Pro Cyclist",
  "Jack Thompson": "Ultra-endurance cyclist, Guinness World Record holder",
  "James Golding": "Ultra-endurance cyclist, two-time cancer survivor",
  "Joe Friel": "Author of The Cyclist's Training Bible",
  "John Archibald": "British track cyclist, pursuit specialist",
  "John Wakefield": "Director of Coaching & Sports Science, Red Bull–Bora–Hansgrohe",
  "Jonas Abrahamsen": "Uno-X pro cyclist, KOM jersey holder",
  "Josh Amberger": "Professional Ironman triathlete",
  "Lachlan Morton": "EF Education pro cyclist, alt-racing pioneer",
  "Mads Wurtz Schmidt": "Danish pro cyclist, former WorldTour rider turned gravel racer",
  "Mark Beaumont": "Around the World in 78 Days cycling record holder",
  "Mark Sisson": "Endurance athlete, Primal Blueprint founder",
  "Matt Beers": "Professional MTB and gravel racer",
  "Matt Bottrill": "UK time trial champion, cycling coach",
  "Michael Matthews": "Professional cyclist, stage race winner",
  "Mick Clohisey": "Irish Olympic marathon runner",
  "Olav Bu": "Norwegian cycling physiologist, Uno-X performance lead",
  "Owen Vermeulen": "Professional gravel cyclist, addiction recovery advocate",
  "Rosa Klöser": "Professional gravel racer, Unbound 200 winner",
  "Sean Landers": "Irish cyclist, road safety campaigner",
  "Shannon Malseed": "Professional cyclist, Australian national team",
  "Sofiane Sehili": "Ultra-endurance cyclist, bikepacking record holder",
  "Tayler Wiles": "Former Trek-Segafredo pro cyclist",
  "Tim Spector": "Professor of genetic epidemiology, ZOE founder",
  "Uli Schoberer": "Inventor of the SRM power meter",
  "Valtteri Bottas": "F1 driver, keen cyclist",
  "Vasilis Anastopoulos": "WorldTour performance coach, formerly Astana and Quick-Step",
  "Yanto Barker": "Former British road race champion, Le Col founder",
};

/**
 * Authoritative pillar classification for each guest.
 * Based on WHO they are, not which episodes they appeared on.
 */
const GUEST_PILLAR_MAP: Record<string, ContentPillar> = {
  // Coaching — coaches, exercise physiologists, sports scientists
  "Stephen Seiler": "coaching",
  "Dan Lorang": "coaching",
  "Joe Friel": "coaching",
  "Matt Bottrill": "coaching",
  "Olav Bu": "coaching",
  "Ger Remond": "coaching",
  "Vasilis Anastopoulos": "coaching",
  "John Wakefield": "coaching",
  "Dr David Lipman": "coaching",

  // Nutrition — nutritionists, chefs, diet experts
  "Alan Murchison": "nutrition",
  "Hannah Grant": "nutrition",
  "Tim Spector": "nutrition",
  "Cynthia Thurlow": "nutrition",
  "Chris Kresser": "nutrition",
  "Mark Sisson": "nutrition",
  "Dr Allen Lim": "nutrition",
  "Dr Ken Berry": "nutrition",
  "Alex Larson": "nutrition",
  "Dr David Dunne": "nutrition",
  "David Dunne": "nutrition",
  "Sam Impey": "nutrition",
  "Dr Sam Impey": "nutrition",
  "Tim Podlogar": "nutrition",

  // Strength — S&C, physio, bike fitting
  "Derek Teel": "strength",
  "Courtney Conley": "strength",
  "Dr Andy Pruitt": "strength",

  // Recovery — psychology, mindset, wellness, hormones
  "Chris Voss": "recovery",
  "Dr Michael Gervais": "recovery",
  "Erin Ayala": "recovery",
  "Dr Mark Gordon": "recovery",

  // Le Metier — pro riders, journalists, ultra-endurance, culture, crossover athletes
  "Greg LeMond": "le-metier",
  "Lachlan Morton": "le-metier",
  "Alex Dowsett": "le-metier",
  "Alex Howes": "le-metier",
  "André Greipel": "le-metier",
  "George Hincapie": "le-metier",
  "Ed Clancy": "le-metier",
  "Eddie Dunbar": "le-metier",
  "Dan Bigham": "le-metier",
  "Jonas Abrahamsen": "le-metier",
  "Michael Matthews": "le-metier",
  "John Archibald": "le-metier",
  "Laurens Ten Dam": "le-metier",
  "Brian Smith": "le-metier",
  "Geneviève Jeanson": "le-metier",
  "Shannon Malseed": "le-metier",
  "Rosa Klöser": "le-metier",
  "Mads Wurtz Schmidt": "le-metier",
  "Cory Williams": "le-metier",
  "Alexey Vermeulen": "le-metier",
  "Tayler Wiles": "le-metier",
  "Hannah Otto": "le-metier",
  "Sofiane Sehili": "le-metier",
  "Colin O Brady": "le-metier",
  "Mark Beaumont": "le-metier",
  "Matt Beers": "le-metier",
  "Jack Burke": "le-metier",
  "Jack Thompson": "le-metier",
  "James Golding": "le-metier",
  "Owen Vermeulen": "le-metier",
  "Sean Landers": "le-metier",
  "Andy McGrath": "le-metier",
  "Yanto Barker": "le-metier",
  "Uli Schoberer": "le-metier",
  "Gareth Joyce": "le-metier",
  "Aron D'Souza": "le-metier",
  "Alistair Brownlee": "le-metier",
  "Valtteri Bottas": "le-metier",
  "David Gillick": "le-metier",
  "Ben Hoffman": "le-metier",
  "Mick Clohisey": "le-metier",
  "Josh Amberger": "le-metier",
};

/**
 * Prominence weighting for guest sort order.
 * Higher = appears earlier in the list. Unweighted guests default to 0.
 */
const GUEST_PROMINENCE: Record<string, number> = {
  // Tier 1 — Household names, Tour winners, Olympic champions
  "Greg LeMond": 100,
  "Stephen Seiler": 95,
  "Dan Lorang": 90,
  "Lachlan Morton": 88,
  "Alistair Brownlee": 85,
  "Valtteri Bottas": 83,
  "Dan Bigham": 80,
  "Joe Friel": 78,
  "André Greipel": 76,
  "George Hincapie": 75,
  "Alex Dowsett": 74,
  "Ed Clancy": 73,
  "Tim Spector": 72,

  // Tier 2 — Well-known in cycling world
  "John Wakefield": 60,
  "Olav Bu": 58,
  "Hannah Grant": 56,
  "Mark Beaumont": 55,
  "Colin O Brady": 54,
  "Eddie Dunbar": 53,
  "Michael Matthews": 52,
  "Jonas Abrahamsen": 51,
  "Dr Allen Lim": 50,
  "Dr Michael Gervais": 49,
  "Matt Bottrill": 48,
  "Andy McGrath": 47,
  "Yanto Barker": 46,
  "Laurens Ten Dam": 45,
  "Uli Schoberer": 44,

  // Tier 3 — Notable guests
  "Chris Voss": 35,
  "Hannah Otto": 34,
  "Sofiane Sehili": 33,
  "Brian Smith": 32,
  "Dr Andy Pruitt": 31,
  "Mark Sisson": 30,
  "Vasilis Anastopoulos": 29,
  "Alan Murchison": 28,
  "Derek Teel": 27,
  "Cory Williams": 26,
};

/**
 * Tags for cross-cutting categories that don't map to pillars.
 */
const GUEST_TAGS: Record<string, GuestTag[]> = {
  // Triathlon
  "Alistair Brownlee": ["triathlon"],
  "Ben Hoffman": ["triathlon"],
  "Josh Amberger": ["triathlon"],

  // Ultra-endurance
  "Lachlan Morton": ["ultra-endurance", "pro-rider"],
  "Colin O Brady": ["ultra-endurance"],
  "Mark Beaumont": ["ultra-endurance"],
  "Hannah Otto": ["ultra-endurance"],
  "Sofiane Sehili": ["ultra-endurance"],
  "Jack Thompson": ["ultra-endurance"],
  "James Golding": ["ultra-endurance"],
  "Owen Vermeulen": ["ultra-endurance"],

  // Pro riders
  "Greg LeMond": ["pro-rider"],
  "Alex Dowsett": ["pro-rider"],
  "André Greipel": ["pro-rider"],
  "George Hincapie": ["pro-rider"],
  "Ed Clancy": ["pro-rider"],
  "Eddie Dunbar": ["pro-rider"],
  "Dan Bigham": ["pro-rider"],
  "Jonas Abrahamsen": ["pro-rider"],
  "Michael Matthews": ["pro-rider"],
  "Laurens Ten Dam": ["pro-rider"],
  "Brian Smith": ["pro-rider"],
  "Shannon Malseed": ["pro-rider"],
  "Rosa Klöser": ["pro-rider"],
  "Mads Wurtz Schmidt": ["pro-rider"],
  "Cory Williams": ["pro-rider"],
  "Alexey Vermeulen": ["pro-rider"],
  "Tayler Wiles": ["pro-rider"],
  "John Archibald": ["pro-rider"],
  "Geneviève Jeanson": ["pro-rider"],
  "Matt Beers": ["pro-rider"],

  // Science / research
  "Stephen Seiler": ["science"],
  "Tim Spector": ["science"],
  "Olav Bu": ["science", "triathlon"],
  "Dr Allen Lim": ["science"],
  "Dr Michael Gervais": ["science"],
  "Dr Mark Gordon": ["science"],
  "David Dunne": ["science"],
  "Sam Impey": ["science"],
  "Tim Podlogar": ["science"],

  // Industry
  "Uli Schoberer": ["industry"],
  "Gareth Joyce": ["industry"],
  "Yanto Barker": ["industry"],
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeName(name: string): string {
  // Strip surrounding quotes
  const cleaned = name.replace(/^["']|["']$/g, "").trim();
  return NAME_ALIASES[cleaned] || NAME_ALIASES[name] || cleaned;
}

export function getAllGuests(): GuestProfile[] {
  const episodes = getAllEpisodes();
  const guestMap = new Map<string, GuestProfile>();

  for (const ep of episodes) {
    if (!ep.guest) continue;

    const rawName = ep.guest.trim();
    if (!rawName) continue;

    const normalizedName = normalizeName(rawName);
    if (!isLikelyPersonName(normalizedName)) continue;

    // Use authoritative pillar from GUEST_PILLAR_MAP, fall back to episode pillar
    const guestPillar = GUEST_PILLAR_MAP[normalizedName] || ep.pillar;

    const existing = guestMap.get(normalizedName);
    if (existing) {
      existing.episodeCount++;
      existing.episodes.push(ep);
      if (
        new Date(ep.publishDate) > new Date(existing.latestAppearance)
      ) {
        existing.latestAppearance = ep.publishDate;
      }
      if (
        new Date(ep.publishDate) < new Date(existing.firstAppearance)
      ) {
        existing.firstAppearance = ep.publishDate;
      }
      // Pick up credential if we have it now
      if (ep.guestCredential && !existing.credential) {
        existing.credential = ep.guestCredential;
      }
    } else {
      guestMap.set(normalizedName, {
        name: normalizedName,
        slug: slugify(normalizedName),
        credential:
          KNOWN_CREDENTIALS[normalizedName] ||
          ep.guestCredential ||
          undefined,
        episodeCount: 1,
        episodes: [ep],
        pillars: [guestPillar],
        tags: GUEST_TAGS[normalizedName] || [],
        latestAppearance: ep.publishDate,
        firstAppearance: ep.publishDate,
      });
    }
  }

  // Sort by prominence (featured guests first), then episode count, then alphabetically
  return Array.from(guestMap.values()).sort((a, b) => {
    const aWeight = GUEST_PROMINENCE[a.name] || 0;
    const bWeight = GUEST_PROMINENCE[b.name] || 0;
    if (bWeight !== aWeight) return bWeight - aWeight;
    if (b.episodeCount !== a.episodeCount)
      return b.episodeCount - a.episodeCount;
    return a.name.localeCompare(b.name);
  });
}

export function getGuestBySlug(slug: string): GuestProfile | null {
  return getAllGuests().find((g) => g.slug === slug) || null;
}

export function getAllGuestSlugs(): string[] {
  return getAllGuests().map((g) => g.slug);
}
