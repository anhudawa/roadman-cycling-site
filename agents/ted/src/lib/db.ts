// Drizzle client for Ted agent scripts (tsx).
// Uses the same @vercel/postgres + schema as the Next.js app, so rows written
// here are immediately visible in /admin/ted.
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "../../../../src/lib/db/schema.js";

export const db = drizzle(sql, { schema });
export { schema };
