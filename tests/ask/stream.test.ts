import { describe, it, expect } from "vitest";
import { sseFormat, createSseStream } from "@/lib/ask/stream";

describe("ask/stream", () => {
  it("sseFormat encodes a string data event", () => {
    const bytes = sseFormat({ type: "delta", data: "hello" });
    const text = new TextDecoder().decode(bytes);
    expect(text).toBe("event: delta\ndata: hello\n\n");
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
    expect(text).toContain("event: delta\ndata: hi\n\n");
  });

  it("enqueue after close does not throw", async () => {
    const { controller } = createSseStream();
    const ctrl = await controller;
    ctrl.close();
    expect(() => ctrl.enqueue({ type: "delta", data: "late" })).not.toThrow();
  });
});
