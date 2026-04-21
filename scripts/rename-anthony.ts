import { config } from "dotenv";
import { sql } from "@vercel/postgres";

config({ path: ".env.local" });

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");
  // Slug stays 'ted' because dozens of owner-assignment selects reference it.
  // Just change the displayed name.
  await sql.query(
    `UPDATE team_users SET name = 'Anthony' WHERE slug = 'ted' AND name <> 'Anthony'`
  );
  const r = await sql.query<{ slug: string; email: string; name: string }>(
    `SELECT slug, email, name FROM team_users ORDER BY id`
  );
  for (const row of r.rows) console.log(row);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
