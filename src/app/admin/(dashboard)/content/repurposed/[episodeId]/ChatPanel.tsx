"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getChatHistory } from "../actions";

type ChatMessage = {
  id?: number;
  role: "user" | "assistant";
  message: string;
};

export default function ChatPanel({
  contentId,
  onContentUpdated,
}: {
  contentId: number;
  onContentUpdated: (newContent: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or streaming text updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  // Load chat history on mount
  useEffect(() => {
    let cancelled = false;
    getChatHistory(contentId).then((history) => {
      if (!cancelled) {
        setMessages(
          history.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            message: m.message,
          })),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    // Optimistic UI: add user message
    setMessages((prev) => [...prev, { role: "user", message: text }]);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/admin/content/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }

      // Stream complete — add to messages and notify parent
      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: fullText },
      ]);
      setStreamingText("");
      onContentUpdated(fullText);
    } catch (err) {
      console.error("[ChatPanel] Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
        },
      ]);
      setStreamingText("");
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, contentId, onContentUpdated]);

  return (
    <div className="bg-[#1a1a1b] border-t border-white/5 p-4 rounded-b-xl">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 max-h-80 overflow-y-auto mb-4 scrollbar-thin"
      >
        {messages.length === 0 && !isStreaming && (
          <p className="text-xs text-foreground-subtle text-center py-4">
            Ask Claude to amend this content. Your request will be applied
            automatically.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "bg-[#F16363]/20 text-foreground rounded-lg p-3 ml-auto max-w-[80%]"
                : "bg-white/5 text-foreground rounded-lg p-3 mr-auto max-w-[80%]"
            }
          >
            <p className="text-xs font-semibold text-foreground-subtle mb-1">
              {msg.role === "user" ? "You" : "Claude"}
            </p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.message}
            </p>
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="bg-white/5 text-foreground rounded-lg p-3 mr-auto max-w-[80%]">
            <p className="text-xs font-semibold text-foreground-subtle mb-1">
              Claude
            </p>
            {streamingText ? (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {streamingText}
                <span className="inline-block w-1.5 h-4 bg-coral/60 animate-pulse ml-0.5 align-text-bottom" />
              </p>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-foreground-subtle rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-foreground-subtle rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 bg-foreground-subtle rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask Claude to amend this content..."
          disabled={isStreaming}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg text-foreground text-sm px-3 py-2 placeholder:text-foreground-subtle focus:outline-none focus:border-white/20 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          className="bg-[#F16363] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#F16363]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
