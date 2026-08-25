import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { getMethodSession } from "@/lib/method/auth";
import { MethodHeader } from "./_components/MethodHeader";
import { MethodMotionProvider } from "./_components/MethodMotionProvider";

export const metadata: Metadata = {
  title: "The Roadman Method — A 12-Week System for Cyclists Who Are Stuck",
  description:
    "Twelve weeks. Five pillars. One system. Built on 1,400+ podcast episodes and interviews with World Tour coaches, sports scientists and pro cyclists. For serious amateurs who are training hard but not getting faster.",
};

/**
 * Shell layout for /method/*.
 *
 * ★ DOES NOT REDIRECT. Auth routing is handled entirely by
 * src/middleware.ts at the edge. This layout only renders chrome.
 *
 * Session read is wrapped in try/catch so a DB outage or missing
 * env var can't take down the entire /method tree.
 */
export default async function MethodLayout({
  children,
}: {
  children: ReactNode;
}) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "/method";

  let email: string | null = null;
  try {
    const session = await getMethodSession();
    email = session?.payload.email ?? null;
  } catch {
    // Swallow — treat as unauthenticated for header display.
  }

  const isSalesPage = pathname === "/method";

  return (
    <MethodMotionProvider>
      <div className="min-h-screen bg-charcoal text-off-white antialiased">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-deep-purple)_0%,_var(--color-charcoal)_55%)]"
        />
        <MethodHeader
          sessionEmail={email}
          variant={isSalesPage ? "marketing" : "members"}
        />
        {/* id matches the site-wide skip-to-content target in the root
            layout — without it the global skip link is dead on /method/*. */}
        <main id="main-content" className={isSalesPage ? "" : "pb-24"}>
          {children}
        </main>
        <footer className="border-t border-white/5 py-10 text-center text-xs text-foreground-muted">
          <p>The Roadman Method · © Roadman Cycling. Built in Ireland.</p>
        </footer>
      </div>
    </MethodMotionProvider>
  );
}
