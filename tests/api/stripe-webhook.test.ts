import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Module from "node:module";

// The route uses `require("stripe")` at runtime, which Vitest's vi.mock does
// NOT intercept. Patch Node's Module._resolveFilename + the require cache
// so the require call returns our mock.
const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  resendSend: vi.fn(),
  getResendClient: vi.fn(),
}));

vi.mock("@/lib/integrations/resend", () => ({
  getResendClient: mocks.getResendClient,
}));

const FAKE_STRIPE_ID = "/__fake_stripe__";
function installFakeStripe() {
  const fakeModule = {
    id: FAKE_STRIPE_ID,
    filename: FAKE_STRIPE_ID,
    loaded: true,
    exports: function StripeCtor(_key: string) {
      return { webhooks: { constructEvent: mocks.constructEvent } };
    },
  };
  // expose default for the `StripeModule.default || StripeModule` pattern
  (fakeModule.exports as unknown as Record<string, unknown>).default =
    fakeModule.exports;
  // @ts-expect-error - require.cache is internal but supported
  require.cache[FAKE_STRIPE_ID] = fakeModule;
  const orig = (
    Module as unknown as { _resolveFilename: (req: string, ...rest: unknown[]) => string }
  )._resolveFilename;
  (Module as unknown as { _resolveFilename: (req: string, ...rest: unknown[]) => string })._resolveFilename =
    function (req: string, ...rest: unknown[]) {
      if (req === "stripe") return FAKE_STRIPE_ID;
      return orig.call(this, req, ...rest);
    };
  return () => {
    (Module as unknown as { _resolveFilename: typeof orig })._resolveFilename = orig;
    // @ts-expect-error - require.cache cleanup
    delete require.cache[FAKE_STRIPE_ID];
  };
}

function req(body: string, signature?: string): Request {
  return new Request("https://example.test/api/stripe-webhook", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : {},
    body,
  });
}

const ENV_KEYS = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY"];

describe("POST /api/stripe-webhook", () => {
  const original: Record<string, string | undefined> = {};
  let restoreStripe: (() => void) | null = null;

  beforeEach(() => {
    for (const k of ENV_KEYS) original[k] = process.env[k];
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.getResendClient.mockReturnValue({ emails: { send: mocks.resendSend } });
    mocks.resendSend.mockResolvedValue({ id: "em_1" });
    restoreStripe = installFakeStripe();
    vi.resetModules();
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (original[k] === undefined) delete process.env[k];
      else process.env[k] = original[k];
    }
    restoreStripe?.();
    restoreStripe = null;
  });

  it("returns 500 when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    vi.resetModules();
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}", "sig"));
    expect(res.status).toBe(500);
  });

  it("returns 500 when STRIPE_WEBHOOK_SECRET is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    vi.resetModules();
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}", "sig"));
    expect(res.status).toBe(500);
  });

  it("returns 400 when stripe-signature header missing", async () => {
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when signature verification fails", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("invalid sig");
    });
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}", "bad"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("invalid sig");
  });

  it("ignores non-checkout-completed events with 200 received", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "payment_intent.created",
      data: { object: {} },
    });
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}", "sig"));
    expect(res.status).toBe(200);
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("sends Resend notification on checkout.session.completed", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "rider@example.com", name: "Tom Rider" },
          amount_total: 4999,
        },
      },
    });
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}", "sig"));
    expect(res.status).toBe(200);
    expect(mocks.resendSend).toHaveBeenCalledOnce();
    const args = mocks.resendSend.mock.calls[0]?.[0];
    expect(args.subject).toContain("Tom Rider");
    expect(args.subject).toContain("$49.99");
    expect(args.to).toBe("admin@roadmancycling.com");
    expect(args.html).toContain("rider@example.com");
  });

  it("returns 200 even when Resend send throws", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "rider@example.com", name: "Tom" },
          amount_total: 1000,
        },
      },
    });
    mocks.resendSend.mockRejectedValue(new Error("resend down"));
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}", "sig"));
    expect(res.status).toBe(200);
  });

  it("skips email send when getResendClient returns null", async () => {
    mocks.getResendClient.mockReturnValue(null);
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "x@y.co", name: "X" },
          amount_total: 0,
        },
      },
    });
    const { POST } = await import("@/app/api/stripe-webhook/route");
    const res = await POST(req("{}", "sig"));
    expect(res.status).toBe(200);
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });
});
