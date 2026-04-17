import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin/auth";
import { getTeamUserById, updateTeamUser } from "@/lib/admin/team-users";

async function requireAdminJson() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

function serialize(u: NonNullable<Awaited<ReturnType<typeof getTeamUserById>>>) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    slug: u.slug,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: { active?: boolean; role?: "admin" | "member" } = {};
  if (typeof body.active === "boolean") patch.active = body.active;
  if (body.role === "admin" || body.role === "member") patch.role = body.role;

  // Prevent the last admin from demoting / deactivating themselves into oblivion
  if ((patch.active === false || patch.role === "member") && id === gate.user.id) {
    return NextResponse.json(
      { error: "You can't deactivate or demote yourself." },
      { status: 400 }
    );
  }

  const updated = await updateTeamUser(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user: serialize(updated) });
}
