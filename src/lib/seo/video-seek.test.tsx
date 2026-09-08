import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WatchVideoFrame } from "@/components/features/podcast/WatchVideo";
import { formatVideoTime, getVideoMomentHref, getYouTubeEmbedUrl, parseVideoTime } from "./video-seek";

describe("shareable video moments", () => {
  it.each([["0", 0], ["750", 750], ["12:30", 750], ["1:02:03", 3723], ["90:00", 5400]])(
    "accepts a whole-second timestamp %s", (input, expected) => {
      expect(parseVideoTime(String(input))).toBe(expected);
    },
  );
  it.each([null, "", "-1", "1.5", "12:60", "1:60:00", "0x10", "1e3", "120junk", "Infinity", "9007199254740992"])(
    "rejects invalid timestamps %s", (input) => expect(parseVideoTime(input)).toBeNull(),
  );
  it("round-trips displayed times and leaves the base URL unchanged at zero", () => {
    for (const seconds of [0, 1, 59, 60, 3599, 3600, 86399]) {
      expect(parseVideoTime(formatVideoTime(seconds))).toBe(seconds);
    }
    expect(getVideoMomentHref("https://roadmancycling.com/watch/example", 750)).toBe("https://roadmancycling.com/watch/example?t=750#video");
    expect(getYouTubeEmbedUrl("example", 0)).toBe("https://www.youtube.com/embed/example");
  });
  it("renders a single eager player with YouTube's start parameter and no autoplay", () => {
    const html = renderToStaticMarkup(<WatchVideoFrame youtubeId="example" title="An interview" start={750} />);
    expect(html.match(/<iframe/g)).toHaveLength(1);
    expect(html).toContain('src="https://www.youtube.com/embed/example?start=750"');
    expect(html).not.toContain("autoplay=1");
    expect(html).not.toContain('loading="lazy"');
    expect(html).toContain('id="video"');
  });
});
