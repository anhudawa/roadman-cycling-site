"use client";

import { useState } from "react";
import type { AskStreamMessage } from "@/app/(marketing)/ask/use-ask-stream";
import { CitationCard } from "./CitationCard";
import { CtaCard } from "./CtaCard";
import { SafetyBanner } from "./SafetyBanner";
import { ASK_EVENTS, trackAsk } from "@/lib/analytics/ask-events";

interface MessageListProps {
  messages: AskStreamMessage[];
  sessionId: string | null;
}

export function MessageList({ messages, sessionId }: MessageListProps) {
  return (
    <div className="space-y-6 px-4 md:px-6 py-6">
      {messages.map((m) => (
        <MessageRow key={m.id} message={m} sessionId={sessionId} />
      ))}
    </div>
  );
}

function MessageRow({
  message,
  sessionId,
}: {
  message: AskStreamMessage;
  sessionId: string | null;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl bg-purple/80 text-off-white px-4 py-3 shadow-sm">
          <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <div className="max-w-full md:max-w-[88%]">
        {message.safetyFlags && message.safetyFlags.length > 0 && (
          <SafetyBanner flags={message.safetyFlags} />
        )}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-5 py-4">
          <p className="font-heading text-coral tracking-widest text-xs uppercase mb-2">
            Ask Roadman
          </p>
          <div className="text-off-white text-[0.95rem] leading-relaxed whitespace-pre-wrap min-h-[1.5em]">
            {message.content}
            {message.streaming && (
              <span
                className="inline-block w-2 h-4 ml-1 bg-coral align-middle"
                style={{ animation: "ask-blink 1.1s steps(2, start) infinite" }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-3">
            <p className="font-heading text-xs tracking-widest text-foreground-muted uppercase mb-2">
              Sources
            </p>
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
              {message.citations.map((c) => (
                <CitationCard key={`${c.type}:${c.source_id}`} citation={c} />
              ))}
            </div>
          </div>
        )}

        {message.cta && message.cta.key !== "none" && (
          <CtaCard
            cta={message.cta}
            sessionId={sessionId}
            messageId={message.id}
          />
        )}

        {!message.streaming && !message.safetyFlags?.length && (
          <FeedbackRow sessionId={sessionId} messageId={message.id} />
        )}
      </div>
    </div>
  );
}

function FeedbackRow({
  sessionId,
  messageId,
}: {
  sessionId: string | null;
  messageId: string;
}) {
  const [submitted, setSubmitted] = useState<"up" | "down" | null>(null);

  const send = async (rating: "up" | "down") => {
    if (submitted) return;
    setSubmitted(rating);
    try {
      await fetch("/api/ask/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          sessionId: sessionId ?? undefined,
          rating,
        }),
      });
      trackAsk({
        name: ASK_EVENTS.FEEDBACK_SUBMITTED,
        sessionId: sessionId ?? undefined,
        meta: { messageId, rating },
      });
    } catch {
      // silent — feedback should never break the UI
    }
  };

  if (!messageId || messageId.startsWith("a-")) return null;

  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-foreground-subtle">
      <span>Helpful?</span>
      <button
        type="button"
        onClick={() => send("up")}
        disabled={submitted !== null}
        className={`px-2 py-1 rounded border border-white/10 hover:border-white/25 hover:text-off-white transition-colors ${submitted === "up" ? "bg-white/10 text-off-white" : ""}`}
        aria-label="Helpful"
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => send("down")}
        disabled={submitted !== null}
        className={`px-2 py-1 rounded border border-white/10 hover:border-white/25 hover:text-off-white transition-colors ${submitted === "down" ? "bg-white/10 text-off-white" : ""}`}
        aria-label="Not helpful"
      >
        👎
      </button>
      {submitted && <span className="ml-1">Thanks — noted.</span>}
    </div>
  );
}
