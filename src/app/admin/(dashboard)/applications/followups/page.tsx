import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { listNdyFollowups } from "@/lib/ndy/application-workflow";
import { ndyApplicationFlowEnabled } from "@/lib/ndy/application-offer";
import { RetryDelivery } from "./RetryDelivery";

export const dynamic = "force-dynamic";
const emailLabels: Record<string, string> = {
  pending: "Email queued", processing: "Preparing email", enrolling: "Contacting Beehiiv",
  enrolled: "Beehiiv accepted", failed: "Email needs attention", uncertain: "Check Beehiiv before resending",
  suppressed: "Email held",
};

export default async function NdyFollowupsPage() {
  await requireAuth();
  const enabled = ndyApplicationFlowEnabled();
  const rows = enabled ? await listNdyFollowups() : [];
  return <div className="mx-auto max-w-6xl p-6">
    <Link href="/admin/applications" className="text-sm text-[var(--color-fg)] underline">Back to applications</Link>
    <h1 className="mt-5 font-heading text-3xl text-off-white">NOT DONE YET FOLLOW-UP</h1>
    <p className="mt-3 text-base text-foreground-muted">Application emails, checkout interest and questions for Sarah. Beehiiv acceptance confirms enrollment in the automation; delivery and opens are available in Beehiiv.</p>
    {!enabled ? <p className="mt-8 rounded-lg border border-amber-300/30 p-5 text-base text-amber-100">The new follow-up workflow is not active yet. Finish the database and Beehiiv setup, then enable it.</p> : rows.length === 0 ? <p className="mt-8 text-base text-foreground-muted">No applications have entered this workflow yet.</p> : <div className="mt-8 space-y-5">
      <p className="text-sm text-foreground-muted">Latest {rows.length} application follow-ups</p>
      {rows.map((row) => <article key={row.id} className="rounded-lg border border-white/15 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-xl font-semibold text-off-white">{row.name}</h2><a className="break-all text-sm text-[var(--color-fg)] underline" href={`mailto:${row.email}`}>{row.email}</a><p className="mt-2 text-sm text-foreground-muted">Application #{row.applicationId} · {row.createdAt.toISOString().slice(0, 10)} · {row.fit === "ready" ? "Automatic fit screen passed" : "Fit discussion suggested"}</p></div>
          <span className="rounded-md border border-white/15 px-3 py-2 text-sm text-off-white">{emailLabels[row.emailStatus] ?? row.emailStatus}</span>
        </div>
        {row.emailError && <p className="mt-4 text-sm text-amber-200">{row.emailError}</p>}
        {row.emailStatus === "failed" && <RetryDelivery id={row.id} target="email" />}
        {row.checkoutStartedAt && <p className="mt-4 text-sm text-foreground-muted">Opened Skool checkout · {row.checkoutStartedAt.toISOString().slice(0, 16).replace("T", " ")} UTC</p>}
        {row.questionReceivedAt && <div className="mt-5 border-t border-white/10 pt-5">
          <h3 className="font-semibold text-off-white">Question for Sarah</h3>
          <p className="mt-3 whitespace-pre-wrap break-words text-base leading-7 text-off-white">{row.question}</p>
          <p className="mt-3 text-sm text-foreground-muted">Sarah’s email: {row.sarahStatus === "sent" ? "sent" : ["failed", "held"].includes(row.sarahStatus) ? "needs attention" : "queued"}</p>
          {row.sarahError && <p className="mt-2 text-sm text-amber-200">{row.sarahError}</p>}
          {row.sarahStatus === "failed" && <RetryDelivery id={row.id} target="sarah" />}
          <a href={`mailto:${row.email}?subject=Your%20Not%20Done%20Yet%20question`} className="mt-4 inline-block min-h-11 rounded-md bg-[var(--color-raised)] px-4 py-3 text-sm font-semibold text-[var(--color-fg)]">Reply to applicant</a>
        </div>}
      </article>)}
    </div>}
  </div>;
}
