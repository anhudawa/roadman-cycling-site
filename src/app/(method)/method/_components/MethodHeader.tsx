import Link from "next/link";

interface MethodHeaderProps {
  sessionEmail: string | null;
  variant?: "marketing" | "members";
}

/**
 * Header for the /method route group.
 *
 * - "marketing" (sales page): logo + Sign in + a primary "Get The Method" CTA.
 * - "members" (dashboard, modules, account): logo + Modules + Account.
 */
export function MethodHeader({ sessionEmail, variant = "members" }: MethodHeaderProps) {
  const isMarketing = variant === "marketing";

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-charcoal/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 md:px-8 py-4">
        <Link
          href={isMarketing ? "/method" : "/method/dashboard"}
          className="flex items-baseline gap-3 font-heading uppercase tracking-wider"
        >
          <span className="text-coral text-xs md:text-sm tracking-[0.3em]">ROADMAN</span>
          <span className="text-off-white text-base md:text-lg">THE METHOD</span>
        </Link>

        {isMarketing ? (
          <nav className="flex items-center gap-3 md:gap-6 text-sm">
            <Link
              href="/method/login"
              className="hidden sm:inline font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white transition-colors"
            >
              Sign in
            </Link>
            <a
              href="#pricing"
              className="font-heading uppercase tracking-wider text-xs md:text-sm bg-coral text-charcoal hover:bg-coral-hover transition-colors px-4 py-2.5 rounded-sm"
            >
              Get The Method
            </a>
          </nav>
        ) : (
          <nav className="flex items-center gap-6 text-sm">
            {sessionEmail ? (
              <>
                <Link
                  href="/method/dashboard"
                  className="font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white transition-colors"
                >
                  Modules
                </Link>
                <Link
                  href="/method/account"
                  className="font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white transition-colors"
                >
                  Account
                </Link>
              </>
            ) : (
              <Link
                href="/method/login"
                className="font-heading uppercase tracking-wider text-coral hover:text-coral-hover transition-colors"
              >
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
