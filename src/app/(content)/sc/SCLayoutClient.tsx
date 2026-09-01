"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer, Header } from "@/components/layout";

const SC_NAV_LINKS = [
  { href: "/strength-training", label: "Overview" },
  { href: "/sc/programme", label: "Programme" },
  { href: "/sc/exercises", label: "Exercise Library" },
  { href: "/sc/core", label: "Core Work" },
  { href: "/sc/stretching", label: "Stretching" },
];

export function SCLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className="sticky top-[var(--header-height,72px)] z-40 border-b border-white/10 bg-deep-purple">
        <nav
          aria-label="S&C section navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <ul className="-mb-px flex gap-6 overflow-x-auto whitespace-nowrap py-3 scrollbar-hide">
            {SC_NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);

              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    className={`border-b-2 pb-3 font-body text-sm transition-colors ${
                      isActive
                        ? "border-coral text-coral"
                        : "border-transparent text-foreground-muted hover:border-white/30 hover:text-off-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
