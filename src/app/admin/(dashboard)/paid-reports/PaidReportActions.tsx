"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PaidReportStatus } from "@/lib/paid-reports/types";
import {
  regenerateReportAction,
  resendReportAction,
  revokeReportAction,
} from "./actions";

/**
 * Inline actions for a single paid-report row. Three controls wired to
 * the matching server actions:
 *
 *  - Resend      → only visible once a PDF has been generated
 *  - Regenerate  → available while the report isn't in a terminal state
 *  - Revoke      → destructive; prompts for a reason before firing
 *
 * `useTransition` gives us a cheap pending indicator and
 * `router.refresh()` after completion picks up the new status row.
 */

interface Props {
  reportId: number;
  status: PaidReportStatus;
}

export function PaidReportActions({ reportId, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canResend =
    status === "delivered" || status === "generated" || status === "failed";
  const canRegenerate = status !== "revoked" && status !== "refunded";
  const canRevoke = status !== "revoked" && status !== "refunded";

  function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    });
  }

  function handleRevoke() {
    const reason = window.prompt(
      "Revoke reason (stored on the audit log):",
      "Refund issued",
    );
    if (reason === null) return;
    run(() => revokeReportAction(reportId, reason));
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs">
      {canResend ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => resendReportAction(reportId))}
          className="text-foreground-subtle hover:text-off-white disabled:opacity-40"
        >
          Resend
        </button>
      ) : null}
      {canRegenerate ? (
        <>
          <span className="text-foreground-subtle">·</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => regenerateReportAction(reportId))}
            className="text-foreground-subtle hover:text-off-white disabled:opacity-40"
          >
            Regenerate
          </button>
        </>
      ) : null}
      {canRevoke ? (
        <>
          <span className="text-foreground-subtle">·</span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleRevoke}
            className="text-red-300/80 hover:text-red-200 disabled:opacity-40"
          >
            Revoke
          </button>
        </>
      ) : null}
      {isPending ? (
        <span className="text-foreground-subtle">…</span>
      ) : null}
      {error ? (
        <span className="text-[10px] text-red-400" title={error}>
          failed
        </span>
      ) : null}
    </span>
  );
}
