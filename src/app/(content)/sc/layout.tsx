"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";

const SC_NAV_LINKS = [
  { href: "/sc", label: "Overview" },
  { href: "/sc/programme", label: "Programme" },
  { href: "/sc/exercises", label: "Exercise Library" },
  { href: "/sc/core", label: "Core Work" },
  { href: "/sc/stretching", label: "Stretching" },
];

export default function SCLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header />

      {/* Secondary S&C nav — sits below the fixed header */}
      <div className="sticky top-[var(--header-height,72px)] z-40 bg-deep-purple border-b border-white/10">
        <nav
          aria-label="S&C section navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <ul className="flex gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap py-3 -mb-px">
            {SC_NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/sc"
                  ? pathname === "/sc"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    className={`
                      font-body text-sm pb-3 border-b-2 transition-colors
                      ${
                        isActive
                          ? "text-coral border-coral"
                          : "text-foreground-muted border-transparent hover:text-off-white hover:border-white/30"
                      }
                    `}
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
