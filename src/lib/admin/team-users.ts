import { db } from "@/lib/db";
import { teamUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPasswordForStorage, generateRandomPassword } from "@/lib/admin/password";

export type TeamUserRow = typeof teamUsers.$inferSelect;

export async function listAllTeamUsers(): Promise<TeamUserRow[]> {
  return db.select().from(teamUsers).orderBy(teamUsers.id);
}

export async function getTeamUserById(id: number): Promise<TeamUserRow | null> {
  const rows = await db.select().from(teamUsers).where(eq(teamUsers.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface CreateTeamUserInput {
  email: string;
  name: string;
  slug: string;
}

export async function createTeamUser(
  input: CreateTeamUserInput
): Promise<{ user: TeamUserRow; plaintextPassword: string }> {
  const plaintextPassword = generateRandomPassword(20);
  const passwordHash = await hashPasswordForStorage(plaintextPassword);
  const inserted = await db
    .insert(teamUsers)
    .values({
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      passwordHash,
      role: "member",
      active: true,
    })
    .returning();
  return { user: inserted[0], plaintextPassword };
}

export async function updateTeamUser(
  id: number,
  patch: { active?: boolean; role?: "admin" | "member" }
): Promise<TeamUserRow | null> {
  const updates: Partial<typeof teamUsers.$inferInsert> = {};
  if (typeof patch.active === "boolean") updates.active = patch.active;
  if (patch.role === "admin" || patch.role === "member") updates.role = patch.role;
  if (Object.keys(updates).length === 0) return getTeamUserById(id);

  const updated = await db
    .update(teamUsers)
    .set(updates)
    .where(eq(teamUsers.id, id))
    .returning();
  return updated[0] ?? null;
}

export async function rotateTeamUserPassword(
  id: number
): Promise<{ user: TeamUserRow; plaintextPassword: string } | null> {
  const plaintextPassword = generateRandomPassword(20);
  const passwordHash = await hashPasswordForStorage(plaintextPassword);
  const updated = await db
    .update(teamUsers)
    .set({ passwordHash })
    .where(eq(teamUsers.id, id))
    .returning();
  if (!updated[0]) return null;
  return { user: updated[0], plaintextPassword };
}
