import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/v1/training-plan/route";
import { EVENTS, PHASES } from "@/lib/training-plans";

function makeRequest(query: string): Request {
  return new Request(`https://roadmancycling.com/api/v1/training-plan${query}`);
}

describe("GET /api/v1/training-plan", () => {
  it("returns 400 when event is missing", async () => {
    const res = GET(makeRequest(""));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing required query parameter/i);
    expect(Array.isArray(body.availableEvents)).toBe(true);
    expect(body.availableEvents).toContain(EVENTS[0].slug);
  });

  it("returns 404 for an unknown event slug", async () => {
    const res = GET(makeRequest("?event=does-not-exist"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/No training plan found/i);
    expect(body.availableEvents).toEqual(EVENTS.map((e) => e.slug));
  });

  it("returns 404 for an unknown weeksOut", async () => {
    const event = EVENTS[0].slug;
    const res = GET(makeRequest(`?event=${event}&weeksOut=99`));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/No phase found/i);
    expect(Array.isArray(body.availablePhases)).toBe(true);
  });

  it("returns all phases when weeksOut is omitted", async () => {
    const event = EVENTS[0];
    const res = GET(makeRequest(`?event=${event.slug}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.item.event.slug).toBe(event.slug);
    expect(body.item.phases).toHaveLength(PHASES.length);
    expect(body.item.adjacency).toBeNull();
    expect(body.item.phaseQuery).toEqual({ weeksOut: null, phaseSlug: null });
  });

  it("returns one phase + adjacency when weeksOut is a phase slug", async () => {
    const event = EVENTS[0];
    const phase = PHASES.find((p) => p.weeksOut === 8)!;
    const res = GET(makeRequest(`?event=${event.slug}&weeksOut=${phase.slug}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.item.phases).toHaveLength(1);
    expect(body.item.phases[0].slug).toBe(phase.slug);
    expect(body.item.phases[0].weeksOut).toBe(8);
    expect(body.item.phaseQuery).toEqual({ weeksOut: 8, phaseSlug: phase.slug });
    expect(body.item.adjacency).not.toBeNull();
    expect(body.item.adjacency.prev?.weeksOut).toBe(12);
    expect(body.item.adjacency.next?.weeksOut).toBe(4);
  });

  it("accepts numeric weeksOut shorthand", async () => {
    const event = EVENTS[0];
    const res = GET(makeRequest(`?event=${event.slug}&weeksOut=16`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.item.phases).toHaveLength(1);
    expect(body.item.phases[0].weeksOut).toBe(16);
    expect(body.item.adjacency.prev).toBeNull();
    expect(body.item.adjacency.next?.weeksOut).toBe(12);
  });

  it("includes related blog article when event has a blogSlug", async () => {
    const eventWithBlog = EVENTS.find((e) => Boolean(e.blogSlug));
    if (!eventWithBlog) return;
    const res = GET(makeRequest(`?event=${eventWithBlog.slug}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.item.event.relatedArticle).toEqual({
      slug: eventWithBlog.blogSlug,
      url: `https://roadmancycling.com/blog/${eventWithBlog.blogSlug}`,
    });
  });

  it("sets the public cache header on success", async () => {
    const event = EVENTS[0];
    const res = GET(makeRequest(`?event=${event.slug}`));
    expect(res.headers.get("Cache-Control")).toContain("max-age=3600");
  });
});
