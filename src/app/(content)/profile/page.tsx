import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { getRiderSession } from "@/lib/profile-auth/auth";
import { getMethodSession } from "@/lib/method/auth";
import { loadByEmail } from "@/lib/rider-profile/store";
import { deriveWattsPerKg } from "@/lib/rider-profile/types";
import { db } from "@/lib/db";
import { toolResults, methodEnrollments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ProfileForm } from "./_components/ProfileForm";
import { LogoutButton } from "./_components/LogoutButton";

export const metadata: Metadata = {
  title: "Your rider profile · Roadman Cycling",
  description:
    "Your unified rider profile — FTP, weight, goals, training context. Powers personalised tools, diagnostics, and recommendations.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /profile — unified rider dashboard.
 *
 * Resolves the signed-in rider from either the rider_session cookie
 * (anyone with a profile row) or the method_session cookie (paid
 * Method members get implicit access without a second magic link).
 */
export default async function ProfilePage() {
  const riderSession = await getRiderSession();
  let email = riderSession?.profile.email ?? null;

  if (!email) {
    // Method members are riders too — fall back to their session.
    const methodSession = await getMethodSession().catch(() => null);
    if (methodSession) email = methodSession.enrollment.email;
  }

  if (!email) redirect("/profile/login");

  const profile = await loadByEmail(email);
  if (!profile) redirect("/profile/login?error=missing");

  // History strip across all tools.
  const recentTools = await db
    .select({
      slug: toolResults.slug,
      toolSlug: toolResults.toolSlug,
      summary: toolResults.summary,
      primaryResult: toolResults.primaryResult,
      createdAt: toolResults.createdAt,
    })
    .from(toolResults)
    .where(eq(toolResults.riderProfileId, profile.id))
    .orderBy(desc(toolResults.createdAt))
    .limit(6);

  const [enrollment] = await db
    .select({
      status: methodEnrollments.status,
      paidAt: methodEnrollments.paidAt,
      dripStartAt: methodEnrollments.dripStartAt,
    })
    .from(methodEnrollments)
    .where(eq(methodEnrollments.email, profile.email))
    .limit(1);

  const wkg = deriveWattsPerKg(profile);

  return (
    <>
      <Header />
      <main>
        <Section>
          <Container width="narrow">
            <header className="mb-8">
              <p className="font-heading text-xs tracking-[0.3em] text-coral mb-2">
                YOUR RIDER PROFILE
              </p>
              <h1 className="font-heading uppercase leading-[0.95] text-3xl sm:text-4xl md:text-5xl text-foreground">
                {profile.firstName ? `Hi, ${profile.firstName}` : "Your profile"}
              </h1>
              <p className="mt-3 text-sm md:text-base text-foreground-muted">
                The numbers below feed every Roadman tool, diagnostic, and
                personalised recommendation. Edit anything that&apos;s wrong —
                changes propagate next time you use the calculators.
              </p>
            </header>

            {/* Snapshot row */}
            <section
              aria-label="Profile snapshot"
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
            >
              <Snapshot label="FTP" value={profile.currentFtp ? `${profile.currentFtp} W` : "—"} />
              <Snapshot
                label="Weight"
                value={
                  profile.currentWeight
                    ? `${profile.currentWeight} ${profile.weightUnit ?? "kg"}`
                    : "—"
                }
              />
              <Snapshot label="W/kg" value={wkg ? wkg.toFixed(2) : "—"} />
              <Snapshot
                label="Limiter"
                value={limiterLabel(profile.biggestLimiter)}
              />
            </section>

            {enrollment?.status === "active" && (
              <div className="mb-8 rounded-xl border border-coral/30 bg-coral/[0.06] p-4 text-sm text-foreground">
                <p className="font-heading text-xs tracking-[0.25em] text-coral mb-1">
                  THE METHOD
                </p>
                <p>
                  You&apos;re an active Method member.{" "}
                  <a href="/method/dashboard" className="text-coral underline">
                    Open your dashboard →
                  </a>
                </p>
              </div>
            )}

            <ProfileForm initialProfile={profile} />

            {recentTools.length > 0 && (
              <section aria-label="Tool history" className="mt-12">
                <h2 className="font-heading uppercase text-xl text-foreground mb-3">
                  Recent tool results
                </h2>
                <ul className="space-y-2">
                  {recentTools.map((r) => (
                    <li
                      key={r.slug}
                      className="rounded-lg border border-white/10 bg-charcoal/60 p-3"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-heading uppercase text-xs tracking-[0.2em] text-coral">
                          {toolLabel(r.toolSlug)}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          {r.createdAt.toLocaleDateString("en-GB")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{r.summary}</p>
                      <a
                        href={resultsHref(r.toolSlug, r.slug)}
                        className="mt-1 inline-block text-xs text-coral underline"
                      >
                        Open result →
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-12 flex justify-between text-sm">
              <a href="/privacy" className="text-foreground-muted underline">
                What we store and why
              </a>
              <LogoutButton />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-charcoal/60 p-3">
      <p className="font-heading uppercase text-[10px] tracking-[0.25em] text-foreground-muted">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl text-foreground">{value}</p>
    </div>
  );
}

function limiterLabel(slug: string | null): string {
  switch (slug) {
    case "fuelling":
      return "Fuelling deficit";
    case "strength":
      return "Strength gap";
    case "intensity-distribution":
      return "Polarisation";
    case "recovery":
      return "Under-recovered";
    default:
      return "—";
  }
}

function toolLabel(slug: string): string {
  switch (slug) {
    case "plateau":
      return "Plateau Diagnostic";
    case "fuelling":
      return "Fuelling";
    case "ftp_zones":
      return "FTP Zones";
    default:
      return slug;
  }
}

function resultsHref(toolSlug: string, slug: string): string {
  if (toolSlug === "plateau") return `/diagnostic/${slug}`;
  return `/results/${toolSlug.replace("_", "-")}/${slug}`;
}
