// One-off dev helper — mints a single-use magic-link token in the
// rider_login_tokens table and prints the verify URL. Lets us walk
// through the real verify path during local UI verification without
// configuring Resend.

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { loadByEmail } from "../src/lib/rider-profile/store";
import { mintRiderLoginToken } from "../src/lib/profile-auth/auth";

async function main() {
  const email = process.argv[2];
  const origin = process.argv[3] ?? "http://localhost:3000";
  if (!email) {
    console.error(
      "Usage: tsx scripts/dev-mint-rider-magic-link.ts <email> [origin]",
    );
    process.exit(1);
  }
  const profile = await loadByEmail(email.toLowerCase());
  if (!profile) {
    console.error(`No rider profile for ${email}.`);
    process.exit(2);
  }
  const { rawToken } = await mintRiderLoginToken(profile.id);
  console.log(
    `${origin}/api/profile/login/verify?token=${encodeURIComponent(rawToken)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
