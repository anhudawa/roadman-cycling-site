/**
 * Client SSE consumer for Ask Roadman.
 *
 * Why a custom parser instead of EventSource: EventSource can't POST a
 * JSON body, and we want the question in the request body (not the
 * URL). So we `fetch` with a streaming response and chunk-parse the
 * `event: ...\ndata: ...\n\n` frames ourselves.
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { trackAsk, ASK_EVENTS } from "@/lib/analytics/ask-events";
import { parseSseFrames } from "@/lib/ask/sse-parse";

export interface AskCitation {
  type: "episode" | "methodology" | "content_chunk";
  source_id: string;
  title: string;
  url?: string | null;
  excerpt: string;
}

export interface AskCta {
  key: string;
  title: string;
  body: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface AskStreamMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: AskCitation[];
  cta?: AskCta | null;
  safetyFlags?: string[];
  streaming?: boolean;
  flaggedForReview?: boolean;
}

export interface AskSeedSignal {
  tool: string;
  slug: string;
}

export interface UseAskStreamResult {
  messages: AskStreamMessage[];
  sessionId: string | null;
  isStreaming: boolean;
  error: string | null;
  submit: (
    query: string,
    opts?: { starter?: string; seed?: AskSeedSignal | null },
  ) => Promise<void>;
  reset: () => void;
  hydrate: (args: {
    sessionId: string;
    messages: AskStreamMessage[];
  }) => void;
}

export function useAskStream(): UseAskStreamResult {
  const [messages, setMessages] = useState<AskStreamMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  const hydrate = useCallback(
    (args: { sessionId: string; messages: AskStreamMessage[] }) => {
      setSessionId(args.sessionId);
      setMessages(args.messages);
    },
    [],
  );

  const submit = useCallback(
    async (
      query: string,
      opts?: { starter?: string; seed?: AskSeedSignal | null },
    ) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) return;
      if (isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const userMsg: AskStreamMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantId = `a-${Date.now()}`;
      const assistantMsg: AskStreamMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      trackAsk({
        name: ASK_EVENTS.QUESTION_SUBMITTED,
        sessionId: sessionId ?? undefined,
        meta: {
          length: trimmed.length,
          ...(opts?.starter ? { starter: opts.starter } : {}),
        },
      });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            sessionId: sessionId ?? undefined,
            seed: opts?.seed ?? undefined,
          }),
          signal: controller.signal,
        });

        if (res.status === 429) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: { message?: string; retryAfterSeconds?: number };
          };
          const msg = body?.error?.message ?? "Hold up — too many questions. Try again in a minute.";
          setError(msg);
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, streaming: false, content: msg } : m)),
          );
          trackAsk({
            name: ASK_EVENTS.RATE_LIMITED,
            sessionId: sessionId ?? undefined,
            meta: { retryAfterSeconds: body?.error?.retryAfterSeconds ?? null },
          });
          return;
        }

        if (!res.ok || !res.body) {
          throw new Error(`Bad response ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentSessionId: string | null = sessionId;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frameEndIdx = buffer.lastIndexOf("\n\n");
          if (frameEndIdx === -1) continue;
          const complete = buffer.slice(0, frameEndIdx + 2);
          buffer = buffer.slice(frameEndIdx + 2);
          const frames = parseSseFrames(complete);

          for (const frame of frames) {
            if (frame.event === "meta") {
              let payload: Record<string, unknown> = {};
              try {
                payload = JSON.parse(frame.data) as Record<string, unknown>;
              } catch {
                continue;
              }
              if (typeof payload.sessionId === "string" && !currentSessionId) {
                currentSessionId = payload.sessionId;
                setSessionId(payload.sessionId);
                trackAsk({
                  name: ASK_EVENTS.SESSION_STARTED,
                  sessionId: payload.sessionId,
                });
              }
              if (typeof payload.intent === "string") {
                trackAsk({
                  name: ASK_EVENTS.INTENT_CLASSIFIED,
                  sessionId: currentSessionId ?? undefined,
                  meta: {
                    intent: payload.intent,
                    confidence: typeof payload.confidence === "string" ? payload.confidence : null,
                    chunksRetrieved:
                      typeof payload.chunksRetrieved === "number" ? payload.chunksRetrieved : null,
                  },
                });
              }
            } else if (frame.event === "delta") {
              // data is raw text (may contain newlines — sse.enqueue for string data)
              const text = frame.data;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: (m.content ?? "") + text } : m,
                ),
              );
            } else if (frame.event === "citation") {
              try {
                const cites = JSON.parse(frame.data) as AskCitation[];
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, citations: cites } : m)),
                );
                trackAsk({
                  name: ASK_EVENTS.CITATION_SHOWN,
                  sessionId: currentSessionId ?? undefined,
                  meta: { count: cites.length },
                });
              } catch {
                // ignore
              }
            } else if (frame.event === "cta") {
              try {
                const cta = JSON.parse(frame.data) as AskCta;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, cta } : m)),
                );
                if (cta.key !== "none") {
                  trackAsk({
                    name: ASK_EVENTS.CTA_SHOWN,
                    sessionId: currentSessionId ?? undefined,
                    meta: { ctaKey: cta.key, href: cta.href },
                  });
                }
              } catch {
                // ignore
              }
            } else if (frame.event === "safety") {
              try {
                const payload = JSON.parse(frame.data) as {
                  flags?: string[];
                  templateKey?: string | null;
                };
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, safetyFlags: payload.flags ?? [] } : m,
                  ),
                );
                trackAsk({
                  name: ASK_EVENTS.SAFETY_TRIGGERED,
                  sessionId: currentSessionId ?? undefined,
                  meta: {
                    flags: (payload.flags ?? []).join(","),
                    template: payload.templateKey ?? null,
                  },
                });
              } catch {
                // ignore
              }
            } else if (frame.event === "done") {
              try {
                const payload = JSON.parse(frame.data) as {
                  messageId?: string;
                  flaggedForReview?: boolean;
                };
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          streaming: false,
                          id: payload.messageId ?? m.id,
                          flaggedForReview: Boolean(payload.flaggedForReview),
                        }
                      : m,
                  ),
                );
                trackAsk({
                  name: ASK_EVENTS.ANSWER_STREAMED,
                  sessionId: currentSessionId ?? undefined,
                  meta: { messageId: payload.messageId ?? null },
                });
              } catch {
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
                );
              }
            } else if (frame.event === "error") {
              try {
                const payload = JSON.parse(frame.data) as { message?: string };
                const errMsg = payload.message ?? "Something went wrong. Try again.";
                setError(errMsg);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, streaming: false, content: errMsg } : m,
                  ),
                );
                trackAsk({
                  name: ASK_EVENTS.ERROR_SHOWN,
                  sessionId: currentSessionId ?? undefined,
                  meta: { message: errMsg },
                });
              } catch {
                // ignore
              }
            }
          }
        }
      } catch (err) {
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        if (!isAbort) {
          const msg = "Connection interrupted. Please try again.";
          setError(msg);
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, streaming: false, content: msg } : m)),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, sessionId],
  );

  return { messages, sessionId, isStreaming, error, submit, reset, hydrate };
}
