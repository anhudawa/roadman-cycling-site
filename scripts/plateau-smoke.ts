/**
 * Post-deploy smoke test for the Plateau Diagnostic funnel.
 *
 * Run against a live URL after Vercel promotes a build:
 *
 *   npm run smoke:plateau -- --url=https://roadmancycling.com
 *
 * What it does:
 *   1. GET /api/diagnostic/health $€” verifies DB + per-integration env.
 *      Prints a summary; exits non-zero if the response isn't 200.
 *   2. GET /plateau $€” ensures the landing page renders (not 404'd).
 *   3. With --submit, POSTs a full test submission to
 *      /api/diagnostic/submit, follows the returned slug, and confirms
 *      /diagnostic/[slug] renders. Skip submit unless you want a real
 *      Beehiiv subscribe + Resend confirmation to fire $€” use a
 *      dedicated test inbox.
 *
 * Exits 0 on success, 1 on the first failure.
 */

interface Args {
  url: string;
  submit: boolean;
  email: string;
}

function parseArgs(): Args {
  let url = "";
  let submit = false;
  let email = "";
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--url=")) url = arg.slice("--url=".length);
    else if (arg.startsWith("--email=")) email = arg.slice("--email=".length);
    else if (arg === "--submit") submit = true;
  }
  if (!url) {
    throw new Error(
      "Pass --url=https://your-deploy-url. Add --submit to also POST a test submission (requires --email)."
    );
  }
  if (submit && !email) {
    throw new Error(
      "--submit requires --email=you+smoke@example.com $€” use a dedicated inbox, a real confirmation email will fire."
    );
  }
  return { url: url.replace(/\/$/, ""), submit, email };
}

function ok(msg: string) {
  console.log(`  $œ“ ${msg}`);
}
function info(msg: string) {
  console.log(`  $· ${msg}`);
}

async function checkHealth(baseUrl: string): Promise<void> {
  const res = await fetch(`${baseUrl}/api/diagnostic/health`);
  const body = (await res.json()) as {
    ok: boolean;
    checks: Record<string, string>;
    error?: string;
  };
  if (!res.ok || !body.ok) {
    console.log(JSON.stringify(body, null, 2));
    throw new Error(`health check returned ${res.status}`);
  }
  ok(`health: 200 ok`);
  for (const [name, status] of Object.entries(body.checks)) {
    const marker = status === "ok" || status === "set" ? "$œ“" : "$·";
    console.log(`    ${marker} ${name}: ${status}`);
  }
  // Flag the integrations that are likely needed for prod but not
  // fatal $€” Anthony can see the same info on the admin stats page.
  const missing: string[] = [];
  for (const k of ["anthropicKey", "resendKey", "beehiivKey"]) {
    if (body.checks[k] === "missing") missing.push(k);
  }
  if (missing.length > 0) {
    console.log(
      `    $š  missing (funnel works, but features degraded): ${missing.join(", ")}`
    );
  }
}

async function checkLanding(baseUrl: string): Promise<void> {
  const res = await fetch(`${baseUrl}/plateau`, {
    redirect: "manual",
    headers: { "User-Agent": "roadman-smoke/1.0" },
  });
  if (res.status !== 200) {
    throw new Error(`/plateau returned ${res.status}`);
  }
  const html = await res.text();
  if (!/MASTERS PLATEAU DIAGNOSTIC/.test(html)) {
    throw new Error("/plateau rendered but doesn't contain the hero kicker");
  }
  ok("/plateau: 200 ok, hero rendered");
}

async function submitTest(baseUrl: string, email: string): Promise<void> {
  // Fixture 1 from Appendix A $€” deterministic Under-recovered result.
  const payload = {
    email,
    consent: true,
    age: "45-54",
    hoursPerWeek: "9-12",
    ftp: 285,
    goal: "Post-deploy smoke test",
    Q1: 3, Q2: 3, Q3: 3,
    Q4: 1, Q5: 1, Q6: 1,
    Q7: 1, Q8: 3, Q9: 1,
    Q10: 1, Q11: 1, Q12: 3,
    Q13: "Smoke test $€” safe to delete.",
    utm: { source: "smoke", medium: "cli", campaign: "plateau-smoke" },
  };

  const res = await fetch(`${baseUrl}/api/diagnostic/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as { slug?: string; error?: string };
  if (!res.ok || !body.slug) {
    throw new Error(
      `submit returned ${res.status}: ${body.error ?? "no slug in body"}`
    );
  }
  ok(`submit: 200 ok, slug = ${body.slug}`);
  info(`  $†’ recorded in admin: ${baseUrl}/admin/diagnostic/${body.slug}`);

  const resultsRes = await fetch(`${baseUrl}/diagnostic/${body.slug}`, {
    headers: { "User-Agent": "roadman-smoke/1.0" },
  });
  if (resultsRes.status !== 200) {
    throw new Error(`results page returned ${resultsRes.status}`);
  }
  const resultsHtml = await resultsRes.text();
  if (!/YOUR DIAGNOSIS/.test(resultsHtml)) {
    throw new Error("results page loaded but missing the diagnosis kicker");
  }
  ok(`/diagnostic/${body.slug}: 200 ok, diagnosis rendered`);
}

async function main() {
  const args = parseArgs();
  console.log(`\nSmoke-testing ${args.url}\n`);

  console.log("[1/${count}] Health check".replace("${count}", args.submit ? "3" : "2"));
  await checkHealth(args.url);

  console.log("\n[2/${count}] Landing page".replace("${count}", args.submit ? "3" : "2"));
  await checkLanding(args.url);

  if (args.submit) {
    console.log("\n[3/3] End-to-end submission");
    console.log(`  $· seed email: ${args.email}`);
    console.log(`  $· this will fire a real Resend confirmation + Beehiiv subscribe`);
    await submitTest(args.url, args.email);
  }

  console.log("\n$œ“ All checks passed.");
}

main().catch((err) => {
  console.error("\n$œ— Smoke failed:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
