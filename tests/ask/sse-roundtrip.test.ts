import { describe, it, expect } from "vitest";
import { createSseStream } from "@/lib/ask/stream";

/**
 * Round-trip test: feed the server-side SSE stream into the same parser
 * the client hook uses. Guarantees the wire format stays compatible
 * across the two sides without needing an actual browser.
 */

interface ParsedFrame {
  event: string;
  data: string;
}

function parseSseBuffer(text: string): ParsedFrame[] {
  const blocks = text.split(/\n\n/).filter((b) => b.trim().length > 0);
  return blocks.map((block) => {
    let event = "message";
    const dataLines: string[] = [];
    for (const line of block.split(/\n/)) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }
    return { event, data: dataLines.join("\n") };
  });
}

describe("ask SSE round-trip", () => {
  it("emits the exact sequence the UI expects for a happy path", async () => {
    const { response, controller } = createSseStream();
    const ctrl = await controller;

    ctrl.enqueue({ type: "meta", data: { sessionId: "s1", intent: "plateau", chunksRetrieved: 3, confidence: "high" } });
    ctrl.enqueue({
      type: "citation",
      data: [
        { type: "episode", source_id: "1", title: "Ep 100 — Seiler", excerpt: "polarised training…" },
      ],
    });
    ctrl.enqueue({ type: "cta", data: { key: "plateau_diagnostic", title: "Take the…", body: "…", href: "/diagnostic/plateau" } });
    ctrl.enqueue({ type: "delta", data: "The short answer is " });
    ctrl.enqueue({ type: "delta", data: "you're probably under-recovered." });
    ctrl.enqueue({ type: "done", data: { messageId: "m1", flaggedForReview: false } });
    ctrl.close();

    const text = await response.text();
    const frames = parseSseBuffer(text);

    const eventTypes = frames.map((f) => f.event);
    expect(eventTypes).toEqual(["meta", "citation", "cta", "delta", "delta", "done"]);

    const meta = JSON.parse(frames[0].data);
    expect(meta.intent).toBe("plateau");
    expect(meta.sessionId).toBe("s1");

    const cites = JSON.parse(frames[1].data);
    expect(cites).toHaveLength(1);
    expect(cites[0].type).toBe("episode");

    expect(JSON.parse(frames[3].data)).toBe("The short answer is ");
    expect(JSON.parse(frames[4].data)).toBe("you're probably under-recovered.");

    const done = JSON.parse(frames[5].data);
    expect(done.messageId).toBe("m1");
    expect(done.flaggedForReview).toBe(false);
  });

  it("preserves delta payloads with newlines, leading spaces, and special chars", async () => {
    // Anthropic token deltas routinely include leading spaces (" Roadman",
    // " is") and the model emits "\n\n" between paragraphs. The previous
    // wire format dropped the second half of any delta containing "\n\n",
    // and the parser's trimStart() ate single leading spaces — both are
    // root causes of "missing words / merged words" in the rendered
    // answer. This test locks in the round-trip guarantee for those
    // payloads.
    const tricky = [
      "paragraph 1\n\nparagraph 2",
      " starts with a space",
      "ends with a space ",
      "line 1\nline 2",
      "\nleading newline",
      "tabs\there",
      'quotes "inside" the value',
      "backslash\\here",
    ];

    const { response, controller } = createSseStream();
    const ctrl = await controller;
    for (const t of tricky) {
      ctrl.enqueue({ type: "delta", data: t });
    }
    ctrl.close();

    const text = await response.text();
    const frames = parseSseBuffer(text);
    expect(frames).toHaveLength(tricky.length);
    for (let i = 0; i < tricky.length; i += 1) {
      expect(frames[i].event).toBe("delta");
      // delta data is JSON-encoded on the wire; the client JSON.parses it
      expect(JSON.parse(frames[i].data)).toBe(tricky[i]);
    }
  });

  it("emits safety event + done for a blocked query", async () => {
    const { response, controller } = createSseStream();
    const ctrl = await controller;

    ctrl.enqueue({ type: "meta", data: { intent: "safety_medical", chunksRetrieved: 0, safetyFlags: ["medical"] } });
    ctrl.enqueue({ type: "safety", data: { flags: ["medical"], templateKey: "medical" } });
    ctrl.enqueue({ type: "cta", data: { key: "none", title: "", body: "", href: "" } });
    ctrl.enqueue({ type: "delta", data: "See a GP first — this sounds medical." });
    ctrl.enqueue({ type: "done", data: { flaggedForReview: true } });
    ctrl.close();

    const text = await response.text();
    const frames = parseSseBuffer(text);
    expect(frames.map((f) => f.event)).toContain("safety");
    const safety = JSON.parse(frames.find((f) => f.event === "safety")!.data);
    expect(safety.flags).toContain("medical");
  });
});
