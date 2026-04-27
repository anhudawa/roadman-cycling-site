import "dotenv/config";
import { db } from "@/lib/db";
import { brandPrompts } from "@/lib/db/schema";
import { SEED_PROMPTS } from "@/lib/citation-tests/seed-prompts";

async function main() {
  const existing = await db.select().from(brandPrompts);
  if (existing.length > 0) {
    console.log(
      `brand_prompts already has ${existing.length} rows; skipping seed.`,
    );
    process.exit(0);
  }
  await db.insert(brandPrompts).values(SEED_PROMPTS);
  console.log(`Seeded ${SEED_PROMPTS.length} brand prompts.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
