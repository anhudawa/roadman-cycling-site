"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAskStream, type AskCitation } from "@/app/(marketing)/ask/use-ask-stream";
import { MessageList } from "./MessageList";
import { StarterPrompts } from "./StarterPrompts";

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

export function AskRoadmanClient({ seed = null }: { seed?: AskSeed | null }) {
  const { messages, sessionId, isStreaming, error, submit, hydrate } = useAskStream();
  const [input, setInput] = useState(() => initialPromptFromSeed(seed));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, []);

  useEffect(() => {
    autoGrow();
  }, [input, autoGrow]);

  // Attach seed to the first message only — subsequent turns rely on
  // session-persisted context, and resending would just grow the prompt.
  const sendWithSeed = useCallback(
    async (query: string, starter?: string) => {
      const shouldAttachSeed = seed !== null && !seedConsumedRef.current;
      const seedSignal = shouldAttachSeed && seed
        ? { tool: seed.toolSlug, slug: seed.resultSlug }
        : null;
      if (shouldAttachSeed) seedConsumedRef.current = true;
      await submit(query, { starter, seed: seedSignal });
    },
    [seed, submit],
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
      {!hasMessages && (
        <div className="px-4 md:px-6 pt-6 pb-2">
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

      {error && (
        <div className="mx-4 md:mx-6 mb-2 rounded-md border border-red-400/30 bg-red-500/[0.08] px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="sticky bottom-0 border-t border-white/10 bg-charcoal/95 backdrop-blur px-4 md:px-6 py-3"
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
            placeholder="Ask Roadman a cycling question…"
            rows={1}
            maxLength={2000}
            className="flex-1 resize-none bg-white/[0.04] border border-white/10 focus:border-coral/60 focus:bg-white/[0.07] rounded-lg px-3 py-2 text-off-white placeholder:text-foreground-subtle outline-none transition-colors"
            aria-label="Your question"
          />
          <button
            type="submit"
            disabled={isStreaming || input.trim().length < 2}
            className="font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed text-off-white px-5 py-2.5 rounded-md transition-colors"
          >
            {isStreaming ? "Thinking…" : "Send"}
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
