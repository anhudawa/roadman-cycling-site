"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Hamburger drawer for the /method members header. Only renders on
 * screens below `md`. Closes automatically when the route changes,
 * locks body scroll while open, and is reachable with the keyboard.
 */
export function MethodHeaderMobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="method-mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-off-white hover:border-coral hover:text-coral transition-colors active:scale-[0.97]"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="h-5 w-5"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 top-[56px] z-30 bg-charcoal/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav
            id="method-mobile-menu"
            aria-label="Members navigation"
            className="fixed inset-x-0 top-[56px] z-40 border-b border-white/10 bg-charcoal shadow-lg motion-safe:animate-fade-in"
          >
            <ul className="px-4 py-2 divide-y divide-white/5">
              <MobileLink href="/method/dashboard">Dashboard</MobileLink>
              <MobileLink href="/method/account">Account</MobileLink>
              <li className="py-3">
                <a
                  href="mailto:sarah@roadmancycling.com"
                  className="font-heading text-xs uppercase tracking-[0.25em] text-foreground-muted hover:text-coral transition-colors"
                >
                  Email support →
                </a>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="block py-4 font-heading uppercase tracking-wider text-off-white hover:text-coral transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
