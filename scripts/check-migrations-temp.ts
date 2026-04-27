import { sql } from "@vercel/postgres";

async function main() {
  try {
    const result = await sql`SELECT hash FROM __drizzle_migrations ORDER BY created_at ASC`;
    console.log("Applied migrations:");
    result.rows.forEach(r => console.log(" ", r.hash));
  } catch (e) {
    console.log("__drizzle_migrations table might not exist yet:", e instanceof Error ? e.message : e);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
