import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/lib/db";
import {
  mcpEpisodes,
  mcpExperts,
  mcpExpertQuotes,
  mcpMethodologyPrinciples,
} from "../src/lib/db/schema";

async function seedExperts() {
  await db.delete(mcpExpertQuotes);
  await db.delete(mcpExperts);

  await db.insert(mcpExperts).values([
    {
      name: "Prof. Stephen Seiler",
      credentials: "PhD, Professor of Sport Science, University of Agder",
      specialty: "Polarised training, endurance physiology",
      bio: "The researcher who established the science behind polarised training distribution. Coined the 80/20 rule for endurance athletes.",
      appearanceCount: 8,
      latestAppearance: new Date("2025-11-01"),
    },
    {
      name: "Dan Lorang",
      credentials: "Head of Performance, Red Bull–Bora–Hansgrohe",
      specialty: "Periodisation, World Tour coaching",
      bio: "Performance director behind Jan Frodeno and now the Red Bull–Bora–Hansgrohe WorldTour team.",
      appearanceCount: 5,
      latestAppearance: new Date("2025-09-01"),
    },
    {
      name: "Dr. David Dunne",
      credentials: "PhD Nutritional Science",
      specialty: "Sport nutrition, fuelling strategies",
      bio: "Performance nutritionist working with elite cyclists on race-day fuelling and body composition.",
      appearanceCount: 4,
      latestAppearance: new Date("2025-08-01"),
    },
    {
      name: "Joe Friel",
      credentials: "Author of The Cyclist's Training Bible",
      specialty: "Training periodisation for masters athletes",
      bio: "The coach who wrote the definitive training guide for cyclists, with specific expertise in masters (40+) performance.",
      appearanceCount: 3,
      latestAppearance: new Date("2025-06-01"),
    },
    {
      name: "Lachlan Morton",
      credentials: "Professional cyclist, EF Education-EasyPost",
      specialty: "Training philosophy, adventure cycling, endurance",
      bio: "Pro cyclist known for the Alt Tour, EF Pro Cycling, and a distinctive approach to training that blends elite performance with adventure.",
      appearanceCount: 2,
      latestAppearance: new Date("2025-04-01"),
    },
    {
      name: "Dan Bigham",
      credentials: "Former UCI Hour Record Holder",
      specialty: "Aerodynamics, marginal gains, data-driven training",
      bio: "Engineer and cyclist who set the UCI Hour Record in 2022. Expert in aerodynamic optimisation and performance data analysis.",
      appearanceCount: 2,
      latestAppearance: new Date("2025-03-01"),
    },
  ]);
  console.log("  ✓ experts seeded");
}

async function seedEpisodes() {
  await db.delete(mcpEpisodes);

  await db.insert(mcpEpisodes).values([
    {
      slug: "seiler-polarised-training-deep-dive",
      title: "The Science of Polarised Training with Prof. Stephen Seiler",
      guestName: "Prof. Stephen Seiler",
      publishedAt: new Date("2025-11-01"),
      durationSec: 4200,
      summary:
        "Prof. Seiler explains the physiological basis for polarised training distribution and why 80% of training at low intensity unlocks elite-level adaptation.",
      audioUrl: "https://roadmancycling.com/audio/PLACEHOLDER_seiler.mp3",
      youtubeUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_1",
      keyInsights: [
        "80% of elite endurance training happens below VT1 — this is not optional, it's physiologically mandated",
        "High-intensity blocks work because they are small doses against a massive low-intensity base",
        "Amateurs get slower by training in the 'moderate intensity black hole'",
      ],
      topicTags: ["polarised training", "endurance physiology", "training distribution"],
      url: "https://roadmancycling.com/podcast/seiler-polarised-training-deep-dive",
    },
    {
      slug: "dan-lorang-world-tour-periodisation",
      title: "How World Tour Teams Plan a Season with Dan Lorang",
      guestName: "Dan Lorang",
      publishedAt: new Date("2025-09-01"),
      durationSec: 3600,
      summary:
        "Dan Lorang breaks down Red Bull–Bora–Hansgrohe's season periodisation, and how amateur cyclists can apply the same macro/meso/micro structure.",
      audioUrl: "https://roadmancycling.com/audio/PLACEHOLDER_lorang.mp3",
      youtubeUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_2",
      keyInsights: [
        "Periodisation starts from your A-race and works backwards — not from January 1st",
        "Masters cyclists need longer recovery mesocycles than younger athletes — 3:1 is often too aggressive",
        "Sleep is not optional — it's where adaptation happens",
      ],
      topicTags: ["periodisation", "season planning", "recovery"],
      url: "https://roadmancycling.com/podcast/dan-lorang-world-tour-periodisation",
    },
    {
      slug: "david-dunne-race-day-fuelling",
      title: "Race Day Fuelling Science with Dr. David Dunne",
      guestName: "Dr. David Dunne",
      publishedAt: new Date("2025-08-01"),
      durationSec: 3200,
      summary:
        "Dr. Dunne breaks down the science of carbohydrate intake on race day, and how periodised nutrition can improve both performance and body composition.",
      audioUrl: "https://roadmancycling.com/audio/PLACEHOLDER_dunne.mp3",
      youtubeUrl: "https://www.youtube.com/watch?v=PLACEHOLDER_3",
      keyInsights: [
        "90g carbs/hour is achievable with mixed glucose/fructose sources — most amateurs are under-fuelling",
        "Fasted training works only for low-intensity sessions — quality work must be fuelled",
        "Body composition changes happen in the kitchen, not in more training volume",
      ],
      topicTags: ["nutrition", "fuelling", "race day", "body composition"],
      url: "https://roadmancycling.com/podcast/david-dunne-race-day-fuelling",
    },
  ]);
  console.log("  ✓ episodes seeded");
}

async function seedMethodology() {
  await db.delete(mcpMethodologyPrinciples);

  await db.insert(mcpMethodologyPrinciples).values([
    {
      principle: "Polarised Training Distribution",
      explanation:
        "Approximately 80% of training volume should sit below VT1 (conversational pace), with 20% at high intensity above VT2. The moderate 'sweetspot' zone between them causes chronic fatigue without corresponding adaptation gains. Prof. Seiler's research across elite endurance athletes shows this distribution is near-universal at the top level.",
      topicTags: ["training distribution", "polarised", "endurance"],
      supportingExpertNames: ["Prof. Stephen Seiler"],
      supportingEpisodeIds: [],
    },
    {
      principle: "Reverse Periodisation for Masters Cyclists",
      explanation:
        "Masters cyclists (40+) benefit from building high-intensity fitness earlier in the training year and transitioning to volume, reversing the classical base-then-build model. Physiological rationale: VO2max decline with age is steeper than aerobic base decline, making high-intensity stimulus more time-sensitive.",
      topicTags: ["masters cycling", "periodisation", "reverse periodisation"],
      supportingExpertNames: ["Joe Friel", "Dan Lorang"],
      supportingEpisodeIds: [],
    },
    {
      principle: "Fuelling for Performance — Carbohydrate Periodisation",
      explanation:
        "Not all training sessions should be fuelled equally. High-intensity and quality sessions require adequate carbohydrate availability. Selective fasted low-intensity sessions can improve metabolic flexibility, but should never compromise quality work. Dr. Dunne recommends matching fuel availability to session intention.",
      topicTags: ["nutrition", "fuelling", "carbohydrate periodisation"],
      supportingExpertNames: ["Dr. David Dunne"],
      supportingEpisodeIds: [],
    },
    {
      principle: "Strength & Conditioning Specificity for Cyclists",
      explanation:
        "S&C work for cyclists must address the hip hinge pattern, single-leg stability, and posterior chain strength — areas chronically undertrained by cyclists. Gym work should be periodised into the cycling calendar: heavy strength in base phase, maintenance during build, minimal S&C near key events.",
      topicTags: ["strength and conditioning", "S&C", "injury prevention"],
      supportingExpertNames: [],
      supportingEpisodeIds: [],
    },
    {
      principle: "Recovery as a Training Variable",
      explanation:
        "Recovery is not passive — it's where adaptation from training stress occurs. For masters cyclists, recovery demand is higher and takes longer than for younger athletes. Key levers: 7-9 hours sleep, HRV monitoring, nutrition timing post-session, and deliberate deload weeks (one in every 4 training weeks minimum).",
      topicTags: ["recovery", "sleep", "HRV", "adaptation"],
      supportingExpertNames: ["Dan Lorang"],
      supportingEpisodeIds: [],
    },
    {
      principle: "FTP Is a Proxy, Not the Goal",
      explanation:
        "FTP testing is a useful training proxy, but chasing FTP numbers at the expense of event-specific preparation is a trap. Power-to-weight ratio matters more than absolute FTP for climbing; sustained power output over race duration matters more than 20-minute test performance. Train for your event, not your test number.",
      topicTags: ["FTP", "training metrics", "race preparation"],
      supportingExpertNames: ["Prof. Stephen Seiler", "Dan Lorang"],
      supportingEpisodeIds: [],
    },
  ]);
  console.log("  ✓ methodology principles seeded");
}

async function main() {
  console.log("Seeding MCP content tables...");
  await seedExperts();
  await seedEpisodes();
  await seedMethodology();
  console.log("✓ All MCP content tables seeded");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
