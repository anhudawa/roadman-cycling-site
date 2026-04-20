"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LinkDef {
  href: string;
  label: string;
  pendingCount?: number;
}

export function TedNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  const links: LinkDef[] = [
    { href: "/admin/ted", label: "Dashboard" },
    { href: "/admin/ted/approvals", label: "Approvals", pendingCount },
    { href: "/admin/ted/queue", label: "Prompts" },
    { href: "/admin/ted/welcomes", label: "Welcomes" },
    { href: "/admin/ted/surfaces", label: "Surfaces" },
    { href: "/admin/ted/members", label: "Members" },
    { href: "/admin/ted/log", label: "Log" },
    { href: "/admin/ted/health", label: "Health" },
    { href: "/admin/ted/settings", label: "Settings" },
  ];

  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {links.map((l) => {
        const active =
          pathname === l.href ||
          (l.href !== "/admin/ted" && pathname?.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
              active
                ? "bg-white/15 text-white"
                : "bg-white/5 text-foreground-subtle hover:text-white hover:bg-white/10"
            }`}
          >
            {l.label}
            {typeof l.pendingCount === "number" && l.pendingCount > 0 ? (
              <span className="text-[10px] rounded-full bg-coral/20 text-coral px-1.5 py-0.5">
                {l.pendingCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
