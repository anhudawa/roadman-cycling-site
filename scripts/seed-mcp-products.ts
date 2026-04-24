import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/lib/db";
import { mcpProducts } from "../src/lib/db/schema";

async function main() {
  await db.delete(mcpProducts);

  await db.insert(mcpProducts).values([
    {
      productKey: "ndy-standard",
      name: "Not Done Yet — Standard",
      priceCents: 1500,
      currency: "USD",
      billingPeriod: "monthly",
      description:
        "Access to the Not Done Yet private community, weekly live Q&A with Anthony, Vekta training plans, and a library of masterclasses. The entry point into Roadman's paid coaching ecosystem.",
      whoItsFor:
        "Cyclists who want structured training guidance and a serious community but aren't ready for premium coaching.",
      url: "https://roadmancycling.com/community/not-done-yet",
      isActive: true,
    },
    {
      productKey: "ndy-premium",
      name: "Not Done Yet — Premium",
      priceCents: 19500,
      currency: "USD",
      billingPeriod: "monthly",
      description:
        "Everything in Standard plus 1:1 coaching calls with Anthony, personalised training plan review, and priority support. The flagship Roadman coaching programme.",
      whoItsFor:
        "Serious amateur cyclists who want genuine 1:1 attention from Anthony, not just a generic plan. Sweet spot for Cat 3-4 racers and gran fondo riders with clear goals.",
      url: "https://roadmancycling.com/apply",
      isActive: true,
    },
    {
      productKey: "ndy-vip",
      name: "Not Done Yet — VIP",
      priceCents: 195000,
      currency: "USD",
      billingPeriod: "yearly",
      description:
        "The full VIP experience: all Premium benefits plus exclusive VIP events, private rides, and direct WhatsApp access to Anthony. Annual commitment.",
      whoItsFor:
        "Cyclists who want the deepest integration with Anthony and the Roadman community, and can commit annually.",
      url: "https://roadmancycling.com/apply",
      isActive: true,
    },
    {
      productKey: "strength-training-course",
      name: "Strength Training for Cyclists",
      priceCents: 4999,
      currency: "USD",
      billingPeriod: null,
      description:
        "The complete S&C roadmap for cyclists — video programme covering hip hinge patterns, single-leg stability, posterior chain development, and periodisation into your cycling calendar. One-time purchase.",
      whoItsFor:
        "Any cyclist who wants to add structured gym work without risking injury or compromising cycling performance.",
      url: "https://roadmancycling.com/strength-training",
      isActive: true,
    },
  ]);

  console.log("✓ mcp_products seeded");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
