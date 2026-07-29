import { describe, expect, it } from "vitest";
import { parseAffiliateConversionCsv } from "./csv";

describe("affiliate conversion CSV", () => {
  it("parses network rows and quoted retailer names", () => {
    const rows = parseAffiliateConversionCsv(
      [
        "network,transaction_id,transaction_at,retailer,commission_amount,status",
        'awin,txn-1,2026-07-28T10:00:00Z,"Bike Shop, Ltd",4.25,approved',
      ].join("\n"),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].retailerName).toBe("Bike Shop, Ltd");
    expect(rows[0].commissionAmount).toBe("4.25");
    expect(rows[0].status).toBe("approved");
  });

  it("requires stable transaction identity", () => {
    expect(() =>
      parseAffiliateConversionCsv("network,transaction_at\nawin,2026-07-28"),
    ).toThrow(/transaction_id/);
  });
});
