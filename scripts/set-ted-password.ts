import crypto from "node:crypto";
import { config } from "dotenv";
import { sql } from "@vercel/postgres";

config({ path: ".env.local" });

function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

async function main() {
  const slug = process.argv[2] ?? "ted";
  const newPassword = process.argv[3];
  if (!newPassword) {
    throw new Error(
      "Usage: tsx scripts/set-ted-password.ts <slug> <new_password>"
    );
  }
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");

  const hashed = hashPassword(newPassword);
  // Discover which columns exist $€” schema has drifted slightly across envs.
  const cols = await sql.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'team_users'`
  );
  const has = new Set(cols.rows.map((c) => c.column_name));

  const sets: string[] = ["password_hash = $1"];
  if (has.has("password_updated_at")) sets.push("password_updated_at = now()");
  if (has.has("active")) sets.push("active = true");
  if (has.has("must_change_password")) sets.push("must_change_password = false");

  const returning = ["id", "slug", "email", "role"].filter((c) => has.has(c));
  if (has.has("active")) returning.push("active");

  const r = await sql.query(
    `UPDATE team_users SET ${sets.join(", ")}
      WHERE slug = $2
   RETURNING ${returning.join(", ")}`,
    [hashed, slug]
  );
  if (r.rowCount === 0) {
    throw new Error(`No team_user found with slug="${slug}"`);
  }
  const user = r.rows[0];
  console.log("$œ“ password rotated for", user.slug);
  console.log("  id:", user.id);
  console.log("  email:", user.email);
  console.log("  role:", user.role);
  console.log("  active:", user.active);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
