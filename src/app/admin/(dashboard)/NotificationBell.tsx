"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/inbox?count=1");
        if (res.ok) {
          const data = await res.json();
          setUnread(data.unread ?? 0);
        }
      } catch {
        // silently fail
      }
    }

    fetchCount();
    // Poll every 60 seconds
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/admin/inbox"
      className="relative p-2 rounded-lg text-foreground-muted hover:text-off-white hover:bg-white/5 transition-colors"
      title="Inbox"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-coral rounded-full">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
