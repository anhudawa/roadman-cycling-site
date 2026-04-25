import { config } from "dotenv";
import { sql } from "@vercel/postgres";

config({ path: ".env.local" });

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");

  console.log("BEFORE:");
  const before = await sql.query<{
    slug: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
  }>(`SELECT slug, email, name, role, active FROM team_users ORDER BY id`);
  for (const r of before.rows)
    console.log(`  ${r.slug.padEnd(10)} ${r.email.padEnd(40)} ${r.name} (${r.role}, active=${r.active})`);

  // Anthony: rename ted@* $†’ anthony@*, slug stays 'ted' (don't want to break
  // anywhere in the code that refers to slug='ted').
  await sql.query(
    `UPDATE team_users SET email = 'anthony@roadmancycling.com'
       WHERE slug = 'ted' AND email <> 'anthony@roadmancycling.com'`
  );

  // Ensure Sarah and Matthew exist with the right emails.
  await sql.query(
    `UPDATE team_users SET email = 'sarah@roadmancycling.com'
       WHERE slug = 'sarah' AND email <> 'sarah@roadmancycling.com'`
  );
  await sql.query(
    `UPDATE team_users SET email = 'matthew@roadmancycling.com'
       WHERE slug = 'matthew' AND email <> 'matthew@roadmancycling.com'`
  );

  console.log("\nAFTER:");
  const after = await sql.query<{
    slug: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
  }>(`SELECT slug, email, name, role, active FROM team_users ORDER BY id`);
  for (const r of after.rows)
    console.log(`  ${r.slug.padEnd(10)} ${r.email.padEnd(40)} ${r.name} (${r.role}, active=${r.active})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
