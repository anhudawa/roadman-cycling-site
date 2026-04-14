import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin/auth";
import { createTeamUser, listAllTeamUsers } from "@/lib/admin/team-users";

async function requireAdminJson() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

function serialize(u: Awaited<ReturnType<typeof listAllTeamUsers>>[number]) {
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

export async function GET() {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;
  const users = await listAllTeamUsers();
  return NextResponse.json({ users: users.map(serialize) });
}

export async function POST(request: Request) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!email || !name || !slug) {
    return NextResponse.json({ error: "email, name, slug all required" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ error: "slug must be alphanumeric/hyphens" }, { status: 400 });
  }

  try {
    const { user, plaintextPassword } = await createTeamUser({ email, name, slug });
    return NextResponse.json({ user: serialize(user), plaintextPassword });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
