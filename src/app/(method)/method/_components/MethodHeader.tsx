import Link from "next/link";
import { MethodHeaderMobileMenu } from "./MethodHeaderMobileMenu";

interface MethodHeaderProps {
  sessionEmail: string | null;
  variant?: "marketing" | "members";
}

/**
 * Header for the /method route group.
 *
 * - "marketing" (sales page): logo + Sign in + a primary "Enrol Now" CTA.
 * - "members" (dashboard, modules, account): logo + Dashboard + Account
 *   on desktop, hamburger drawer on mobile.
 */
export function MethodHeader({ sessionEmail, variant = "members" }: MethodHeaderProps) {
  const isMarketing = variant === "marketing";

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-charcoal/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 md:px-8 py-3.5 md:py-4">
        <Link
          href={isMarketing ? "/method" : "/method/dashboard"}
          className="flex items-baseline gap-2 sm:gap-3 font-heading uppercase tracking-wider min-w-0"
        >
          <span className="hidden sm:inline text-coral text-xs md:text-sm tracking-[0.3em]">ROADMAN</span>
          <span className="text-off-white text-sm md:text-lg truncate">THE METHOD</span>
        </Link>

        {isMarketing ? (
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6 text-sm">
            <Link
              href="/method/login"
              className="hidden sm:inline font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white transition-colors"
            >
              Sign in
            </Link>
            <a
              href="#pricing"
              className="font-heading uppercase tracking-wider text-xs md:text-sm bg-coral text-charcoal hover:bg-coral-hover transition-colors px-3 sm:px-4 py-2 sm:py-2.5 rounded-sm"
            >
              Enrol Now
            </a>
          </nav>
        ) : sessionEmail ? (
          <>
            <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Members navigation">
              <Link
                href="/method/dashboard"
                className="font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/method/fuel-planner"
                className="font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white transition-colors"
              >
                Fuel Planner
              </Link>
              <Link
                href="/method/account"
                className="font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white transition-colors"
              >
                Account
              </Link>
            </nav>
            <MethodHeaderMobileMenu />
          </>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/method/login"
              className="font-heading uppercase tracking-wider text-coral hover:text-coral-hover transition-colors"
            >
              Sign in
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
