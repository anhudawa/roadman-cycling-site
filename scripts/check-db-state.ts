import { sql } from "@vercel/postgres";

async function main() {
  const tables = await sql`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename ASC
  `;
  console.log("Existing tables:");
  tables.rows.forEach(r => console.log(" ", r.tablename));
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
