import { describe, it, expect } from "vitest";
import { sseFormat, createSseStream } from "@/lib/ask/stream";

describe("ask/stream", () => {
  it("sseFormat JSON-encodes string data so newlines and leading spaces survive", () => {
    const bytes = sseFormat({ type: "delta", data: "hello" });
    const text = new TextDecoder().decode(bytes);
    expect(text).toBe(`event: delta\ndata: "hello"\n\n`);

    // The whole point of JSON-encoding strings: payloads with embedded
    // newlines or leading spaces round-trip cleanly.
    const tricky = sseFormat({ type: "delta", data: " a\n\nb" });
    const trickyText = new TextDecoder().decode(tricky);
    expect(trickyText).toBe(`event: delta\ndata: " a\\n\\nb"\n\n`);
  });

  it("sseFormat splits multi-line string data into multiple data: lines", () => {
    // Per SSE spec, every line of the data field needs its own `data:` prefix.
    // Without this, the wire collapses into a malformed frame and the client
    // silently drops everything after the first `\n` in a delta chunk.
    const bytes = sseFormat({ type: "delta", data: "first\nsecond" });
    const text = new TextDecoder().decode(bytes);
    expect(text).toBe("event: delta\ndata: first\ndata: second\n\n");
  });

  it("sseFormat preserves a leading space inside a single-line data event", () => {
    // Anthropic streams tokens like " the" with a leading space. The wire
    // format already inserts a separator space after `data:`, so the
    // payload-leading space is the second one — both must survive.
    const bytes = sseFormat({ type: "delta", data: " hello" });
    const text = new TextDecoder().decode(bytes);
    expect(text).toBe("event: delta\ndata:  hello\n\n");
  });

  it("sseFormat encodes a JSON data event", () => {
    const bytes = sseFormat({ type: "meta", data: { intent: "plateau", chunksRetrieved: 3 } });
    const text = new TextDecoder().decode(bytes);
    expect(text.startsWith("event: meta\ndata: ")).toBe(true);
    expect(text.endsWith("\n\n")).toBe(true);
    const payload = JSON.parse(text.replace("event: meta\ndata: ", "").replace(/\n\n$/, ""));
    expect(payload.intent).toBe("plateau");
  });

  it("createSseStream returns a streaming Response with SSE headers", async () => {
    const { response, controller } = createSseStream();
    const ctrl = await controller;
    ctrl.enqueue({ type: "meta", data: { sessionId: "abc" } });
    ctrl.enqueue({ type: "delta", data: "hi" });
    ctrl.close();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    expect(response.headers.get("X-Accel-Buffering")).toBe("no");

    const text = await response.text();
    expect(text).toContain("event: meta");
    expect(text).toContain("\"sessionId\":\"abc\"");
    expect(text).toContain(`event: delta\ndata: "hi"\n\n`);
  });

  it("enqueue after close does not throw", async () => {
    const { controller } = createSseStream();
    const ctrl = await controller;
    ctrl.close();
    expect(() => ctrl.enqueue({ type: "delta", data: "late" })).not.toThrow();
  });
});
