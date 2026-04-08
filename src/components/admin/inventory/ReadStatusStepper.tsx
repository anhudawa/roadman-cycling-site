"use client";

import { useTransition } from "react";
import { advanceReadStatusAction } from "@/app/admin/inventory/actions";
import type { ReadStatus } from "@/lib/inventory";

const STEPS: { key: ReadStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "script_written", label: "Written" },
  { key: "read_recorded", label: "Recorded" },
  { key: "approved", label: "Approved" },
  { key: "live", label: "Live" },
];

const ADVANCE_LABELS: Record<ReadStatus, string> = {
  pending: "Mark as Written",
  script_written: "Mark as Recorded",
  read_recorded: "Submit for Approval",
  approved: "Mark Live",
  live: "",
};

export function ReadStatusStepper({
  slotId,
  currentStatus,
  isAnthony,
}: {
  slotId: string;
  currentStatus: ReadStatus;
  isAnthony: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const canAdvance =
    currentIndex < STEPS.length - 1 &&
    (currentStatus !== "read_recorded" || isAnthony) &&
    (currentStatus !== "approved" || isAnthony);

  const nextLabel = ADVANCE_LABELS[currentStatus];
  const awaitingAnthony =
    !isAnthony &&
    (currentStatus === "read_recorded" || currentStatus === "approved");

  function handleAdvance() {
    startTransition(() => {
      advanceReadStatusAction(slotId);
    });
  }

  return (
    <div className="space-y-2">
      {/* Step indicators */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step.key} className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isCompleted
                    ? "bg-green-400"
                    : isCurrent
                      ? "bg-coral"
                      : "bg-white/10"
                }`}
              />
              {i < STEPS.length - 1 && (
                <div
                  className={`w-4 h-px ${
                    isCompleted ? "bg-green-400/40" : "bg-white/5"
                  }`}
                />
              )}
            </div>
          );
        })}
        <span className="ml-2 text-[11px] text-foreground-muted">
          {STEPS[currentIndex]?.label ?? "Unknown"}
        </span>
      </div>

      {/* Action button */}
      {canAdvance && nextLabel && (
        <button
          onClick={handleAdvance}
          disabled={isPending}
          className="text-xs px-3 py-1 rounded-md bg-coral/10 text-coral hover:bg-coral/20 transition-colors disabled:opacity-50 font-medium"
        >
          {isPending ? "Saving..." : nextLabel}
        </button>
      )}

      {awaitingAnthony && (
        <span className="text-[11px] text-yellow-400/80 italic">
          Awaiting Anthony
        </span>
      )}
    </div>
  );
}
