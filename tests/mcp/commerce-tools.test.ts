import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(
          Object.assign(Promise.resolve([]), {
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
            limit: vi.fn().mockResolvedValue([]),
          })
        ),
      }),
    }),
  },
}));

import { listProducts } from "@/lib/mcp/services/products";
import { listUpcomingEvents } from "@/lib/mcp/services/events";
import { qualifyLead } from "@/lib/mcp/services/qualification";

describe("list_products service", () => {
  it("returns array (empty when no products)", async () => {
    const products = await listProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it("maps product shape correctly", async () => {
    vi.mocked(
      (await import("@/lib/db")).db.select().from({} as never).where
    ).mockResolvedValueOnce([
      {
        id: 1,
        productKey: "ndy-standard",
        name: "Not Done Yet $€” Standard",
        priceCents: 1500,
        currency: "USD",
        billingPeriod: "monthly",
        description: "Community + coaching",
        whoItsFor: "Serious amateurs",
        url: "https://roadmancycling.com/community/not-done-yet",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never[]);

    const products = await listProducts();
    expect(products).toHaveLength(1);
    expect(products[0].product_id).toBe("ndy-standard");
    expect(products[0].price).toBe(15);
    expect(products[0].currency).toBe("USD");
    expect(products[0].billing_period).toBe("monthly");
  });
});

describe("list_upcoming_events service", () => {
  it("returns array (empty when no events)", async () => {
    const events = await listUpcomingEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  it("maps event shape correctly", async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    vi.mocked(
      (await import("@/lib/db")).db
        .select()
        .from({} as never)
        .where({} as never)
        .orderBy({} as never).limit
    ).mockResolvedValueOnce([
      {
        id: 1,
        name: "NDY Live Q&A $€” May 2026",
        type: "live_qa",
        startsAt: futureDate,
        location: null,
        description: "Monthly live Q&A with Anthony",
        isMembersOnly: true,
        url: "https://www.skool.com/not-done-yet",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never[]);

    const events = await listUpcomingEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("NDY Live Q&A $€” May 2026");
    expect(events[0].type).toBe("live_qa");
    expect(events[0].is_members_only).toBe(true);
    expect(typeof events[0].starts_at).toBe("string");
  });
});

describe("qualify_lead service", () => {
  it("recommends ndy-premium for experienced high-volume racer with specific goal", () => {
    const result = qualifyLead({
      goal: "build_ftp",
      hours_per_week: 12,
      current_level: "racer",
      age_bracket: "35_44",
      primary_challenge: "FTP plateau",
    });
    expect(result.recommended_product_id).toBe("ndy-premium");
    expect(Array.isArray(result.alternative_products)).toBe(true);
    expect(result.next_step_url).toContain("apply");
  });

  it("recommends ndy-standard for comeback cyclist", () => {
    const result = qualifyLead({
      goal: "comeback",
      hours_per_week: 5,
      current_level: "intermediate",
      age_bracket: "45_54",
      primary_challenge: "Returning after injury",
    });
    expect(result.recommended_product_id).toBe("ndy-standard");
  });

  it("recommends ndy-standard for beginner regardless of other factors", () => {
    const result = qualifyLead({
      goal: "target_event",
      hours_per_week: 10,
      current_level: "beginner",
      age_bracket: "35_44",
      primary_challenge: "Just starting out",
    });
    expect(result.recommended_product_id).toBe("ndy-standard");
  });

  it("recommends ndy-premium for masters cyclist targeting an event", () => {
    const result = qualifyLead({
      goal: "target_event",
      hours_per_week: 6,
      current_level: "intermediate",
      age_bracket: "55_plus",
      primary_challenge: "Want to finish Marmotte",
    });
    expect(result.recommended_product_id).toBe("ndy-premium");
  });

  it("defaults to ndy-standard for general improvement", () => {
    const result = qualifyLead({
      goal: "general_improvement",
      hours_per_week: 6,
      current_level: "intermediate",
      age_bracket: "35_44",
      primary_challenge: "Just want to get fitter",
    });
    expect(result.recommended_product_id).toBe("ndy-standard");
  });

  it("returns all required fields", () => {
    const result = qualifyLead({
      goal: "general_improvement",
      hours_per_week: 8,
      current_level: "intermediate",
      age_bracket: "45_54",
      primary_challenge: "Consistency",
    });
    expect(result).toHaveProperty("recommended_product_id");
    expect(result).toHaveProperty("recommended_product_name");
    expect(result).toHaveProperty("reasoning");
    expect(result).toHaveProperty("next_step_url");
    expect(result).toHaveProperty("alternative_products");
    expect(typeof result.reasoning).toBe("string");
    expect(result.reasoning.length).toBeGreaterThan(20);
  });
});
