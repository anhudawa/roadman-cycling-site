// One-off dev helper — mints a rider_session JWT for an existing
// rider profile, prints the cookie value to stdout. Used during
// local verification of /profile without sending real magic-link
// email. NOT for production use.

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { loadByEmail } from "../src/lib/rider-profile/store";
import { signRiderSessionToken } from "../src/lib/profile-auth/auth";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/dev-mint-rider-session.ts <email>");
    process.exit(1);
  }
  const profile = await loadByEmail(email.toLowerCase());
  if (!profile) {
    console.error(`No rider profile for ${email}.`);
    process.exit(2);
  }
  const { jwt } = signRiderSessionToken(profile);
  console.log(jwt);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
