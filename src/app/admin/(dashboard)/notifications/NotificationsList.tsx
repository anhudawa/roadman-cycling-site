"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UnreadDot } from "@/components/admin/ui";

interface NotificationItem {
  id: number;
  recipientSlug: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB");
}

export function NotificationsList({ initial }: { initial: NotificationItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>(initial);
  const [busy, setBusy] = useState(false);

  const unreadCount = items.filter((i) => !i.readAt).length;

  async function handleClick(n: NotificationItem) {
    if (!n.readAt) {
      try {
        await fetch(`/api/admin/crm/notifications/${n.id}/read`, { method: "POST" });
      } catch {
        /* silent */
      }
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
      );
    }
    if (n.link) router.push(n.link);
  }

  async function markAllRead() {
    setBusy(true);
    try {
      await fetch("/api/admin/crm/notifications/read-all", { method: "POST" });
      const now = new Date().toISOString();
      setItems((prev) => prev.map((x) => (x.readAt ? x : { ...x, readAt: now })));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-background-elevated rounded-xl border border-white/5">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-heading">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </p>
        <button
          type="button"
          onClick={markAllRead}
          disabled={busy || unreadCount === 0}
          className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-heading bg-accent/10 text-accent border border-accent/20 rounded hover:bg-accent/20 disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>
      {items.length === 0 ? (
        <p className="p-8 text-center text-sm text-foreground-subtle">
          No notifications yet.
        </p>
      ) : (
        <ul>
          {items.map((n) => {
            const isUnread = !n.readAt;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    isUnread ? "bg-accent/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isUnread && <UnreadDot size="xs" className="mt-2" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`text-sm ${isUnread ? "text-off-white" : "text-foreground-muted"}`}>
                          {n.title}
                        </p>
                        <span className="text-xs text-foreground-subtle shrink-0">
                          {relativeTime(n.createdAt)}
                        </span>
                      </div>
                      {n.body && (
                        <p className="text-xs text-foreground-muted mt-1 whitespace-pre-wrap">
                          {n.body}
                        </p>
                      )}
                      <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mt-1">
                        {n.type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
