import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { getMethodSession } from "@/lib/method/auth";
import { MethodHeader } from "./_components/MethodHeader";

export const metadata: Metadata = {
  title: "The Roadman Method — A 12-Week System for Cyclists Who Are Stuck",
  description:
    "Twelve weeks. Five pillars. One system. Built on 1,400+ conversations with World Tour coaches, sports scientists and pro cyclists. For serious amateurs who are training hard but not getting faster.",
};

/**
 * Shell layout for /method/*.
 *
 * Auth redirects (public vs protected, sales → dashboard) are handled
 * entirely by src/middleware.ts at the edge. This layout only renders
 * the chrome. Individual page components still call getMethodSession()
 * for their own data needs and as a server-side safety net.
 */
export default async function MethodLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "/method";

  // Safety: if getMethodSession() throws (e.g. DB down, env missing),
  // degrade to "no session" so the layout still renders. Individual
  // pages do their own session checks and redirect as needed.
  let session: Awaited<ReturnType<typeof getMethodSession>> = null;
  try {
    session = await getMethodSession();
  } catch {
    // Swallow — treat as unauthenticated.
  }

  const isSalesPage = pathname === "/method";

  return (
    <div className="min-h-screen bg-charcoal text-off-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-deep-purple)_0%,_var(--color-charcoal)_55%)]"
      />
      <MethodHeader
        sessionEmail={session?.payload.email ?? null}
        variant={isSalesPage ? "marketing" : "members"}
      />
      <main id="method-main" className={isSalesPage ? "" : "pb-24"}>
        {children}
      </main>
      <footer className="border-t border-white/5 py-10 text-center text-xs text-foreground-muted">
        <p>The Roadman Method · © Roadman Cycling. Built in Ireland.</p>
      </footer>
    </div>
  );
}
