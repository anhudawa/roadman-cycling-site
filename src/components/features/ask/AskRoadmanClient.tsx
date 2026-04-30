"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAskStream, type AskCitation } from "@/app/(marketing)/ask/use-ask-stream";
import { trackAsk, ASK_EVENTS } from "@/lib/analytics/ask-events";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;
  const seedConsumedRef = useRef(false);

  const [seed, setSeed] = useState<SeedBanner | null>(null);
  const seedConsumedRef = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Load seed context if the URL carries seed_tool/seed_result params.
  useEffect(() => {
    const tool = searchParams.get("seed_tool");
    const slugRaw = searchParams.get("seed_result");
    if (!tool || !slugRaw) return;
    const slug = decodeURIComponent(slugRaw);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/ask/seed?tool=${encodeURIComponent(tool)}&slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const body = (await res.json()) as { seed?: Omit<SeedBanner, "tool" | "slug"> | null };
        if (cancelled || !body.seed) return;
        setSeed({ ...body.seed, tool, slug });
        setInput(body.seed.suggestedPrompt);
        trackAsk({
          name: ASK_EVENTS.SEED_LOADED,
          meta: { tool, slug },
        });
      } catch {
        // silent — banner just won't show
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

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

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, []);

  useEffect(() => {
    autoGrow();
  }, [input, autoGrow]);

  useEffect(() => {
    const el = scrollBodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
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
    <div className="flex flex-col h-full">
      {/* Single scrollable body — starter prompts + messages share one scroll context
          so the form is always visible outside the scrollable area on all screen sizes */}
      <div ref={scrollBodyRef} className="flex-1 overflow-y-auto min-h-0">
        {!hasMessages && (
          <div className="px-4 md:px-6 pt-6 pb-4">
            <p className="text-foreground-muted text-sm mb-4">
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

      {error && (
        <div className="mx-4 md:mx-6 mb-2 rounded-md border border-red-400/30 bg-red-500/[0.08] px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="border-t border-white/10 bg-charcoal/95 backdrop-blur px-4 md:px-6 pt-3"
        style={{
          // Honour iOS home-indicator safe area so the helper text and
          // tap targets don't sit under the gesture zone. max() keeps the
          // 12px floor on every other platform.
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
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
            className="flex-1 min-w-0 resize-none bg-white/[0.04] border border-white/10 focus:border-coral/60 focus:bg-white/[0.07] rounded-lg px-3 py-2 text-off-white placeholder:text-foreground-subtle outline-none transition-colors"
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
  );
}
