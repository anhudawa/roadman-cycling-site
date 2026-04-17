import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin/auth";
import { rotateTeamUserPassword } from "@/lib/admin/team-users";

async function requireAdminJson() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const result = await rotateTeamUserPassword(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      slug: result.user.slug,
    },
    plaintextPassword: result.plaintextPassword,
  });
}
