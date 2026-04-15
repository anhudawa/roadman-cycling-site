import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { requireBloodEngineAccess } from "@/lib/blood-engine/access";
import { listReports } from "@/lib/blood-engine/db";
import { MedicalDisclaimer } from "../../MedicalDisclaimer";
import { DangerZone } from "./DangerZone";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireBloodEngineAccess();
  const reports = await listReports(user.id);

  return (
    <Section background="deep-purple">
      <Container width="narrow">
        <p className="font-heading tracking-[0.3em] text-coral text-sm mb-4">
          Account
        </p>
        <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white mb-10">
          Your data, your call
        </h1>

        {/* ── Account summary ───────────────────────────────── */}
        <div className="rounded-lg border border-white/10 bg-background-elevated p-6 mb-6">
          <h2 className="font-heading uppercase text-off-white text-2xl mb-4">
            On file
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle mb-1">
                Email
              </dt>
              <dd className="text-off-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle mb-1">
                Member since
              </dt>
              <dd className="text-off-white">
                {user.createdAt?.toLocaleDateString?.() ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle mb-1">
                Reports run
              </dt>
              <dd className="text-off-white">{reports.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle mb-1">
                Terms accepted
              </dt>
              <dd className="text-off-white">
                {user.tosAcceptedAt
                  ? `Yes (${user.tosVersion ?? "v?"} on ${user.tosAcceptedAt
                      .toISOString()
                      .slice(0, 10)})`
                  : "Not yet"}
              </dd>
            </div>
          </dl>
        </div>

        {/* ── Sign out ──────────────────────────────────────── */}
        <form
          action="/api/blood-engine/auth/logout"
          method="post"
          className="rounded-lg border border-white/10 bg-background-elevated p-6 mb-6 flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <h2 className="font-heading uppercase text-off-white text-xl">
              Sign out of this device
            </h2>
            <p className="text-sm text-foreground-muted mt-1">
              Clears your sign-in cookie. You can sign back in at any time.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center font-heading tracking-wider uppercase rounded-md px-6 py-3 text-base bg-transparent hover:bg-white/5 text-off-white border border-white/20 hover:border-white/40 cursor-pointer transition-all"
          >
            Sign out
          </button>
        </form>

        {/* ── Data export ───────────────────────────────────── */}
        <div className="rounded-lg border border-white/10 bg-background-elevated p-6 mb-6">
          <h2 className="font-heading uppercase text-off-white text-xl mb-2">
            Download your data
          </h2>
          <p className="text-sm text-foreground-muted mb-4">
            One JSON file containing every blood report, every interpretation,
            and the context you submitted. Yours to keep — share with your GP,
            archive, or just have a copy.
          </p>
          <Button href="/api/blood-engine/me/export" variant="outline">
            Download all data (JSON)
          </Button>
        </div>

        {/* ── Danger zone ───────────────────────────────────── */}
        <DangerZone />

        <div className="mt-12">
          <MedicalDisclaimer variant="muted" />
        </div>
      </Container>
    </Section>
  );
}
