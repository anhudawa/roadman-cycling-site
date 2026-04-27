import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Both `/api/stripe-webhook` and `/api/webhooks/stripe` now defer to the
 * shared dispatcher in `@/lib/stripe/dispatch`. We mock the dispatcher
 * directly so route-level tests stay focused on signature verification +
 * env handling — the dispatcher itself is exercised by the e2e test.
 */

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  dispatch: vi.fn(),
  StripeCtor: vi.fn(),
}));

vi.mock("@/lib/stripe/dispatch", () => ({
  dispatchStripeEvent: mocks.dispatch,
}));

vi.mock("stripe", () => ({
  default: function FakeStripe(_key: string) {
    mocks.StripeCtor(_key);
    return {
      webhooks: { constructEvent: mocks.constructEvent },
      customers: { retrieve: vi.fn() },
    };
  },
}));

function req(body: string, signature?: string): Request {
  return new Request("https://example.test/api/stripe-webhook", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : {},
    body,
  });
}

const ENV_KEYS = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"];

describe.each([
  ["/api/stripe-webhook", "@/app/api/stripe-webhook/route"],
  ["/api/webhooks/stripe", "@/app/api/webhooks/stripe/route"],
])("POST %s", (_label, importPath) => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) original[k] = process.env[k];
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    for (const fn of Object.values(mocks)) fn.mockReset();
    mocks.dispatch.mockResolvedValue(undefined);
    vi.resetModules();
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (original[k] === undefined) delete process.env[k];
      else process.env[k] = original[k];
    }
  });

  it("returns 500 when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    vi.resetModules();
    const mod = (await import(importPath)) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await mod.POST(req("{}", "sig"));
    expect(res.status).toBe(500);
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("returns 500 when STRIPE_WEBHOOK_SECRET is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    vi.resetModules();
    const mod = (await import(importPath)) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await mod.POST(req("{}", "sig"));
    expect(res.status).toBe(500);
  });

  it("returns 400 when stripe-signature header missing", async () => {
    const mod = (await import(importPath)) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await mod.POST(req("{}"));
    expect(res.status).toBe(400);
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("invalid sig");
    });
    const mod = (await import(importPath)) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await mod.POST(req("{}", "bad"));
    expect(res.status).toBe(400);
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("forwards verified events to the shared dispatcher", async () => {
    const event = {
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: { id: "cs_1" } },
    };
    mocks.constructEvent.mockReturnValue(event);
    const mod = (await import(importPath)) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await mod.POST(req("{}", "sig"));
    expect(res.status).toBe(200);
    expect(mocks.dispatch).toHaveBeenCalledOnce();
    const callArgs = mocks.dispatch.mock.calls[0];
    expect(callArgs[0]).toEqual(event);
    expect(callArgs[1].webhookPath).toMatch(/^\/api\//);
  });

  it("returns 200 even when dispatcher throws (defensive — Stripe shouldn't retry our internal bug)", async () => {
    mocks.constructEvent.mockReturnValue({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: {} },
    });
    mocks.dispatch.mockRejectedValueOnce(new Error("dispatch boom"));
    const mod = (await import(importPath)) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await mod.POST(req("{}", "sig"));
    expect(res.status).toBe(200);
  });
});
