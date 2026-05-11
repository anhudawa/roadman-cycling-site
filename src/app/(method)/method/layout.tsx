import { redirect } from "next/navigation";
import type { Metadata, ReactNode } from "react";
import { headers } from "next/headers";
import { getMethodSession } from "@/lib/method/auth";
import { MethodHeader } from "./_components/MethodHeader";

export const metadata: Metadata = {
  title: "The Roadman Method",
  description:
    "Twelve weeks. One framework. Built on conversations with World Tour coaches and sport scientists.",
  robots: { index: false, follow: false },
};

const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  "/method/login",
  "/method/login/check-email",
  "/method/login/verify",
  "/method/checkout",
  "/method/welcome",
]);

/**
 * Server-component gate for /method/*.
 *
 * Reads the request path from the `x-pathname` header (set by the proxy
 * for the route-group layout). For public paths (sales page, login flow,
 * welcome), no session is required. For everything else, no session →
 * redirect to /method/login.
 */
export default async function MethodLayout({ children }: { children: ReactNode }) {
  const hdrs = await headers();
  const pathname =
    hdrs.get("x-pathname") ?? hdrs.get("x-invoke-path") ?? "/method";
  const session = await getMethodSession();

  if (!isPublicPath(pathname) && !session) {
    redirect("/method/login");
  }

  return (
    <div className="min-h-screen bg-charcoal text-off-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-deep-purple)_0%,_var(--color-charcoal)_55%)]"
      />
      <MethodHeader sessionEmail={session?.payload.email ?? null} />
      <main id="method-main" className="pb-24">
        {children}
      </main>
      <footer className="border-t border-white/5 py-8 text-center text-xs text-foreground-muted">
        <p>The Roadman Method · © Roadman Cycling. All access lifetime.</p>
      </footer>
    </div>
  );
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  for (const p of PUBLIC_PATHS) {
    if (pathname.startsWith(`${p}/`)) return true;
  }
  return false;
}
