import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPaidReportByToken: vi.fn(),
  incrementDownloadCount: vi.fn(),
  recordPaidReportServerEvent: vi.fn(),
  fetchImpl: vi.fn(),
}));

vi.mock("@/lib/paid-reports/reports", () => ({
  getPaidReportByToken: mocks.getPaidReportByToken,
  incrementDownloadCount: mocks.incrementDownloadCount,
}));
vi.mock("@/lib/analytics/paid-report-events", () => ({
  PAID_REPORT_EVENTS: { DOWNLOADED: "paid_report_downloaded" },
  recordPaidReportServerEvent: mocks.recordPaidReportServerEvent,
}));

const TOKEN = "abcdefghij1234567890klmnopqrstuv";

function call(token: string) {
  return import("@/app/api/reports/download/[token]/route").then(({ GET }) =>
    GET(new Request(`https://example.test/api/reports/download/${token}`) as never, {
      params: Promise.resolve({ token }),
    }),
  );
}

describe("GET /api/reports/download/[token]", () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.incrementDownloadCount.mockResolvedValue(undefined);
    mocks.recordPaidReportServerEvent.mockResolvedValue(undefined);
    globalThis.fetch = mocks.fetchImpl as unknown as typeof fetch;
  });

  it("returns 400 when token is too short", async () => {
    const res = await call("short");
    expect(res.status).toBe(400);
  });

  it("returns 404 when token doesn't resolve to a report", async () => {
    mocks.getPaidReportByToken.mockResolvedValue(null);
    const res = await call(TOKEN);
    expect(res.status).toBe(404);
  });

  it("returns 410 when report status is revoked", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      id: 1,
      status: "revoked",
      pdfUrl: "https://blob.example/x.pdf",
      productSlug: "p",
      orderId: 5,
      email: "a@b.co",
    });
    const res = await call(TOKEN);
    expect(res.status).toBe(410);
  });

  it("returns 410 when report status is refunded", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      id: 1,
      status: "refunded",
      pdfUrl: "https://blob.example/x.pdf",
      productSlug: "p",
      orderId: 5,
      email: "a@b.co",
    });
    const res = await call(TOKEN);
    expect(res.status).toBe(410);
  });

  it("returns 409 when report is still processing (not generated/delivered)", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      id: 1,
      status: "pending_payment",
      pdfUrl: null,
      productSlug: "p",
      orderId: 5,
      email: "a@b.co",
    });
    const res = await call(TOKEN);
    expect(res.status).toBe(409);
  });

  it("returns 404 when report has no pdfUrl", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      id: 1,
      status: "delivered",
      pdfUrl: null,
      productSlug: "p",
      orderId: 5,
      email: "a@b.co",
    });
    const res = await call(TOKEN);
    expect(res.status).toBe(404);
  });

  it("returns 502 when blob fetch fails", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      id: 1,
      status: "delivered",
      pdfUrl: "https://blob.example/x.pdf",
      productSlug: "p",
      orderId: 5,
      email: "a@b.co",
    });
    mocks.fetchImpl.mockResolvedValue({ ok: false, body: null });
    const res = await call(TOKEN);
    expect(res.status).toBe(502);
  });

  it("streams the PDF on success and increments download count + records event", async () => {
    mocks.getPaidReportByToken.mockResolvedValue({
      id: 7,
      status: "delivered",
      pdfUrl: "https://blob.example/x.pdf",
      productSlug: "plateau",
      orderId: 42,
      email: "rider@example.com",
    });
    const stream = new ReadableStream({
      start(c) {
        c.enqueue(new TextEncoder().encode("%PDF-1.4 fake"));
        c.close();
      },
    });
    mocks.fetchImpl.mockResolvedValue({ ok: true, body: stream });
    const res = await call(TOKEN);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
    expect(res.headers.get("Content-Disposition")).toContain("plateau.pdf");
    expect(mocks.incrementDownloadCount).toHaveBeenCalledWith(7);
    expect(mocks.recordPaidReportServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "paid_report_downloaded",
        reportId: 7,
        orderId: 42,
        productSlug: "plateau",
        email: "rider@example.com",
      }),
    );
  });
});
