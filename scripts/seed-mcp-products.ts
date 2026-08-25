/**
 * Seeds mcp_products with the full Roadman offering catalogue.
 *
 * Free and paid offerings are both included so the MCP server can route
 * users to the right surface even when the answer is "start free". Price
 * stored in cents — $0 for free products. `billingPeriod` is one of:
 *   "monthly"  — recurring monthly
 *   "yearly"   — recurring annual
 *   null       — one-time purchase OR free (no billing)
 *
 * Idempotent: delete-and-reinsert. `productKey` is the stable lookup.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { mcpProducts } from "../src/lib/db/schema";
import { SITE_ORIGIN } from "../src/lib/brand-facts";
import { OFFER_TIERS } from "../src/lib/offer-ladder";

async function main() {
  await db.delete(mcpProducts);

  await db.insert(mcpProducts).values([
    // ─── Paid coaching tiers ──────────────────────────────────
    {
      productKey: "not-done-yet",
      name: OFFER_TIERS.notDoneYet.name,
      priceCents: OFFER_TIERS.notDoneYet.pricing.monthlyUsd * 100,
      currency: "USD",
      billingPeriod: "monthly",
      description: OFFER_TIERS.notDoneYet.description,
      whoItsFor:
        "Serious amateur and masters cyclists training 6–12 hours per week who want personalised planning, weekly review, live group coaching, and accountability.",
      url: `${SITE_ORIGIN}${OFFER_TIERS.notDoneYet.cta.href}`,
      isActive: true,
    },
    {
      productKey: "inner-circle",
      name: "Roadman Inner Circle — 1:1 Coaching",
      priceCents: OFFER_TIERS.oneToOne.pricing.monthlyUsd * 100,
      currency: "USD",
      billingPeriod: "monthly",
      description: OFFER_TIERS.oneToOne.description,
      whoItsFor:
        "Cyclists with specific, high-stakes goals who need direct 1:1 access, bespoke programming, and a single line of accountability.",
      url: `${SITE_ORIGIN}${OFFER_TIERS.oneToOne.cta.href}`,
      isActive: true,
    },

    // ─── Standalone courses ───────────────────────────────────
    {
      productKey: "strength-training-course",
      name: "Strength Training for Cyclists",
      priceCents: 4999,
      currency: "USD",
      billingPeriod: null,
      description:
        "Structured S&C roadmap for cyclists — video programme covering hip hinge patterns, single-leg stability, posterior chain development, and periodisation into your cycling calendar. No gym membership required for the home-gym track.",
      whoItsFor:
        "Any cyclist — especially 40+ — who wants to add structured gym work without risking injury or compromising cycling performance. Built for riders new to lifting as well as experienced gym-goers.",
      url: `${SITE_ORIGIN}/strength-training`,
      isActive: true,
    },

    // ─── Free community + newsletter ──────────────────────────
    {
      productKey: "clubhouse",
      name: "Roadman Clubhouse (Free Community)",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "The free Roadman community tier on Skool. Discussion threads, monthly workouts, member-submitted Q&A, and a curated library of the best episode takeaways. No cost, no card required.",
      whoItsFor:
        "Listeners and readers who want to connect with other Roadman cyclists without committing to paid coaching yet.",
      url: `${SITE_ORIGIN}/community/clubhouse`,
      isActive: true,
    },
    {
      productKey: "saturday-spin",
      name: "The Saturday Spin (Weekly Newsletter)",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Free weekly newsletter — 30,000+ subscribers. The best podcast takeaways of the week, one actionable training idea, and the single piece of gear / research / story that's worth your attention. 65%+ open rate.",
      whoItsFor:
        "Any cyclist who wants a short, signal-dense weekly read they'll actually open — written for riders who train around real life, not full-time.",
      url: `${SITE_ORIGIN}`,
      isActive: true,
    },

    // ─── Free diagnostic + calculators ────────────────────────
    {
      productKey: "plateau-diagnostic",
      name: "The Masters Plateau Diagnostic",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Twelve questions. Four minutes. A specific diagnosis for why your FTP has stalled and the exact fix — written for riders training 6-12 hours per week around a real life. Free, no email gate to view the first answer.",
      whoItsFor:
        "Experienced cyclists (usually 35+) whose FTP has flatlined for 6-24 months despite consistent training.",
      url: `${SITE_ORIGIN}/plateau`,
      isActive: true,
    },
    {
      productKey: "tool-ftp-zones",
      name: "FTP Zone Calculator",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Calculate 7 cycling power zones from your FTP — Coggan/Allen model. Outputs watts for Active Recovery, Endurance, Tempo, Sweet Spot, Threshold, VO2max, and Anaerobic. Free browser tool.",
      whoItsFor:
        "Anyone with a recent FTP test result who needs training zones for a plan or head unit.",
      url: `${SITE_ORIGIN}/tools/ftp-zones`,
      isActive: true,
    },
    {
      productKey: "tool-fuelling",
      name: "In-Ride Fuelling Calculator",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Calculate carbs-per-hour, fluid, and sodium needs for any ride duration and intensity. Based on the current sports-nutrition research discussed on the podcast (60-120+ g/hr for racing).",
      whoItsFor:
        "Any cyclist sizing up fuelling for a long ride, sportive, or race — particularly age-group triathletes on the bike leg.",
      url: `${SITE_ORIGIN}/tools/fuelling`,
      isActive: true,
    },
    {
      productKey: "tool-wkg",
      name: "Watts-per-Kilo (W/kg) Calculator",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Power-to-weight ratio with performance benchmarks across cycling categories. Enter FTP and weight, see where you sit versus Cat 3, Cat 2, Cat 1, and World Tour benchmarks.",
      whoItsFor:
        "Cyclists tracking climbing potential or comparing themselves to category benchmarks.",
      url: `${SITE_ORIGIN}/tools/wkg`,
      isActive: true,
    },
    {
      productKey: "tool-hr-zones",
      name: "Heart Rate Zone Calculator",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Calculate 5 HR training zones from max HR or lactate threshold HR. Use when you're training by heart rate (no power meter) or cross-checking a power-based plan.",
      whoItsFor:
        "Cyclists training by heart rate or reconciling HR-based plans with power data.",
      url: `${SITE_ORIGIN}/tools/hr-zones`,
      isActive: true,
    },
    {
      productKey: "tool-energy-availability",
      name: "Energy Availability Calculator (RED-S screener)",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Screen for Relative Energy Deficiency in Sport. Enter intake, training load, and body composition; get a RED-S risk indicator and guidance on whether to adjust intake.",
      whoItsFor:
        "Endurance athletes — especially those dropping weight, riding high volume, or dealing with poor recovery.",
      url: `${SITE_ORIGIN}/tools/energy-availability`,
      isActive: true,
    },
    {
      productKey: "tool-race-weight",
      name: "Race Weight Calculator",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Target cycling race weight based on body composition rather than a BMI shortcut. Accounts for fat mass, lean mass, and honest floor limits.",
      whoItsFor:
        "Cyclists chasing a realistic climbing weight without crossing into RED-S territory.",
      url: `${SITE_ORIGIN}/tools/race-weight`,
      isActive: true,
    },
    {
      productKey: "tool-tyre-pressure",
      name: "Tyre Pressure Calculator",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Optimal front and rear PSI based on rider weight, tyre width, and surface — road, gravel, or mixed. Frees up the marginal gain most amateurs leave on the table.",
      whoItsFor:
        "Cyclists running tubeless or wide tyres who haven't dialled in pressure.",
      url: `${SITE_ORIGIN}/tools/tyre-pressure`,
      isActive: true,
    },
    {
      productKey: "tool-shock-pressure",
      name: "MTB Shock Pressure Calculator",
      priceCents: 0,
      currency: "USD",
      billingPeriod: null,
      description:
        "Set up rear shock, fork, and sag based on rider weight and kit. Replaces the trial-and-error that costs MTB riders months of bad setup.",
      whoItsFor:
        "MTB riders and cross-discipline cyclists setting up a full-suspension bike.",
      url: `${SITE_ORIGIN}/tools/shock-pressure`,
      isActive: true,
    },
  ]);

  console.log("✓ mcp_products seeded (full catalogue)");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
