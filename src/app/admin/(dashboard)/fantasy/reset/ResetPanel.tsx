"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Input } from "@/components/admin/ui";
import type { ResetPreview } from "@/lib/fantasy/reset";

const SCOPES = [
  {
    scope: "scoring" as const,
    title: "Wipe scoring only",
    description:
      "Un-runs the Tour: deletes results, points, standings, transfers, and captain picks; restores abandoned riders; resets every squad to a fresh Stage 1 selection. Players, teams, and leagues survive.",
  },
  {
    scope: "demo-full" as const,
    title: "Full demo wipe",
    description:
      "Everything above, plus deletes demo-tagged players with their teams, league memberships, and non-official leagues, and removes the fictional demo riders. The Clubhouse league survives. Run this once before launch.",
  },
];

export function ResetPanel({ initialPreview }: { initialPreview: ResetPreview | null }) {
  const router = useRouter();
  const [preview, setPreview] = useState<ResetPreview | null>(initialPreview);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  async function refreshPreview(scope: "scoring" | "demo-full") {
    setBusy(`preview-${scope}`);
    try {
      const response = await fetch("/api/admin/fantasy/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, dryRun: true }),
      });
      const payload = await response.json();
      if (response.ok) setPreview(payload.preview);
      else setBanner({ tone: "bad", text: payload.error ?? "Preview failed." });
    } finally {
      setBusy(null);
    }
  }

  async function run(scope: "scoring" | "demo-full") {
    setBusy(`run-${scope}`);
    setBanner(null);
    try {
      const response = await fetch("/api/admin/fantasy/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, confirm: confirmText }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setBanner({ tone: "bad", text: payload.error ?? "Reset failed." });
        return;
      }
      const d = payload.deleted as ResetPreview;
      setBanner({
        tone: "good",
        text:
          `Reset complete: ${d.stageResults} stage results, ${d.scoringEvents} scoring events, ` +
          `${d.transfers} transfers cleared` +
          (scope === "demo-full"
            ? `; ${d.demoPlayers} demo players, ${d.demoRiders} demo riders, ${d.demoLeagues} demo leagues removed.`
            : "."),
      });
      setConfirmText("");
      setPreview(null);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {banner && (
        <p
          role="status"
          className={`rounded-[var(--radius-admin-md)] border px-4 py-3 text-sm ${
            banner.tone === "good"
              ? "border-[var(--color-good)] bg-[var(--color-good-tint)] text-[var(--color-good)]"
              : "border-[var(--color-bad)] bg-[var(--color-bad-tint)] text-[var(--color-bad)]"
          }`}
        >
          {banner.text}
        </p>
      )}

      {preview && (
        <Card>
          <CardHeader title="What a reset would touch right now" />
          <CardBody compact className="pt-0">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-foreground-muted sm:grid-cols-4">
              <dt>Stage results</dt>
              <dd className="text-foreground">{preview.stageResults}</dd>
              <dt>Scoring events</dt>
              <dd className="text-foreground">{preview.scoringEvents}</dd>
              <dt>Team stage scores</dt>
              <dd className="text-foreground">{preview.teamStageScores}</dd>
              <dt>Transfers</dt>
              <dd className="text-foreground">{preview.transfers}</dd>
              <dt>Abandons to restore</dt>
              <dd className="text-foreground">{preview.abandonedRidersToRestore}</dd>
              <dt>Demo players</dt>
              <dd className="text-foreground">{preview.demoPlayers}</dd>
              <dt>Demo riders</dt>
              <dd className="text-foreground">{preview.demoRiders}</dd>
              <dt>Demo leagues</dt>
              <dd className="text-foreground">{preview.demoLeagues}</dd>
            </dl>
          </CardBody>
        </Card>
      )}

      {SCOPES.map(({ scope, title, description }) => (
        <Card key={scope} tone="danger">
          <CardHeader title={title} subtitle={description} />
          <CardBody compact className="pt-0">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                disabled={busy !== null}
                onClick={() => refreshPreview(scope)}
              >
                {busy === `preview-${scope}` ? "Counting…" : "Preview counts"}
              </Button>
              <Input
                aria-label={`Type RESET to enable the ${title.toLowerCase()}`}
                placeholder="Type RESET to enable"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-48"
              />
              <Button
                variant="secondary"
                disabled={busy !== null || confirmText !== "RESET"}
                onClick={() => run(scope)}
              >
                {busy === `run-${scope}` ? "Resetting…" : title}
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
