import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, getContactById, type ActivityType } from "@/lib/crm/contacts";
import { createNotification, extractMentions } from "@/lib/crm/notifications";

const ALLOWED: ActivityType[] = [
  "note",
  "email_sent",
  "call_logged",
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getContactById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const type = (body.type ?? "note") as ActivityType;
  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const author = user.name;
  const activityBody = typeof body.body === "string" ? body.body : null;
  const activity = await addActivity(id, {
    type,
    title,
    body: activityBody,
    meta: body.meta ?? null,
    authorName: author,
    authorSlug: user.slug,
  });

  // Fire @-mention notifications for notes
  if (type === "note" && activityBody) {
    const mentions = extractMentions(activityBody).filter((s) => s !== user.slug);
    const contactLabel = existing.name ?? existing.email;
    await Promise.all(
      mentions.map((slug) =>
        createNotification({
          recipientSlug: slug,
          type: "mention",
          title: `${user.name} mentioned you on ${contactLabel}`,
          body: activityBody.slice(0, 280),
          link: `/admin/contacts/${id}`,
        }).catch((err) => {
          console.error("[activities] notification failed", err);
          return null;
        })
      )
    );
  }

  return NextResponse.json({
    activity: {
      ...activity,
      meta: activity.meta ?? null,
      createdAt: activity.createdAt.toISOString(),
    },
  });
}
