#!/usr/bin/env tsx
/**
 * Seed / upsert team_users with SHA-256 password hashes.
 *
 * Usage:
 *   POSTGRES_URL=... \
 *   TEAM_PASSWORD_TED=... \
 *   TEAM_PASSWORD_SARAH=... \
 *   TEAM_PASSWORD_WES=... \
 *   TEAM_PASSWORD_MATTHEW=... \
 *     npx tsx scripts/seed-team-users.ts
 *
 * Missing TEAM_PASSWORD_* env vars will cause that user to be skipped (row
 * untouched). Idempotent.
 */
import { db } from "../src/lib/db/index";
import { teamUsers } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "../src/lib/admin/password";

interface SeedUser {
  slug: string;
  name: string;
  email: string;
  role: "admin" | "member";
  envVar: string;
}

const USERS: SeedUser[] = [
  { slug: "ted", name: "Ted", email: "ted@roadmancycling.com", role: "admin", envVar: "TEAM_PASSWORD_TED" },
  { slug: "sarah", name: "Sarah", email: "sarah@roadmancycling.com", role: "member", envVar: "TEAM_PASSWORD_SARAH" },
  { slug: "wes", name: "Wes", email: "wes@roadmancycling.com", role: "member", envVar: "TEAM_PASSWORD_WES" },
  { slug: "matthew", name: "Matthew", email: "matthew@roadmancycling.com", role: "member", envVar: "TEAM_PASSWORD_MATTHEW" },
];

interface Result {
  slug: string;
  email: string;
  status: "inserted" | "updated" | "skipped";
  reason?: string;
}

async function main(): Promise<void> {
  if (!process.env.POSTGRES_URL) {
    console.error("Error: POSTGRES_URL env var is required.");
    process.exit(1);
  }

  const results: Result[] = [];

  for (const u of USERS) {
    const password = process.env[u.envVar];
    if (!password) {
      console.warn(`[skip] ${u.slug}: ${u.envVar} not set`);
      results.push({ slug: u.slug, email: u.email, status: "skipped", reason: `${u.envVar} not set` });
      continue;
    }
    const passwordHash = hashPassword(password);

    try {
      const inserted = await db
        .insert(teamUsers)
        .values({
          email: u.email.toLowerCase(),
          name: u.name,
          slug: u.slug,
          passwordHash,
          role: u.role,
          active: true,
        })
        .onConflictDoUpdate({
          target: teamUsers.email,
          set: {
            name: u.name,
            passwordHash: sql`excluded.password_hash`,
            active: true,
          },
        })
        .returning({ id: teamUsers.id, createdAt: teamUsers.createdAt });

      // We can't easily tell insert vs update from the ON CONFLICT result alone;
      // peek at createdAt vs now as a heuristic.
      const row = inserted[0];
      const justCreated = row && Date.now() - new Date(row.createdAt).getTime() < 5_000;
      results.push({
        slug: u.slug,
        email: u.email,
        status: justCreated ? "inserted" : "updated",
      });
    } catch (err) {
      console.error(`[error] ${u.slug}:`, err);
      results.push({
        slug: u.slug,
        email: u.email,
        status: "skipped",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log("\nSeed summary:");
  console.log("─".repeat(80));
  for (const r of results) {
    const pad = (s: string, n: number) => s.padEnd(n);
    console.log(
      `${pad(r.slug, 10)} ${pad(r.email, 35)} ${pad(r.status, 10)} ${r.reason ?? ""}`
    );
  }
  console.log("─".repeat(80));

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
