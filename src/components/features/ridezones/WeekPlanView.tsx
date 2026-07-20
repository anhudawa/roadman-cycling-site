"use client";

import { useState } from "react";
import { PURPOSE_LABELS } from "@/lib/ridezones/classify";
import { formatWeekPlanText } from "@/lib/ridezones/plan";
import { SYSTEM_LABELS } from "@/lib/ridezones/profile";
import type { WeekPlan } from "@/lib/ridezones/types";

export function WeekPlanView({ plan }: { plan: WeekPlan }) {
  const [openId, setOpenId] = useState<string | null>(plan.sessions[0]?.id ?? null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatWeekPlanText(plan));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/http) — quietly do nothing.
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground-muted">
        <span>
          Focus: <span className="text-off-white">{SYSTEM_LABELS[plan.focusSystem]}</span>
        </span>
        <span>
          Total: <span className="text-off-white">{plan.totalHours}h</span> across{" "}
          <span className="text-off-white">{plan.sessions.length} sessions</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          data-track="ridezones_copy_week"
          className="rounded-md border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground-muted transition-colors hover:border-coral/60 hover:text-off-white"
        >
          {copied ? "Copied" : "Copy week as text"}
        </button>
      </div>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-foreground-muted">{plan.weekNote}</p>

      <div className="space-y-3">
        {plan.sessions.map((session) => {
          const isOpen = openId === session.id;
          return (
            <div
              key={session.id}
              className="rounded-lg border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : session.id)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="w-12 shrink-0 font-heading text-lg uppercase text-coral">
                  {session.day}
                </span>
                <span className="min-w-0 flex-1 font-heading text-lg uppercase tracking-wide text-off-white">
                  {session.title}
                </span>
                <span className="shrink-0 text-sm text-foreground-muted">
                  {PURPOSE_LABELS[session.purpose]} · {session.durationMin} min
                </span>
              </button>
              {isOpen ? (
                <div className="border-t border-white/5 px-4 py-4">
                  <p className="text-sm leading-relaxed text-off-white">{session.structure}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.targets.map((target) => (
                      <span
                        key={target.text}
                        className="rounded-md bg-purple/40 px-2.5 py-1 text-xs font-semibold text-off-white"
                      >
                        {target.text}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Why it works
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                        {session.whyItWorks}
                        {session.expertRef ? (
                          <span className="mt-1 block text-xs text-foreground-subtle">
                            Traces to: {session.expertRef}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Before you clip in
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                        {session.preRideAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
