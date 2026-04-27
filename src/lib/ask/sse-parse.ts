/**
 * Pure SSE-frame parser shared by the Ask Roadman client hook and round-trip
 * tests. The browser-side `EventSource` can't POST a JSON body, so we hand-
 * parse `event: …\ndata: …\n\n` frames over a streaming `fetch`.
 *
 * Spec: https://html.spec.whatwg.org/multipage/server-sent-events.html
 *
 * Two details that bit us in production:
 *  - The data field is preceded by a SINGLE optional space separator. Stripping
 *    all leading whitespace (e.g. with `trimStart()`) drops intentional spaces
 *    in streamed text deltas (Anthropic emits tokens like " the").
 *  - Multi-line data MUST be sent as multiple `data:` lines on the wire — each
 *    line is then rejoined with `\n` here. The encoder in `./stream.ts` is
 *    responsible for splitting; this parser only reassembles.
 */

export interface SseFrame {
  event: string;
  data: string;
}

export function parseSseFrames(chunk: string): SseFrame[] {
  return chunk
    .split(/\n\n/)
    .filter((block) => block.trim().length > 0)
    .map((block) => {
      const lines = block.split(/\n/);
      let event = "message";
      const dataLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const value = line.slice(5);
          dataLines.push(value.startsWith(" ") ? value.slice(1) : value);
        }
      }
      return { event, data: dataLines.join("\n") };
    });
}
