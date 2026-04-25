import type { Metadata } from "next";
import Link from "next/link";
import { Container, Footer, Header, Section } from "@/components/layout";
import { verifyHistoryToken } from "@/lib/tool-results/history-token";
import { listToolResultsByEmail } from "@/lib/tool-results/store";
import { listSubmissionsByEmail } from "@/lib/diagnostic/store";
import { PROFILE_LABELS } from "@/lib/diagnostic/profiles";
import { RequestLinkForm } from "@/components/features/results/RequestLinkForm";
import type { ToolSlug } from "@/lib/tool-results/types";

/**
 * Signed history page. When a valid HMAC token is present in the URL,
 * we render every tool_result and diagnostic_submission under that
 * email, newest first. Otherwise we show the email-capture form that
 * mints and mails a token. Either path is robots:noindex — this page
 * is per-user and must never be crawled.
 */

export const metadata: Metadata = {
  title: "Your saved results — Roadman Cycling",
  description:
    "Every plateau diagnostic, fuelling plan and FTP zone table you've saved, in one place.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type UnifiedItem =
  | {
      kind: "diagnostic";
      slug: string;
      createdAt: Date;
      headline: string;
      tag: string;
      href: string;
      secondary: string | null;
    }
  | {
      kind: "tool";
      slug: string;
      createdAt: Date;
      headline: string;
      tag: string;
      href: string;
      secondary: string | null;
    };

const TOOL_LABEL: Record<ToolSlug, string> = {
  plateau: "Plateau diagnostic",
  fuelling: "Fuelling plan",
  ftp_zones: "FTP zones",
};

function toolPathSegment(slug: ToolSlug): string {
  return slug === "ftp_zones" ? "ftp-zones" : slug;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawToken = params.token;
  const token = typeof rawToken === "string" ? rawToken : null;

  if (!token) {
    return (
      <>
        <Header />
        <main id="main-content">
          <Section background="charcoal" grain className="pt-32 pb-10">
            <Container width="narrow">
              <RequestLinkForm />
            </Container>
          </Section>
        </main>
        <Footer />
      </>
    );
  }

  const verified = verifyHistoryToken(token);
  if (!verified) {
    return (
      <>
        <Header />
        <main id="main-content">
          <Section background="charcoal" grain className="pt-32 pb-10">
            <Container width="narrow">
              <RequestLinkForm tokenStatus="expired" />
            </Container>
          </Section>
        </main>
        <Footer />
      </>
    );
  }

  const [tools, diagnostics] = await Promise.all([
    listToolResultsByEmail(verified.email).catch(() => []),
    listSubmissionsByEmail(verified.email).catch(() => []),
  ]);

  const items: UnifiedItem[] = [
    ...diagnostics.map((d): UnifiedItem => {
      const secondary = d.secondaryProfile
        ? `Secondary: ${PROFILE_LABELS[d.secondaryProfile]}`
        : null;
      return {
        kind: "diagnostic",
        slug: d.slug,
        createdAt: d.createdAt,
        headline: PROFILE_LABELS[d.primaryProfile],
        tag: d.retakeNumber > 1 ? `Plateau diagnostic · retake ${d.retakeNumber}` : "Plateau diagnostic",
        href: `/diagnostic/${d.slug}`,
        secondary,
      };
    }),
    ...tools
      .filter((t) => t.toolSlug !== "plateau")
      .map((t): UnifiedItem => ({
        kind: "tool",
        slug: t.slug,
        createdAt: t.createdAt,
        headline: t.primaryResult ?? t.summary,
        tag: TOOL_LABEL[t.toolSlug],
        href: `/results/${toolPathSegment(t.toolSlug)}/${t.slug}`,
        secondary: t.summary,
      })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="charcoal" grain className="pt-32 pb-8">
          <Container width="narrow">
            <p className="text-coral font-heading text-xs tracking-widest mb-3">
              YOUR SAVED RESULTS
            </p>
            <h1
              className="font-heading text-off-white mb-2 leading-[1]"
              style={{ fontSize: "var(--text-section)" }}
            >
              {verified.email.toUpperCase()}
            </h1>
            <p className="text-foreground-muted text-sm">
              {items.length === 0
                ? "No saved results on this email yet — run a diagnostic or calculator and come back."
                : `${items.length} saved result${items.length === 1 ? "" : "s"} · signed link expires ${formatDate(verified.expiresAt)}.`}
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-0 pb-24">
          <Container width="narrow">
            {items.length === 0 ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/diagnostic"
                  className="rounded-xl border border-white/10 bg-background-elevated p-5 hover:border-coral/40 transition-colors"
                >
                  <p className="font-heading text-coral text-[11px] tracking-widest mb-1">
                    RUN YOUR
                  </p>
                  <p className="font-heading text-off-white text-lg">Plateau diagnostic</p>
                </Link>
                <Link
                  href="/tools/fuelling"
                  className="rounded-xl border border-white/10 bg-background-elevated p-5 hover:border-coral/40 transition-colors"
                >
                  <p className="font-heading text-coral text-[11px] tracking-widest mb-1">
                    BUILD A
                  </p>
                  <p className="font-heading text-off-white text-lg">Fuelling plan</p>
                </Link>
                <Link
                  href="/tools/ftp-zones"
                  className="rounded-xl border border-white/10 bg-background-elevated p-5 hover:border-coral/40 transition-colors"
                >
                  <p className="font-heading text-coral text-[11px] tracking-widest mb-1">
                    CALCULATE
                  </p>
                  <p className="font-heading text-off-white text-lg">FTP zones</p>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.kind}-${item.slug}`}
                    className="bg-background-elevated rounded-xl border border-white/5 hover:border-coral/30 transition-colors"
                  >
                    <Link href={item.href} className="block p-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-heading text-coral text-[11px] tracking-widest">
                          {item.tag.toUpperCase()}
                        </p>
                        <p className="text-foreground-subtle text-xs shrink-0">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <p className="font-heading text-off-white text-lg md:text-xl mt-1">
                        {item.headline}
                      </p>
                      {item.secondary && (
                        <p className="text-foreground-muted text-sm mt-1">
                          {item.secondary}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
