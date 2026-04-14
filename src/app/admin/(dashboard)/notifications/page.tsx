import { requireAuth } from "@/lib/admin/auth";
import { listNotifications } from "@/lib/crm/notifications";
import { NotificationsList } from "./NotificationsList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireAuth();
  let initial: Awaited<ReturnType<typeof listNotifications>> = [];
  try {
    initial = await listNotifications(user.slug, { limit: 100 });
  } catch {
    // table may not exist yet
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase">
          Notifications
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Mentions, task assignments, and pipeline activity for {user.name}.
        </p>
      </div>
      <NotificationsList initial={initial} />
    </div>
  );
}
