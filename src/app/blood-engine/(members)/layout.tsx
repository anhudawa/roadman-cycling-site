import { MembersHeader } from "../MembersHeader";

/**
 * Layout for the Blood Engine members area.
 *
 * Wraps the authenticated routes (dashboard, new report, report view, compare,
 * account) with the MembersHeader — a product-scoped sub-nav that replaces the
 * main Roadman site nav when you're inside the product.
 *
 * This layout is a sibling to the public BE layout (landing, markers, login).
 * Each page still calls requireBloodEngineAccess() — the layout doesn't try to
 * enforce auth itself because layouts aren't a security boundary in the
 * standard Next.js threat model.
 */
export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-deep">
      <MembersHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
