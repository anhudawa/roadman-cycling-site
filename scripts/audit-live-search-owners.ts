import { auditLiveSearchOwners } from "../src/lib/seo/live-search-owner-audit";

async function main() {
  const report = await auditLiveSearchOwners();

  console.log("Live Search Owner Audit");
  console.log(`  Owner pages: ${report.pagesChecked}`);
  console.log(`  Entity and related-resource checks: ${report.relationshipsChecked}`);
  console.log(`  Errors: ${report.errors.length}`);

  for (const error of report.errors) console.error(`  - ${error}`);

  if (report.errors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
