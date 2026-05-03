"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAskStream, type AskCitation } from "@/app/(marketing)/ask/use-ask-stream";
import { MessageList } from "./MessageList";
import { StarterPrompts } from "./StarterPrompts";
import { track } from "@/lib/analytics/events";

export interface AskSeed {
  /** Canonical tool slug (e.g. "ftp_zones") — forwarded to the orchestrator. */
  toolSlug: string;
  toolTitle: string;
  summary: string;
  primaryCategoryLabel: string | null;
  resultSlug: string;
}

function initialPromptFromSeed(seed: AskSeed | null): string {
  if (!seed) return "";
  return seed.primaryCategoryLabel
    ? `Based on my "${seed.primaryCategoryLabel}" result from the ${seed.toolTitle.toLowerCase()}, what should I do first?`
    : `Based on my ${seed.toolTitle.toLowerCase()} result, what should I do first?`;
}

export function AskRoadmanClient({
  seed = null,
  initialQuestion = "",
}: {
  seed?: AskSeed | null;
  /**
   * Pre-fill the chat input. Used by handoff CTAs on blog/podcast/compare/
   * problem/best/topic pages so the reader lands with the question already
   * primed and can edit before submitting. Loses to `seed` because tool-
   * result seeds carry stronger signal than a contextual handoff prompt.
   */
  initialQuestion?: string;
}) {
  const { messages, sessionId, isStreaming, error, submit, hydrate } = useAskStream();
  const [input, setInput] = useState(() => {
    const seeded = initialPromptFromSeed(seed);
    if (seeded) return seeded;
    return initialQuestion;
  });
  const messagesRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef(false);
  const hasMessages = messages.length > 0;
  const seedConsumedRef = useRef(false);

  // Rehydrate any prior session so a returning user sees their history.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ask/session", { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as {
          session: { id: string } | null;
          messages: Array<{
            id: string;
            role: "user" | "assistant";
            content: string;
            citations?: unknown;
            ctaRecommended?: string | null;
            safetyFlags?: string[] | null;
          }>;
        };
        if (cancelled || !body.session || body.messages.length === 0) return;
        hydrate({
          sessionId: body.session.id,
          messages: body.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: Array.isArray(m.citations)
              ? (m.citations as unknown as AskCitation[])
              : [],
            safetyFlags: m.safetyFlags ?? [],
          })),
        });
      } catch {
        // silent — starter prompts still work
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  // After the user submits, smoothly scroll the page so the latest
  // exchange (their question + the answer streaming in below it) is in
  // view. We trigger off pendingScrollRef rather than every messages
  // update so streaming tokens don't keep re-scrolling and stealing
  // control from the reader.
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    if (messages.length === 0) return;
    const root = messagesRef.current;
    if (!root) return;
    const userMessages = messages.filter((m) => m.role === "user");
    const last = userMessages[userMessages.length - 1];
    if (!last) return;
    const el = root.querySelector<HTMLElement>(`[data-message-id="${last.id}"]`);
    if (!el) return;
    // Header is ~5rem sticky; offset so the question clears it and the
    // answer below has room to breathe.
    const headerOffset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    pendingScrollRef.current = false;
  }, [messages]);

  // Attach seed to the first message only — subsequent turns rely on
  // session-persisted context, and resending would just grow the prompt.
  const askUsageFiredRef = useRef(false);
  const sendWithSeed = useCallback(
    async (query: string, starter?: string) => {
      const shouldAttachSeed = seed !== null && !seedConsumedRef.current;
      const seedSignal = shouldAttachSeed && seed
        ? { tool: seed.toolSlug, slug: seed.resultSlug }
        : null;
      if (shouldAttachSeed) seedConsumedRef.current = true;
      // Funnel umbrella event: fire once per page-load (the existing
      // ask_question_submitted fires on every turn — we want a session-
      // level "engaged with Ask Roadman" signal for the funnel).
      if (!askUsageFiredRef.current) {
        askUsageFiredRef.current = true;
        track("ask_roadman_used", { sessionId: sessionId ?? undefined });
      }
      // Arm the scroll effect so the next messages update slides the
      // new question (and incoming answer) into view.
      pendingScrollRef.current = true;
      await submit(query, { starter, seed: seedSignal });
    },
    [seed, sessionId, submit],
  );

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    await sendWithSeed(trimmed);
  };

  const onStarter = async (prompt: string, starter: string) => {
    if (isStreaming) return;
    setInput("");
    await sendWithSeed(prompt, starter);
  };

  return (
    <>
      {/* Messages flow as part of the page — no inner scroll context, no
          bordered box. Bottom padding leaves room for the sticky composer
          so the last answer is never hidden behind it. */}
      <div ref={messagesRef} className="pt-6 pb-[14rem]">
        {!hasMessages && (
          <div className="pb-4">
            <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
              Ask anything — training, fuelling, recovery, strength, masters-specific
              questions, or how to prep for an event. Roadman answers with the same
              positions you&rsquo;d hear on the podcast, grounded in Anthony&rsquo;s
              conversations with Dan Lorang, Professor Seiler, Dr David Dunne, and
              the rest of the guest roster.
            </p>
            <p className="font-heading text-xs tracking-widest text-coral uppercase mb-3">
              Try one of these
            </p>
            <StarterPrompts onPick={onStarter} sessionId={sessionId} />
          </div>
        )}
        <MessageList messages={messages} sessionId={sessionId} />
      </div>

      {/* Sticky composer at the viewport bottom. Backdrop blur + a soft
          fade above keeps it readable over scrolling content without
          looking like a boxed widget. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 pointer-events-none"
        style={{ bottom: "var(--cookie-banner-height, 0px)" }}
      >
        <div className="pointer-events-none h-8 bg-gradient-to-t from-charcoal to-transparent" />
        <div className="pointer-events-auto bg-charcoal/85 backdrop-blur-md border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            {error && (
              <div className="mt-3 rounded-md border border-red-400/30 bg-red-500/[0.08] px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <form
              onSubmit={onSubmit}
              className="pt-3"
              style={{
                paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  placeholder="Ask a cycling question…"
                  rows={1}
                  maxLength={2000}
                  className="ask-composer-input flex-1 min-w-0 resize-none bg-white/[0.04] border border-white/10 focus:border-coral/60 focus:bg-white/[0.07] rounded-lg px-3 py-2 min-h-[44px] max-h-[180px] text-off-white placeholder:text-foreground-subtle outline-none transition-colors"
                  aria-label="Your question"
                />
                <button
                  type="submit"
                  disabled={isStreaming || input.trim().length < 2}
                  className="shrink-0 whitespace-nowrap font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed text-off-white px-5 py-3 min-h-[44px] rounded-md transition-colors"
                >
                  {isStreaming ? "…" : "Send"}
                </button>
              </div>
              <p className="text-foreground-subtle text-[11px] mt-1.5">
                Roadman can be wrong. For medical, injury, or extreme-weight questions,
                see a professional first.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
