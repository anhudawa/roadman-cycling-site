"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Pill,
  Textarea,
  type PillTone,
} from "@/components/admin/ui";

export interface StageRow {
  stageNumber: number;
  date: string;
  startTown: string;
  finishTown: string;
  distanceKm: string;
  stageType: "ttt" | "itt" | "flat" | "hilly" | "mountain";
  summitFinish: boolean;
  restDayAfter: boolean;
  verifiedAt: string;
  /** Start time pre-formatted as a CEST datetime-local value, or "". */
  startTimeInput: string;
  roadmanTake: string;
}

const TYPE_TONES: Record<StageRow["stageType"], PillTone> = {
  ttt: "info",
  itt: "info",
  flat: "neutral",
  hilly: "warn",
  mountain: "bad",
};

interface RowMessage {
  tone: "good" | "bad";
  lines: string[];
}

export function StagesTable({ stages }: { stages: StageRow[] }) {
  const router = useRouter();
  const [edits, setEdits] = useState<Record<number, { start: string; take: string }>>(
    () =>
      Object.fromEntries(
        stages.map((s) => [s.stageNumber, { start: s.startTimeInput, take: s.roadmanTake }]),
      ),
  );
  const [savingStage, setSavingStage] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, RowMessage>>({});

  function setEdit(stageNumber: number, patch: Partial<{ start: string; take: string }>) {
    setEdits((prev) => ({
      ...prev,
      [stageNumber]: { ...prev[stageNumber], ...patch },
    }));
  }

  async function save(stageNumber: number) {
    const edit = edits[stageNumber];
    setSavingStage(stageNumber);
    setMessages((prev) => {
      const next = { ...prev };
      delete next[stageNumber];
      return next;
    });
    try {
      const res = await fetch("/api/admin/fantasy/stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageNumber,
          startTimeCest: edit.start,
          roadmanTake: edit.take,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const lines: string[] = Array.isArray(data.violations)
          ? data.violations
          : [data.error ?? "Save failed"];
        setMessages((prev) => ({ ...prev, [stageNumber]: { tone: "bad", lines } }));
        return;
      }
      setMessages((prev) => ({ ...prev, [stageNumber]: { tone: "good", lines: ["Saved"] } }));
      router.refresh();
    } catch {
      setMessages((prev) => ({
        ...prev,
        [stageNumber]: { tone: "bad", lines: ["Network error — try again"] },
      }));
    } finally {
      setSavingStage(null);
    }
  }

  return (
    <Card>
      <div className="divide-y divide-[var(--color-border)]">
        {stages.map((stage) => {
          const edit = edits[stage.stageNumber];
          const message = messages[stage.stageNumber];
          return (
            <div key={stage.stageNumber} className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono tabular-nums text-sm text-off-white w-14">
                  St {stage.stageNumber}
                </span>
                <span className="text-sm text-foreground-muted whitespace-nowrap">
                  {new Date(stage.date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="text-sm text-off-white min-w-0 flex-1 truncate">
                  {stage.startTown} → {stage.finishTown}{" "}
                  <span className="text-foreground-subtle">
                    ({stage.distanceKm} km)
                  </span>
                </span>
                <Pill tone={TYPE_TONES[stage.stageType]}>
                  {stage.stageType.toUpperCase()}
                  {stage.summitFinish ? " · summit" : ""}
                </Pill>
                {stage.restDayAfter && <Pill tone="info">rest day after</Pill>}
                {edit.take.trim() !== "" ? (
                  <Pill tone="good">take written</Pill>
                ) : (
                  <Pill tone="neutral">no take</Pill>
                )}
                <span className="text-xs text-foreground-subtle whitespace-nowrap">
                  verified{" "}
                  {new Date(stage.verifiedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 lg:grid-cols-[260px_1fr_auto] gap-3 items-start">
                <div>
                  <label
                    htmlFor={`start-${stage.stageNumber}`}
                    className="block text-xs text-foreground-muted mb-1.5"
                  >
                    Official start (CEST)
                  </label>
                  <Input
                    id={`start-${stage.stageNumber}`}
                    type="datetime-local"
                    value={edit.start}
                    onChange={(e) => setEdit(stage.stageNumber, { start: e.target.value })}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`take-${stage.stageNumber}`}
                    className="block text-xs text-foreground-muted mb-1.5"
                  >
                    Roadman take (2–3 sentences for the daily email)
                  </label>
                  <Textarea
                    id={`take-${stage.stageNumber}`}
                    rows={2}
                    value={edit.take}
                    onChange={(e) => setEdit(stage.stageNumber, { take: e.target.value })}
                    placeholder="What actually matters about this stage…"
                  />
                </div>
                <div className="lg:pt-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => save(stage.stageNumber)}
                    loading={savingStage === stage.stageNumber}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {message && (
                <div
                  className={`mt-2 text-xs ${
                    message.tone === "good"
                      ? "text-[var(--color-good)]"
                      : "text-[var(--color-bad)]"
                  }`}
                >
                  {message.lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
