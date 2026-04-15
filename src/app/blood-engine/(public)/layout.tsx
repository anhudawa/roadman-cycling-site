import { Header, Footer } from "@/components/layout";

/**
 * Public Blood Engine layout — main Roadman Header + Footer.
 *
 * Covers: waiting-list landing page, markers reference page,
 * login + verify pages, internal `/preview` sales page.
 * Signed-in members get the separate (members) layout with the MembersHeader
 * instead.
 */
export default function BloodEnginePublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
