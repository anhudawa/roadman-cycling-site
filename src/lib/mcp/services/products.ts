import { db } from "@/lib/db";
import { mcpProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function listProducts() {
  const rows = await db
    .select()
    .from(mcpProducts)
    .where(eq(mcpProducts.isActive, true));

  return rows.map((p) => ({
    product_id: p.productKey,
    name: p.name,
    price: p.priceCents / 100,
    currency: p.currency,
    billing_period: p.billingPeriod,
    description: p.description,
    who_its_for: p.whoItsFor,
    url: p.url,
  }));
}
