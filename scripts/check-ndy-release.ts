import { loadEnvConfig } from "@next/env";
import { sql } from "@vercel/postgres";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const requiredColumns = new Map([
  ["submission_key", "text"],
  ["attribution", "jsonb"],
]);

function validGa4Id(value: string | undefined) {
  return /^G-[A-Z0-9]+$/i.test(value?.trim() ?? "");
}

function validGoogleAdsConversion(value: string | undefined) {
  return /^AW-\d+\/[A-Za-z0-9_-]+$/.test(value?.trim() ?? "");
}

async function main() {
  const failures: string[] = [];

  if (validGa4Id(process.env.NEXT_PUBLIC_GA_ID)) {
    console.log("✓ GA4 measurement ID is configured");
  } else {
    failures.push(
      "NEXT_PUBLIC_GA_ID is missing or is not a valid G-* measurement ID",
    );
  }

  if (
    validGoogleAdsConversion(
      process.env.NEXT_PUBLIC_GOOGLE_ADS_NDY_APPLICATION_SEND_TO,
    )
  ) {
    console.log("✓ Not Done Yet Google Ads conversion action is configured");
  } else {
    failures.push(
      "NEXT_PUBLIC_GOOGLE_ADS_NDY_APPLICATION_SEND_TO is missing or invalid",
    );
  }

  if (!process.env.POSTGRES_URL) {
    failures.push("POSTGRES_URL is unavailable; database schema was not checked");
  } else {
    try {
      const result = await sql`
        select column_name, data_type
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'cohort_applications'
          and column_name in ('submission_key', 'attribution')
      `;
      const actualColumns = new Map(
        result.rows.map((row) => [
          String(row.column_name),
          String(row.data_type),
        ]),
      );

      for (const [column, expectedType] of requiredColumns) {
        const actualType = actualColumns.get(column);
        if (actualType === expectedType) {
          console.log(`✓ cohort_applications.${column} is ${expectedType}`);
        } else if (!actualType) {
          failures.push(
            `cohort_applications.${column} is missing; apply migration 0051`,
          );
        } else {
          failures.push(
            `cohort_applications.${column} is ${actualType}, expected ${expectedType}`,
          );
        }
      }
    } catch {
      failures.push(
        "database schema check failed; verify POSTGRES_URL and connectivity",
      );
    }
  }

  if (failures.length) {
    console.error("\nNot Done Yet release preflight failed:");
    for (const failure of failures) console.error(`  • ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("\nNot Done Yet release preflight passed.");
}

void main();
