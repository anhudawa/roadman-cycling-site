import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const pathnameState = vi.hoisted(() => ({ value: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
}));

import { RouteBreadcrumbJsonLd } from "./RouteBreadcrumbJsonLd";

describe("RouteBreadcrumbJsonLd", () => {
  it.each([
    "/coaching",
    "/masters",
    "/training-plans",
    "/training-camps",
    "/podcast",
  ])("does not duplicate the hand-authored breadcrumb on %s", (pathname) => {
    pathnameState.value = pathname;

    expect(renderToStaticMarkup(<RouteBreadcrumbJsonLd />)).toBe("");
  });

  it("keeps the fallback breadcrumb on routes without their own graph", () => {
    pathnameState.value = "/contact";

    const html = renderToStaticMarkup(<RouteBreadcrumbJsonLd />);

    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"name":"Contact"');
  });
});
