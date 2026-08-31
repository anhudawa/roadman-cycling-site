import { beforeEach, describe, expect, it, vi } from "vitest";

const getRiderSession = vi.fn();
const getMethodSession = vi.fn();
const loadByEmail = vi.fn();

vi.mock("@/lib/profile-auth/auth", () => ({ getRiderSession }));
vi.mock("@/lib/method/auth", () => ({ getMethodSession }));
vi.mock("@/lib/rider-profile/store", () => ({ loadByEmail }));

const profile = {
  id: 42,
  email: "rider@example.com",
  currentWeight: 165,
  weightUnit: "lb",
  currentFtp: 280,
};

describe("GET /api/tools/fuelling/prefill", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getRiderSession.mockResolvedValue(null);
    getMethodSession.mockResolvedValue(null);
    loadByEmail.mockResolvedValue(null);
  });

  it("returns a private null response for an anonymous rider", async () => {
    const { GET } = await import("./route");
    const response = await GET();

    expect(await response.json()).toEqual({ prefill: null });
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(loadByEmail).not.toHaveBeenCalled();
  });

  it("uses the rider session without a second profile lookup", async () => {
    getRiderSession.mockResolvedValue({ profile });
    const { GET } = await import("./route");
    const response = await GET();

    expect(await response.json()).toEqual({
      prefill: { weightKg: 74.8, currentFtp: 280 },
    });
    expect(getMethodSession).not.toHaveBeenCalled();
    expect(loadByEmail).not.toHaveBeenCalled();
  });

  it("falls back to the Method email when needed", async () => {
    getMethodSession.mockResolvedValue({
      enrollment: { email: "method@example.com" },
    });
    loadByEmail.mockResolvedValue({
      ...profile,
      currentWeight: 72,
      weightUnit: "kg",
      currentFtp: 260,
    });
    const { GET } = await import("./route");
    const response = await GET();

    expect(loadByEmail).toHaveBeenCalledWith("method@example.com");
    expect(await response.json()).toEqual({
      prefill: { weightKg: 72, currentFtp: 260 },
    });
  });
});
