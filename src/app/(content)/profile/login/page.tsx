import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { getRiderSession } from "@/lib/profile-auth/auth";
import { ProfileLoginForm } from "./ProfileLoginForm";

export const metadata: Metadata = {
  title: "Sign in to your rider profile · Roadman Cycling",
  description: "Get a magic-link email to sign in to your Roadman rider profile.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ error?: string; sent?: string }>;
}

export default async function ProfileLoginPage({ searchParams }: PageProps) {
  const session = await getRiderSession();
  if (session) redirect("/profile");

  const params = await searchParams;
  const showError = params.error === "invalid";
  const showSent = params.sent === "1";

  return (
    <>
      <Header />
      <main>
        <Section>
          <Container width="narrow">
            <header className="mb-6">
              <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
                RIDER PROFILE
              </p>
              <h1 className="font-heading uppercase leading-[0.95] text-3xl sm:text-4xl md:text-5xl text-foreground">
                Sign in
              </h1>
              <p className="mt-3 text-sm md:text-base text-foreground-muted">
                Enter the email you used with any Roadman tool, the Plateau
                Diagnostic, or The Method. We&apos;ll send a one-time sign-in
                link — no password to remember.
              </p>
            </header>

            {showError && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-coral/30 bg-coral/[0.06] p-3 text-sm text-coral"
              >
                That sign-in link is invalid or expired. Request a fresh one below.
              </div>
            )}

            {showSent ? (
              <div className="rounded-xl border border-white/10 bg-charcoal/60 p-6 text-foreground">
                <p className="font-heading uppercase text-xs tracking-[0.25em] text-coral mb-2">
                  CHECK YOUR EMAIL
                </p>
                <p className="text-sm">
                  If we have a profile for that address, a sign-in link is on its
                  way. It expires in 15 minutes and only works once.
                </p>
              </div>
            ) : (
              <ProfileLoginForm />
            )}

            <p className="mt-8 text-xs text-foreground-muted">
              No profile yet? Try the{" "}
              <a href="/plateau" className="text-coral underline">
                free Plateau Diagnostic
              </a>{" "}
              or use any{" "}
              <a href="/tools" className="text-coral underline">
                Roadman tool
              </a>{" "}
              — your first result creates your profile.
            </p>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
