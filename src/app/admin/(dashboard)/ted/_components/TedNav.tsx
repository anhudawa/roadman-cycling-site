"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "/admin/ted", label: "Dashboard" },
  { href: "/admin/ted/queue", label: "Prompts" },
  { href: "/admin/ted/welcomes", label: "Welcomes" },
  { href: "/admin/ted/surfaces", label: "Surfaces" },
  { href: "/admin/ted/members", label: "Members" },
  { href: "/admin/ted/log", label: "Log" },
  { href: "/admin/ted/settings", label: "Settings" },
];

export function TedNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 text-sm">
      {LINKS.map((l) => {
        const active =
          pathname === l.href ||
          (l.href !== "/admin/ted" && pathname?.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-md ${
              active
                ? "bg-white/15 text-white"
                : "bg-white/5 text-foreground-subtle hover:text-white hover:bg-white/10"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
