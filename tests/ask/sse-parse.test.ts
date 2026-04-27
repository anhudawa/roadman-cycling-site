import { describe, it, expect } from "vitest";
import { parseSseFrames } from "@/lib/ask/sse-parse";

describe("parseSseFrames", () => {
  it("parses a basic event with single-line data", () => {
    const frames = parseSseFrames("event: delta\ndata: hello\n\n");
    expect(frames).toEqual([{ event: "delta", data: "hello" }]);
  });

  it("preserves a leading space in data (only the SSE separator space is stripped)", () => {
    // The wire format is `data: ` + payload. If payload itself starts with a
    // space (e.g. Anthropic emits the BPE token " the"), the wire becomes
    // `data:  the`. The parser must strip exactly one space — leaving " the".
    const frames = parseSseFrames("event: delta\ndata:  the\n\n");
    expect(frames).toEqual([{ event: "delta", data: " the" }]);
  });

  it("preserves multiple leading and internal spaces", () => {
    const frames = parseSseFrames("event: delta\ndata:    spaced\n\n");
    expect(frames).toEqual([{ event: "delta", data: "   spaced" }]);
  });

  it("rejoins multi-line data fields with \\n", () => {
    const frames = parseSseFrames(
      "event: delta\ndata: line one\ndata: line two\n\n",
    );
    expect(frames).toEqual([{ event: "delta", data: "line one\nline two" }]);
  });

  it("preserves a paragraph break between two data lines (blank inner line)", () => {
    // Encoder emits `data: first` / `data: ` / `data: second` for the
    // payload "first\n\nsecond". The middle line's payload is empty.
    const frames = parseSseFrames(
      "event: delta\ndata: first\ndata: \ndata: second\n\n",
    );
    expect(frames).toEqual([
      { event: "delta", data: "first\n\nsecond" },
    ]);
  });

  it("parses multiple frames separated by blank lines", () => {
    const frames = parseSseFrames(
      "event: delta\ndata: a\n\nevent: delta\ndata: b\n\n",
    );
    expect(frames).toHaveLength(2);
    expect(frames[0]).toEqual({ event: "delta", data: "a" });
    expect(frames[1]).toEqual({ event: "delta", data: "b" });
  });

  it("defaults event to \"message\" when no event field is present", () => {
    const frames = parseSseFrames("data: hi\n\n");
    expect(frames).toEqual([{ event: "message", data: "hi" }]);
  });
});
