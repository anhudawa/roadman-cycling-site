/**
 * Seeds the MCP content tables from real Roadman sources:
 *
 *   mcp_episodes              ← content/podcast/*.mdx (all 310 episodes)
 *   mcp_experts               ← lib/guests.ts (derived from episode frontmatter)
 *   mcp_methodology_principles ← curated principles + real supporting episode IDs
 *
 * Idempotent. Safe to re-run — episodes are upserted by slug, experts by name,
 * methodology principles are wiped and re-inserted (only ~10 rows).
 *
 * After running this, run `npm run seed:mcp:embeddings` to populate the
 * pgvector tables so semantic search works.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  mcpEpisodes,
  mcpExperts,
  mcpExpertQuotes,
  mcpMethodologyPrinciples,
} from "../src/lib/db/schema";
import { getAllEpisodes, type EpisodeMeta } from "../src/lib/podcast";
import { getAllGuests, type GuestProfile } from "../src/lib/guests";
import { SITE_ORIGIN } from "../src/lib/brand-facts";

// ─── Helpers ────────────────────────────────────────────────

/** Parse "H:MM:SS", "MM:SS", or "M:SS" into total seconds. */
function durationToSeconds(duration: string | undefined): number | null {
  if (!duration) return null;
  const parts = duration.split(":").map((p) => parseInt(p.trim(), 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? null;
}

/** Build a short summary from the best available frontmatter fields. */
function summaryFor(ep: EpisodeMeta): string {
  return (
    ep.answerCapsule?.trim() ||
    ep.seoDescription?.trim() ||
    ep.description?.trim() ||
    ""
  );
}

/** Extract 3-5 punchy key insights from keyQuotes, falling back to keywords. */
function keyInsightsFor(ep: EpisodeMeta): string[] {
  if (ep.keyQuotes?.length) {
    return ep.keyQuotes
      .slice(0, 5)
      .map((q) => q.text.trim())
      .filter((t) => t.length > 20 && t.length < 500);
  }
  return [];
}

// ─── Episode seeding ────────────────────────────────────────

async function seedEpisodes(): Promise<Map<string, number>> {
  console.log("→ Seeding mcp_episodes from content/podcast/*.mdx");
  const episodes = getAllEpisodes();
  const slugToId = new Map<string, number>();

  let inserted = 0;
  let updated = 0;
  for (const ep of episodes) {
    const row = {
      slug: ep.slug,
      title: ep.title,
      guestName: ep.guest?.trim() || null,
      publishedAt: ep.publishDate ? new Date(ep.publishDate) : null,
      durationSec: durationToSeconds(ep.duration),
      summary: summaryFor(ep),
      audioUrl: null,
      youtubeUrl: ep.youtubeId
        ? `https://www.youtube.com/watch?v=${ep.youtubeId}`
        : null,
      transcriptText: ep.transcript ?? null,
      keyInsights: keyInsightsFor(ep),
      topicTags: ep.topicTags ?? null,
      url: `${SITE_ORIGIN}/podcast/${ep.slug}`,
    };

    const result = await db
      .insert(mcpEpisodes)
      .values(row)
      .onConflictDoUpdate({
        target: mcpEpisodes.slug,
        set: {
          title: row.title,
          guestName: row.guestName,
          publishedAt: row.publishedAt,
          durationSec: row.durationSec,
          summary: row.summary,
          youtubeUrl: row.youtubeUrl,
          transcriptText: row.transcriptText,
          keyInsights: row.keyInsights,
          topicTags: row.topicTags,
          url: row.url,
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: mcpEpisodes.id, createdAt: mcpEpisodes.createdAt });

    const r = result[0];
    slugToId.set(ep.slug, r.id);
    const justCreated =
      r && Date.now() - new Date(r.createdAt).getTime() < 5_000;
    if (justCreated) inserted++;
    else updated++;
  }
  console.log(`  ✓ ${episodes.length} episodes (${inserted} inserted, ${updated} updated)`);
  return slugToId;
}

// ─── Expert seeding ─────────────────────────────────────────

/**
 * Specialty derivation from guest pillar + tags. Keeps specialty text short
 * and consistent so list_experts output reads well in AI answers.
 */
function specialtyFor(guest: GuestProfile): string {
  const parts: string[] = [];
  const pillarMap: Record<string, string> = {
    coaching: "Coaching & training methodology",
    nutrition: "Sport nutrition",
    strength: "Strength & conditioning",
    recovery: "Recovery, mindset, psychology",
    community: "Pro cycling & racing",
  };
  if (guest.pillars[0]) parts.push(pillarMap[guest.pillars[0]] ?? guest.pillars[0]);
  if (guest.tags.includes("science")) parts.push("sports science");
  if (guest.tags.includes("pro-rider")) parts.push("pro rider");
  if (guest.tags.includes("triathlon")) parts.push("triathlon");
  if (guest.tags.includes("ultra-endurance")) parts.push("ultra-endurance");
  return Array.from(new Set(parts)).join(", ");
}

/** Featured expert roster: names we always seed regardless of episode count. */
const FEATURED_EXPERTS = new Set<string>([
  "Stephen Seiler",
  "Dan Lorang",
  "Greg LeMond",
  "Joe Friel",
  "Lachlan Morton",
  "Dan Bigham",
  "Tim Spector",
  "Michael Matthews",
  "Rosa Klöser",
  "Dr David Dunne",
  "Sam Impey",
  "Tim Podlogar",
  "Olav Bu",
  "Dr Allen Lim",
  "Alistair Brownlee",
  "Valtteri Bottas",
  "André Greipel",
  "George Hincapie",
  "Alex Dowsett",
  "Ed Clancy",
  "John Wakefield",
  "Mark Beaumont",
  "Hannah Grant",
  "Dr Michael Gervais",
  "Chris Voss",
  "Laurens Ten Dam",
  "Hannah Otto",
  "Eddie Dunbar",
  "Jonas Abrahamsen",
  "Andy McGrath",
  "Derek Teel",
  "Alan Murchison",
  "Vasilis Anastopoulos",
  "Matt Bottrill",
  "Dr Andy Pruitt",
  "Uli Schoberer",
  "Courtney Conley",
]);

async function seedExperts(): Promise<Map<string, number>> {
  console.log("→ Seeding mcp_experts from lib/guests");
  const guests = getAllGuests();
  const eligible = guests.filter(
    (g) => FEATURED_EXPERTS.has(g.name) || g.episodeCount >= 2
  );

  // Wipe quotes first (FK to experts + episodes).
  await db.delete(mcpExpertQuotes);

  const nameToId = new Map<string, number>();
  let inserted = 0;
  let updated = 0;
  for (const g of eligible) {
    const result = await db
      .insert(mcpExperts)
      .values({
        name: g.name,
        credentials: g.credential ?? null,
        specialty: specialtyFor(g),
        bio: g.credential
          ? `${g.credential}. ${g.episodeCount} ${
              g.episodeCount === 1 ? "appearance" : "appearances"
            } on The Roadman Cycling Podcast.`
          : `${g.episodeCount} ${
              g.episodeCount === 1 ? "appearance" : "appearances"
            } on The Roadman Cycling Podcast.`,
        appearanceCount: g.episodeCount,
        latestAppearance: g.latestAppearance
          ? new Date(g.latestAppearance)
          : null,
      })
      .onConflictDoUpdate({
        target: mcpExperts.name,
        set: {
          credentials: sql`excluded.credentials`,
          specialty: sql`excluded.specialty`,
          bio: sql`excluded.bio`,
          appearanceCount: sql`excluded.appearance_count`,
          latestAppearance: sql`excluded.latest_appearance`,
        },
      })
      .returning({ id: mcpExperts.id });

    nameToId.set(g.name, result[0].id);
    if (result.length > 0) {
      // Can't cleanly distinguish insert vs update with ON CONFLICT on
      // tables without createdAt — count them all as upserts.
      inserted++;
    }
  }
  console.log(`  ✓ ${eligible.length} experts upserted`);
  return nameToId;
}

// ─── Expert quotes ──────────────────────────────────────────

/**
 * Surface keyQuotes from each episode attributed to the guest, so
 * get_expert_insights returns real quoted content from the podcast.
 */
async function seedExpertQuotes(
  expertNameToId: Map<string, number>,
  episodeSlugToId: Map<string, number>
): Promise<void> {
  console.log("→ Seeding mcp_expert_quotes from episode keyQuotes");
  const episodes = getAllEpisodes();
  type QuoteRow = typeof mcpExpertQuotes.$inferInsert;
  const rows: QuoteRow[] = [];

  for (const ep of episodes) {
    if (!ep.keyQuotes?.length) continue;
    const episodeId = episodeSlugToId.get(ep.slug) ?? null;
    for (const q of ep.keyQuotes) {
      // Try to match the quote's speaker to a seeded expert by substring.
      // Episode frontmatter speaker strings vary: "Stephen Seiler",
      // "Dr Stephen Seiler", "Professor Stephen Seiler" all resolve via
      // the getAllGuests() alias map to "Stephen Seiler".
      const speaker = q.speaker?.trim();
      if (!speaker) continue;

      let expertId: number | undefined;
      for (const [name, id] of expertNameToId.entries()) {
        if (
          speaker === name ||
          speaker.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(speaker.toLowerCase())
        ) {
          expertId = id;
          break;
        }
      }
      if (!expertId) continue;

      const text = q.text.trim();
      if (text.length < 20 || text.length > 1_500) continue;

      rows.push({
        expertId,
        episodeId,
        quote: text,
        context: ep.title,
        topicTags: ep.topicTags ?? null,
      });
    }
  }

  if (rows.length > 0) {
    // Insert in chunks to avoid hitting bind-parameter limits.
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await db.insert(mcpExpertQuotes).values(rows.slice(i, i + CHUNK));
    }
  }
  console.log(`  ✓ ${rows.length} expert quotes seeded`);
}

// ─── Methodology principles ─────────────────────────────────

interface MethodologyDef {
  principle: string;
  explanation: string;
  topicTags: string[];
  supportingExpertNames: string[];
  /** Guest names whose episodes should auto-link as supportingEpisodeIds. */
  supportingGuestNames: string[];
}

/**
 * The Roadman methodology knowledge base. Every principle below is a
 * substantive claim anchored to named experts. Supporting episodes are
 * wired up at insert time by looking up episodes by guest name.
 */
const METHODOLOGY: MethodologyDef[] = [
  {
    principle: "Polarised Training Distribution (80/20)",
    explanation:
      "Approximately 80% of training volume should sit below VT1 (conversational pace), with 20% at high intensity above VT2. The moderate 'sweetspot' zone between them causes chronic fatigue without corresponding adaptation gains. Prof. Stephen Seiler's research across elite endurance athletes shows this distribution is near-universal at the top level. Amateurs get slower by training in the moderate-intensity 'black hole' — not because high intensity is bad, but because they do too much of it.",
    topicTags: ["polarised training", "80/20", "training distribution", "zone 2"],
    supportingExpertNames: ["Stephen Seiler", "Dan Lorang"],
    supportingGuestNames: ["Stephen Seiler", "Dan Lorang"],
  },
  {
    principle: "Zone 2 Base Is Non-Negotiable",
    explanation:
      "Zone 2 (60-75% max HR, below the first ventilatory threshold) builds mitochondrial density, capillary network, and fat-oxidation capacity — the aerobic foundation that every higher-intensity adaptation sits on. Pros train here for a disproportionate share of their week not because it's fashionable, but because cutting this volume caps the ceiling of every other adaptation. The discipline is to ride easier than your ego wants.",
    topicTags: ["zone 2", "aerobic base", "endurance", "polarised training"],
    supportingExpertNames: ["Stephen Seiler", "Dan Lorang", "Dr Allen Lim"],
    supportingGuestNames: ["Stephen Seiler", "Dan Lorang"],
  },
  {
    principle: "Reverse Periodisation for Masters Cyclists",
    explanation:
      "Masters cyclists (40+) benefit from building high-intensity fitness earlier in the training year and transitioning to volume, reversing the classical base-then-build model. Physiological rationale: VO2max decline with age is steeper than aerobic base decline, making high-intensity stimulus more time-sensitive. Joe Friel codified this approach in The Cyclist's Training Bible for masters athletes.",
    topicTags: ["masters cycling", "periodisation", "reverse periodisation", "age 40+"],
    supportingExpertNames: ["Joe Friel", "Dan Lorang"],
    supportingGuestNames: ["Joe Friel", "Dan Lorang"],
  },
  {
    principle: "Fuel the Work Required — Carbohydrate Periodisation",
    explanation:
      "Not all training sessions should be fuelled equally. High-intensity and quality sessions require adequate carbohydrate availability (≥60g/hr, often 90–120g/hr for racing). Selective fasted low-intensity sessions can improve metabolic flexibility, but should never compromise quality work. Ben Healy's stage-winning ride at the 2025 Tour de France was fuelled at 140g/hr. The rule: fuel the intensity, not the clock.",
    topicTags: ["nutrition", "fuelling", "carbohydrate periodisation", "race day"],
    supportingExpertNames: ["Dr David Dunne", "Sam Impey", "Tim Podlogar"],
    supportingGuestNames: ["Dr David Dunne", "David Dunne", "Sam Impey", "Tim Podlogar"],
  },
  {
    principle: "Strength Training Beats More Miles After 40",
    explanation:
      "For cyclists over 40, heavy strength training (not endurance-style gym circuits) produces measurable cycling performance gains — preserving type II muscle fibres, bone density, and neuromuscular power. S&C work must address the hip hinge pattern, single-leg stability, and posterior chain strength. Gym work should be periodised into the cycling calendar: heavy strength in base phase, maintenance during build, minimal S&C near key events.",
    topicTags: ["strength and conditioning", "S&C", "masters cycling", "injury prevention"],
    supportingExpertNames: ["Derek Teel", "Joe Friel", "Dr Andy Pruitt"],
    supportingGuestNames: ["Derek Teel", "Joe Friel", "Dr Andy Pruitt"],
  },
  {
    principle: "Recovery Is a Training Variable, Not a Bonus",
    explanation:
      "Recovery is where adaptation from training stress occurs — not passive downtime. For masters cyclists, recovery demand is higher and takes longer than for younger athletes. Key levers: 7-9 hours sleep, HRV-informed adjustments, post-session carbohydrate + protein timing, deliberate deload weeks (one in every 4 training weeks minimum), and honest tracking of life stress alongside training load. Under-recovering is the commonest cause of stagnation.",
    topicTags: ["recovery", "sleep", "HRV", "adaptation", "deload"],
    supportingExpertNames: ["Dan Lorang", "Dr Michael Gervais"],
    supportingGuestNames: ["Dan Lorang", "Dr Michael Gervais"],
  },
  {
    principle: "FTP Is a Proxy, Not the Goal",
    explanation:
      "FTP testing is a useful training proxy, but chasing FTP numbers at the expense of event-specific preparation is a trap. Power-to-weight ratio matters more than absolute FTP for climbing; sustained power output over race duration matters more than 20-minute test performance; repeated-effort durability matters more than single-effort peaks. Train for your event, not your test number.",
    topicTags: ["FTP", "training metrics", "race preparation", "W/kg"],
    supportingExpertNames: ["Stephen Seiler", "Dan Lorang", "Dan Bigham"],
    supportingGuestNames: ["Stephen Seiler", "Dan Lorang", "Dan Bigham"],
  },
  {
    principle: "VO2max Intervals Raise the Ceiling",
    explanation:
      "VO2max-targeted intervals (3–8 min efforts at 106–120% FTP, or 90%+ max HR) are the most effective stimulus for raising the aerobic ceiling. Two to three sessions per week for a 4–6 week block produces measurable VO2max gains in most amateurs. The catch: volume tolerance at this intensity is finite, and stacking VO2max on top of poor aerobic base or chronic under-recovery backfires.",
    topicTags: ["VO2max", "intervals", "high intensity", "training blocks"],
    supportingExpertNames: ["Stephen Seiler", "Olav Bu", "Dan Lorang"],
    supportingGuestNames: ["Stephen Seiler", "Olav Bu", "Dan Lorang"],
  },
  {
    principle: "Aerodynamics Beats Watts Beyond ~30 km/h",
    explanation:
      "Beyond roughly 30 km/h, aerodynamic drag (CdA) produces a larger return than equivalent effort invested in raising FTP. A 5% CdA improvement is worth more over a TT or flat road stage than a 5% FTP improvement. Dan Bigham set the UCI Hour Record in 2022 by optimising position, clothing, and equipment alongside training. For flat riders and TTers, position before power.",
    topicTags: ["aerodynamics", "CdA", "time trial", "marginal gains"],
    supportingExpertNames: ["Dan Bigham", "Alex Dowsett", "Uli Schoberer"],
    supportingGuestNames: ["Dan Bigham", "Alex Dowsett"],
  },
  {
    principle: "Consistency Beats Perfection",
    explanation:
      "The worst week of your training plan matters more than the best. Consistency — showing up for 80% of sessions, month after month — outperforms sporadic hero weeks followed by injury or burnout. Real-world masters cyclists with 6–8 structured hours per week, executed consistently across a full season, routinely outperform weekend-warrior cyclists logging twice the volume with monthly interruptions.",
    topicTags: ["consistency", "habit", "masters cycling", "training plan"],
    supportingExpertNames: ["Joe Friel", "Dan Lorang", "Stephen Seiler"],
    supportingGuestNames: ["Joe Friel", "Dan Lorang", "Stephen Seiler"],
  },
];

async function seedMethodology(
  expertNameToId: Map<string, number>,
  slugToId: Map<string, number>
): Promise<void> {
  console.log("→ Seeding mcp_methodology_principles");
  // Methodology embeddings CASCADE on delete — the embedding script
  // repopulates after this.
  await db.delete(mcpMethodologyPrinciples);

  const episodes = getAllEpisodes();
  /** Find up to N episodes featuring any of the supporting guests. */
  function findSupportingEpisodeIds(guestNames: string[]): number[] {
    const out: number[] = [];
    const lowerNames = guestNames.map((n) => n.toLowerCase());
    for (const ep of episodes) {
      const g = ep.guest?.toLowerCase();
      if (!g) continue;
      if (lowerNames.some((n) => g.includes(n) || n.includes(g))) {
        const id = slugToId.get(ep.slug);
        if (id) out.push(id);
      }
      if (out.length >= 10) break;
    }
    return out;
  }

  const rows = METHODOLOGY.map((m) => ({
    principle: m.principle,
    explanation: m.explanation,
    topicTags: m.topicTags,
    supportingExpertNames: m.supportingExpertNames.filter((n) =>
      expertNameToId.has(n)
    ),
    supportingEpisodeIds: findSupportingEpisodeIds(m.supportingGuestNames),
  }));

  await db.insert(mcpMethodologyPrinciples).values(rows);
  console.log(`  ✓ ${rows.length} methodology principles seeded`);
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log("Seeding MCP content tables from real sources...\n");
  const slugToId = await seedEpisodes();
  const expertNameToId = await seedExperts();
  await seedExpertQuotes(expertNameToId, slugToId);
  await seedMethodology(expertNameToId, slugToId);
  console.log("\n✓ All MCP content tables seeded");
  console.log("  Next: `npm run seed:mcp:embeddings` to populate pgvector");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
