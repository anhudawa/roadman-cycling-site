export interface AffiliateConversionCsvRow {
  network: string;
  transactionId: string;
  retailerName: string | null;
  productSlug: string | null;
  offerId: number | null;
  clickId: string | null;
  saleAmount: string | null;
  commissionAmount: string | null;
  currency: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "returned" | "paid";
  transactionAt: Date;
  rawData: Record<string, string>;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

const allowedStatuses = new Set([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "returned",
  "paid",
]);

export function parseAffiliateConversionCsv(csv: string): AffiliateConversionCsvRow[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  const required = ["network", "transaction_id", "transaction_at"];
  for (const header of required) {
    if (!headers.includes(header)) throw new Error(`CSV is missing required column: ${header}`);
  }

  return lines.slice(1).map((line, rowIndex) => {
    const cells = splitCsvLine(line);
    const rawData = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const statusValue = (rawData.status || "pending").toLowerCase();
    const transactionAt = new Date(rawData.transaction_at);
    if (!rawData.network || !rawData.transaction_id || Number.isNaN(transactionAt.getTime())) {
      throw new Error(`CSV row ${rowIndex + 2} has invalid network, transaction_id or transaction_at`);
    }
    if (!allowedStatuses.has(statusValue)) {
      throw new Error(`CSV row ${rowIndex + 2} has unsupported status: ${statusValue}`);
    }
    const offerId = Number(rawData.offer_id || 0);
    return {
      network: rawData.network,
      transactionId: rawData.transaction_id,
      retailerName: rawData.retailer || null,
      productSlug: rawData.product_slug || null,
      offerId: offerId > 0 ? offerId : null,
      clickId: rawData.click_id || null,
      saleAmount: rawData.sale_amount || null,
      commissionAmount: rawData.commission_amount || null,
      currency: (rawData.currency || "EUR").toUpperCase(),
      status: statusValue as AffiliateConversionCsvRow["status"],
      transactionAt,
      rawData,
    };
  });
}
