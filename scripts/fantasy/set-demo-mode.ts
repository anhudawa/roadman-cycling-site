/**
 * Quick helper: flip demoMode on/off in game_config.
 * Usage:  npx tsx scripts/fantasy/set-demo-mode.ts true
 *         npx tsx scripts/fantasy/set-demo-mode.ts false
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { setConfigKey } from "../../src/lib/fantasy/queries";

async function main() {
  const value = process.argv[2] === "true";
  await setConfigKey("demoMode", value, "anthony");
  console.log(`✓ demoMode = ${value}`);
  process.exit(0);
}
main();
