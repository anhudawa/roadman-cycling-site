"use client";

import { ASK_EVENTS, trackAsk } from "@/lib/analytics/ask-events";

interface StarterPromptsProps {
  onPick: (prompt: string, starterKey: string) => void;
  sessionId?: string | null;
}

export const STARTER_PROMPTS: Array<{ key: string; label: string; prompt: string }> = [
  {
    key: "plateau",
    label: "Why has my FTP stalled?",
    prompt:
      "My FTP has been stuck for about 18 months. I train 8–10 hours a week, mostly zone 2 with a couple of threshold sessions. What's actually going on and what should I do?",
  },
  {
    key: "fuelling",
    label: "How should I fuel a 3-hour ride?",
    prompt:
      "How many grams of carbs per hour should I be taking in on a 3-hour endurance ride versus a 90-minute threshold session? I'm 75kg and I tend to underfuel.",
  },
  {
    key: "masters",
    label: "Masters recovery — what actually matters?",
    prompt:
      "I'm 47 and recovery is obviously slower than it was at 35. What are the 2–3 things that actually move the needle for masters riders, and what's overrated?",
  },
  {
    key: "event",
    label: "Etape du Tour prep — 16 weeks out",
    prompt:
      "I'm riding the Etape du Tour in 16 weeks. It's 170km with 4,000m of climbing. I can ride 10 hours a week. What does the last 16 weeks actually look like?",
  },
  {
    key: "zone2",
    label: "How do I know if I'm actually in zone 2?",
    prompt:
      "Everyone says to ride zone 2 but my HR and power feel like they tell different stories. How do I actually know I'm in the right zone?",
  },
  {
    key: "strength",
    label: "How much strength training do I really need?",
    prompt:
      "How much strength training per week do I really need as a serious masters road cyclist, and what are the key lifts that matter?",
  },
];

export function StarterPrompts({ onPick, sessionId }: StarterPromptsProps) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
      {STARTER_PROMPTS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => {
            trackAsk({
              name: ASK_EVENTS.STARTER_PROMPT_CLICKED,
              sessionId: sessionId ?? undefined,
              meta: { starter: p.key },
            });
            onPick(p.prompt, p.key);
          }}
          className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/25 px-4 py-3 transition-colors"
        >
          <p className="font-heading text-xs tracking-widest uppercase text-coral mb-1">
            Starter
          </p>
          <p className="text-off-white text-sm font-medium">{p.label}</p>
        </button>
      ))}
    </div>
  );
}
