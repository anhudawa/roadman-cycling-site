import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import { type ContentPillar } from "@/types";

export interface GuestProfile {
  name: string;
  slug: string;
  credential?: string;
  episodeCount: number;
  episodes: EpisodeMeta[];
  pillars: ContentPillar[];
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
  "Dr Gordan": "Dr Gordon Laing",
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
  "Jack Ultra Cyclist": "Jack Thompson",
};

/** Known credentials for guests (enrichment data) */
const KNOWN_CREDENTIALS: Record<string, string> = {
  "Lachlan Morton": "EF Education pro cyclist, alt-racing pioneer",
  "Stephen Seiler": "Exercise physiologist, polarised training pioneer",
  "Greg LeMond": "Three-time Tour de France winner",
  "Dan Bigham": "Hour Record holder, Ineos Grenadiers performance engineer",
  "Joe Friel": "Author of The Cyclist's Training Bible",
  "Dan Lorang": "Head of Performance, Red Bull Bora-Hansgrohe",
  "Ed Clancy": "Olympic gold medallist, team pursuit",
  "Alex Dowsett": "Hour Record holder, time trial specialist",
  "George Hincapie": "17x Tour de France finisher, team leader",
  "André Greipel": "Grand Tour sprint legend, 22 Grand Tour stage wins",
  "Hannah Grant": "Pro team chef, The Grand Tour Cookbook",
  "Mark Beaumont": "Around the World in 80 Days cycling record holder",
  "Laurens Ten Dam": "Professional cyclist, GC rider turned gravel racer",
  "Eddie Dunbar": "Irish pro cyclist, Jayco-AlUla",
  "Jonas Abrahamsen": "Uno-X pro cyclist, KOM jersey holder",
  "Alex Howes": "EF Education pro cyclist, alt-racing pioneer",
  "Colin O Brady": "Endurance athlete, first solo Antarctic crossing",
  "Chris Voss": "Former FBI lead negotiator, author of Never Split the Difference",
  "Alan Murchison": "Michelin star chef turned sports nutritionist",
  "Matt Bottrill": "UK time trial champion, cycling coach",
  "Chris Kresser": "Functional medicine practitioner, author",
  "Tim Spector": "Professor of genetic epidemiology, ZOE founder",
  "John Archibald": "British track cyclist, pursuit specialist",
  "David Gillick": "European indoor 400m champion",
  "Alistair Brownlee": "Olympic triathlon gold medallist",
  "Valtteri Bottas": "F1 driver, keen cyclist",
  "Rosa Klöser": "Professional cyclist",
  "Geneviève Jeanson": "Former pro cyclist",
  "Shannon Malseed": "Professional cyclist, Australian national team",
  "Hannah Otto": "Ultra-endurance cyclist, Transcontinental Race winner",
  "Matt Beers": "Professional MTB and gravel racer",
  "Ben Hoffman": "Professional triathlete, Ironman podium finisher",
  "Mark Sisson": "Endurance athlete, Primal Blueprint founder",
  "Cynthia Thurlow": "Intermittent fasting expert, nurse practitioner",
  "Andy McGrath": "Cycling journalist, author of Lanterne Rouge",
  "Yanto Barker": "Former British road race champion, Le Col founder",
  "Brian Smith": "Former British pro cyclist, Olympic road racer",
  "Sofiane Sehili": "Ultra-endurance cyclist, Bikepacking record holder",
  "Uli Schoberer": "Inventor of the SRM power meter",
  "Olav Bu": "Norwegian cycling physiologist, Uno-X performance lead",
  "Michael Matthews": "Professional cyclist, stage race winner",
  "Mick Clohisey": "Irish Olympic marathon runner",
  "Ger Remond": "Irish cycling coach",
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

    const existing = guestMap.get(normalizedName);
    if (existing) {
      existing.episodeCount++;
      existing.episodes.push(ep);
      if (!existing.pillars.includes(ep.pillar)) {
        existing.pillars.push(ep.pillar);
      }
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
          ep.guestCredential ||
          KNOWN_CREDENTIALS[normalizedName] ||
          undefined,
        episodeCount: 1,
        episodes: [ep],
        pillars: [ep.pillar],
        latestAppearance: ep.publishDate,
        firstAppearance: ep.publishDate,
      });
    }
  }

  // Sort by episode count (most appearances first), then alphabetically
  return Array.from(guestMap.values()).sort((a, b) => {
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
