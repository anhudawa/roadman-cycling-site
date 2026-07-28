import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

describe("middleware funnel routing", () => {
  it("keeps the public application route cookie-free", async () => {
    const response = await middleware(
      new NextRequest("https://roadmancycling.com/apply"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("normalises legacy diagnostic links to the dedicated route", async () => {
    const response = await middleware(
      new NextRequest(
        "https://roadmancycling.com/apply?from=abc123xyz0&utm_source=email",
      ),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://roadmancycling.com/apply/from/abc123xyz0?utm_source=email",
    );
  });

  it("only seeds the path-specific experiment cookie on /go", async () => {
    const response = await middleware(
      new NextRequest("https://roadmancycling.com/go"),
    );
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(cookie).toContain("roadman_ab_go_hero=");
    expect(cookie).not.toContain("ab_variant=");
  });
});
