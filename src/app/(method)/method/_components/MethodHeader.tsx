import Link from "next/link";

interface MethodHeaderProps {
  sessionEmail: string | null;
}

/**
 * Header for the /method route group. Deliberately stripped down
 * compared to the public-site header — no podcast nav, no marketing
 * links, just the logo, "Modules" home, and account.
 */
export function MethodHeader({ sessionEmail }: MethodHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-charcoal/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 md:px-8 py-4">
        <Link
          href="/method"
          className="flex items-baseline gap-3 font-heading uppercase tracking-wider"
        >
          <span className="text-coral text-sm tracking-[0.3em]">ROADMAN</span>
          <span className="text-off-white text-lg">THE METHOD</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {sessionEmail ? (
            <>
              <Link
                href="/method"
                className="font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white"
              >
                Modules
              </Link>
              <Link
                href="/method/account"
                className="font-heading uppercase tracking-wider text-foreground-muted hover:text-off-white"
              >
                Account
              </Link>
            </>
          ) : (
            <Link
              href="/method/login"
              className="font-heading uppercase tracking-wider text-coral hover:text-coral-hover"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
