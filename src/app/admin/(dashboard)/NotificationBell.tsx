"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UnreadBadge, UnreadDot } from "@/components/admin/ui";

interface NotificationItem {
  id: number;
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
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return `${d}d`;
}

export function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  async function fetchAll() {
    try {
      const res = await fetch("/api/admin/crm/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setItems(data.notifications ?? []);
        setUnread(data.unread ?? 0);
      }
    } catch {
      /* silent */
    }
  }

  async function fetchCount() {
    try {
      const res = await fetch("/api/admin/crm/notifications?count=1");
      if (res.ok) {
        const data = await res.json();
        setUnread(data.unread ?? 0);
      }
    } catch {
      /* silent */
    }
  }

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchAll().finally(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleClickItem(n: NotificationItem) {
    if (!n.readAt) {
      try {
        await fetch(`/api/admin/crm/notifications/${n.id}/read`, { method: "POST" });
      } catch {
        /* silent */
      }
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
      );
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function handleMarkAllRead() {
    try {
      await fetch("/api/admin/crm/notifications/read-all", { method: "POST" });
      setUnread(0);
      const now = new Date().toISOString();
      setItems((prev) => prev.map((x) => (x.readAt ? x : { ...x, readAt: now })));
    } catch {
      /* silent */
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-foreground-muted hover:text-off-white hover:bg-white/5 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5">
            <UnreadBadge count={unread} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-background-elevated border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-heading">
              Notifications
            </p>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unread === 0}
              className="text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent disabled:opacity-40 font-heading"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-foreground-subtle">Loading...</p>
            ) : items.length === 0 ? (
              <p className="p-4 text-sm text-foreground-subtle">You&apos;re all caught up.</p>
            ) : (
              <ul>
                {items.map((n) => {
                  const isUnread = !n.readAt;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleClickItem(n)}
                        className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                          isUnread ? "bg-accent/[0.04]" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {isUnread && <UnreadDot size="xs" className="mt-1.5" />}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${isUnread ? "text-off-white" : "text-foreground-muted"}`}>
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-xs text-foreground-subtle mt-0.5 line-clamp-2">
                                {n.body}
                              </p>
                            )}
                            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mt-1">
                              {n.type.replace(/_/g, " ")} $· {relativeTime(n.createdAt)}
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
          <div className="px-4 py-2 border-t border-white/5 text-right">
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="text-[10px] uppercase tracking-widest text-foreground-muted hover:text-accent font-heading"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
