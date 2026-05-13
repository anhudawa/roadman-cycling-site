import { describe, expect, it } from "vitest";
import { diagnosticPdfFilename, renderDiagnosticPdf } from "./pdf";
import { PROFILE_BREAKDOWNS } from "./profiles";

/**
 * Smoke test the PDF generator. We don't parse the binary — we just
 * confirm renderToBuffer returns a non-trivial PDF buffer (header
 * `%PDF-`) without throwing. Catches regressions in the React tree,
 * missing image files, or font registration silently failing.
 *
 * Each render takes ~200ms locally so we keep this to a single
 * scenario; profile-by-profile coverage is in the higher-level submit
 * route tests.
 */

describe("renderDiagnosticPdf", () => {
  it("renders a non-empty PDF buffer for the under-recovered profile", async () => {
    const buf = await renderDiagnosticPdf({
      slug: "abc1234567",
      primary: "underRecovered",
      closeToBreakthrough: false,
      breakdown: PROFILE_BREAKDOWNS.underRecovered,
      createdAt: new Date("2026-05-13T10:00:00Z"),
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(1000);
    // PDF magic bytes
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);

  it("renders for the close-to-breakthrough fallback shape", async () => {
    const buf = await renderDiagnosticPdf({
      slug: "abc1234567",
      primary: "underRecovered",
      closeToBreakthrough: true,
      breakdown: PROFILE_BREAKDOWNS.underRecovered,
      createdAt: new Date("2026-05-13T10:00:00Z"),
    });
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 30_000);
});

describe("diagnosticPdfFilename", () => {
  it("includes the profile label and slug, lowercased and safe", () => {
    expect(
      diagnosticPdfFilename({
        primary: "underRecovered",
        closeToBreakthrough: false,
        slug: "abc1234567",
      })
    ).toBe("roadman-plateau-diagnosis-under-recovered-abc1234567.pdf");
  });

  it("uses the close-to-breakthrough label when set", () => {
    expect(
      diagnosticPdfFilename({
        primary: "polarisation",
        closeToBreakthrough: true,
        slug: "xyz9999999",
      })
    ).toBe(
      "roadman-plateau-diagnosis-closer-to-breakthrough-than-you-think-xyz9999999.pdf"
    );
  });
});
