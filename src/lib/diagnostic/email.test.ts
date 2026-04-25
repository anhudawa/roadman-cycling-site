import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Breakdown, Profile } from "./types";

/**
 * Email helper tests. Verifies the missing-key skip path, the URL
 * builder, and that the rendered HTML escapes user-controlled
 * content. The Resend client is mocked so the test runs offline.
 */

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("@/lib/integrations/resend", () => ({
  getResendClient: () => ({
    emails: { send: sendMock },
  }),
}));

const BREAKDOWN: Breakdown = {
  headline: "You're under-recovered.",
  diagnosis: "Diagnosis text.",
  whyThisIsHappening: "Why text.",
  whatItsCosting: "Cost text.",
  fix: [
    { step: 1, title: "A", detail: "a" },
    { step: 2, title: "B", detail: "b" },
    { step: 3, title: "C", detail: "c" },
  ],
  whyAlone: "Why alone text.",
  nextMove: "Next move.",
  secondaryNote: null,
};

const INPUT = {
  email: "test@example.com",
  slug: "abc1234567",
  primary: "underRecovered" as Profile,
  closeToBreakthrough: false,
  breakdown: BREAKDOWN,
};

describe("sendDiagnosisConfirmation", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "msg_123" } });
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://test.example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("sends a Resend email with the correct subject and link", async () => {
    const { sendDiagnosisConfirmation } = await import("./email");
    const result = await sendDiagnosisConfirmation(INPUT);
    expect(result.sent).toBe(true);
    expect(result.messageId).toBe("msg_123");
    expect(sendMock).toHaveBeenCalledTimes(1);
    const args = sendMock.mock.calls[0][0];
    expect(args.to).toBe("test@example.com");
    expect(args.subject).toContain("Under-recovered");
    expect(args.html).toContain("https://test.example.com/diagnostic/abc1234567");
    expect(args.text).toContain("https://test.example.com/diagnostic/abc1234567");
  });

  it("uses the close-to-breakthrough label when the flag is set", async () => {
    const { sendDiagnosisConfirmation } = await import("./email");
    await sendDiagnosisConfirmation({ ...INPUT, closeToBreakthrough: true });
    const args = sendMock.mock.calls[0][0];
    expect(args.subject).toContain("Closer to breakthrough");
  });

  it("HTML-escapes a hostile headline", async () => {
    const hostile: Breakdown = {
      ...BREAKDOWN,
      headline: '<img src=x onerror="alert(1)">',
    };
    const { sendDiagnosisConfirmation } = await import("./email");
    await sendDiagnosisConfirmation({ ...INPUT, breakdown: hostile });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });
});

describe("sendDiagnosisConfirmation $€” missing key", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns { sent: false } when getResendClient is null", async () => {
    vi.doMock("@/lib/integrations/resend", () => ({
      getResendClient: () => null,
    }));
    const { sendDiagnosisConfirmation } = await import("./email");
    const result = await sendDiagnosisConfirmation(INPUT);
    expect(result.sent).toBe(false);
    expect(result.error).toBe("resend_not_configured");
    expect(sendMock).not.toHaveBeenCalled();
  });
});
