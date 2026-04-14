import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { PipelineResult } from "../types.js";

/**
 * Create a PR for a single episode (watch mode).
 */
export function createEpisodePR(
  result: PipelineResult,
  repoRoot: string,
  dryRun: boolean
): string | null {
  const branch = `episode/${result.episodeNumber}-${result.slug.slice(0, 40)}`;
  const title = `Episode ${result.episodeNumber}: ${result.title} — auto-indexed`;
  const sc = result.voiceCheck.sacred_cow_results;

  const check = (pass: boolean) => (pass ? "x" : " ");

  const body = `## Auto-Indexed Episode

**Episode:** ${result.title}
**Number:** ${result.episodeNumber}
**Cluster:** ${result.cluster.primary_cluster} (secondary: ${result.cluster.secondary_clusters.join(", ") || "none"})
**Persona:** ${result.cluster.primary_persona}
**Guest:** ${result.metadata.guest_name ?? "Solo"} ${result.metadata.guest_credentials ? `(${result.metadata.guest_credentials})` : ""}

## Sacred Cow Checklist
- [${check(sc.contrarian_hook.pass)}] Contrarian hook
- [${check(sc.villain_identified.pass)}] Villain identified
- [${check(sc.insider_credibility.pass)}] Insider credibility
- [${check(sc.evidence_layer.pass)}] Evidence layer
- [${check(sc.universal_principle.pass)}] Universal principle
- [${check(sc.personal_story.pass)}] Personal story / NDY member
- [${check(sc.cultural_critique.pass)}] Cultural critique

**Score:** ${result.voiceCheck.sacred_cow_score}/7

## Internal Links Added
${result.reciprocalEdits.map((e) => `- Added link from \`${e.targetSlug}\` → new episode`).join("\n") || "None"}

## Files Changed
- \`content/podcast/${result.slug}.mdx\` (new/updated episode page)
- \`content/podcast/meta/${result.slug}.json\` (metadata sidecar)
- \`content/podcast/transcripts/${result.slug}.txt\` (raw transcript)
${result.reciprocalEdits.map((e) => `- \`content/podcast/${e.targetSlug}.mdx\` (reciprocal link)`).join("\n")}

## Cost
- Input tokens: ${result.usage.totalInputTokens.toLocaleString()}
- Output tokens: ${result.usage.totalOutputTokens.toLocaleString()}
- Runtime: ${(result.usage.runtimeMs / 1000).toFixed(1)}s
- Regeneration attempts: ${result.regenerationAttempts}`;

  if (dryRun) {
    console.log("\n=== PR PREVIEW ===");
    console.log(`Branch: ${branch}`);
    console.log(`Title: ${title}`);
    console.log(body);
    console.log("=== END PR PREVIEW ===\n");
    return null;
  }

  try {
    // Create branch
    execSync(`git checkout -b ${branch}`, { cwd: repoRoot, stdio: "pipe" });

    // Stage only the specific files this agent created/modified
    const filesToStage = [
      `content/podcast/${result.slug}.mdx`,
      `content/podcast/meta/${result.slug}.json`,
      `content/podcast/transcripts/${result.slug}.txt`,
      ...result.reciprocalEdits.map((e) => `content/podcast/${e.targetSlug}.mdx`),
    ];
    for (const file of filesToStage) {
      try {
        execSync(`git add "${file}"`, { cwd: repoRoot, stdio: "pipe" });
      } catch {
        // File might not exist yet (e.g., transcript dir)
      }
    }

    // Commit — use a temp file to avoid shell escaping issues
    const commitMsgFile = path.join(repoRoot, ".git", "AGENT_COMMIT_MSG");
    fs.writeFileSync(commitMsgFile, `feat: auto-index episode ${result.episodeNumber} — ${result.title}`);
    execSync(`git commit -F "${commitMsgFile}"`, { cwd: repoRoot, stdio: "pipe" });
    fs.unlinkSync(commitMsgFile);

    // Push
    execSync(`git push -u origin ${branch}`, { cwd: repoRoot, stdio: "pipe" });

    // Create PR — use --body-file to avoid shell escaping
    const bodyFile = path.join(repoRoot, ".git", "AGENT_PR_BODY");
    fs.writeFileSync(bodyFile, body);
    const safeTitle = title.replace(/"/g, '\\"');

    // Try with labels first, fall back to no labels if they don't exist on the repo
    let prUrl: string;
    const labels = result.voiceCheck.overall_pass ? "auto-indexed" : "auto-indexed,needs-human-rewrite";
    try {
      prUrl = execSync(
        `gh pr create --title "${safeTitle}" --body-file "${bodyFile}" --label "${labels}"`,
        { cwd: repoRoot, encoding: "utf-8" }
      ).trim();
    } catch {
      // Labels may not exist — create PR without labels
      prUrl = execSync(
        `gh pr create --title "${safeTitle}" --body-file "${bodyFile}"`,
        { cwd: repoRoot, encoding: "utf-8" }
      ).trim();
    }
    fs.unlinkSync(bodyFile);

    // Switch back to main
    execSync("git checkout main", { cwd: repoRoot, stdio: "pipe" });

    return prUrl;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  Failed to create PR: ${msg}`);
    // Try to get back to main
    try {
      execSync("git checkout main", { cwd: repoRoot, stdio: "pipe" });
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * Create a batch PR for backfill mode.
 */
export function createBackfillPR(
  results: PipelineResult[],
  repoRoot: string,
  dryRun: boolean
): string | null {
  if (results.length === 0) return null;

  const startEp = results[0].episodeNumber;
  const endEp = results[results.length - 1].episodeNumber;
  const branch = `backfill/${startEp}-${endEp}`;
  const title = `Backfill: Episodes ${startEp}-${endEp} — auto-indexed (${results.length} episodes)`;

  const summaryRows = results.map((r) => {
    const status = r.voiceCheck.overall_pass ? "PASS" : "FAIL";
    return `| ${r.episodeNumber} | ${r.title.slice(0, 50)} | ${r.cluster.primary_cluster} | ${r.voiceCheck.sacred_cow_score}/7 | ${status} |`;
  });

  const body = `## Backfill Batch: ${results.length} Episodes

| Ep | Title | Cluster | Score | Status |
|----|-------|---------|-------|--------|
${summaryRows.join("\n")}

### Total Cost
- Input tokens: ${results.reduce((s, r) => s + r.usage.totalInputTokens, 0).toLocaleString()}
- Output tokens: ${results.reduce((s, r) => s + r.usage.totalOutputTokens, 0).toLocaleString()}
- Regeneration attempts: ${results.reduce((s, r) => s + r.regenerationAttempts, 0)}`;

  if (dryRun) {
    console.log("\n=== BACKFILL PR PREVIEW ===");
    console.log(`Branch: ${branch}`);
    console.log(`Title: ${title}`);
    console.log(body);
    console.log("=== END BACKFILL PR PREVIEW ===\n");
    return null;
  }

  // Same git flow as single episode PR
  try {
    execSync(`git checkout -b ${branch}`, { cwd: repoRoot, stdio: "pipe" });

    // Stage only the specific files created by the backfill
    for (const r of results) {
      const files = [
        `content/podcast/${r.slug}.mdx`,
        `content/podcast/meta/${r.slug}.json`,
        `content/podcast/transcripts/${r.slug}.txt`,
        ...r.reciprocalEdits.map((e) => `content/podcast/${e.targetSlug}.mdx`),
      ];
      for (const file of files) {
        try { execSync(`git add "${file}"`, { cwd: repoRoot, stdio: "pipe" }); } catch { /* skip */ }
      }
    }

    execSync(`git commit -m "feat: backfill episodes ${startEp}-${endEp}"`, {
      cwd: repoRoot,
      stdio: "pipe",
    });
    execSync(`git push -u origin ${branch}`, { cwd: repoRoot, stdio: "pipe" });

    const needsRewrite = results.some((r) => !r.voiceCheck.overall_pass);
    const labels = needsRewrite ? "auto-indexed,needs-human-rewrite" : "auto-indexed";

    const prUrl = execSync(
      `gh pr create --title "${title}" --body "${body.replace(/"/g, '\\"')}" --label "${labels}"`,
      { cwd: repoRoot, encoding: "utf-8" }
    ).trim();

    execSync("git checkout main", { cwd: repoRoot, stdio: "pipe" });
    return prUrl;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  Failed to create backfill PR: ${msg}`);
    try {
      execSync("git checkout main", { cwd: repoRoot, stdio: "pipe" });
    } catch {
      // ignore
    }
    return null;
  }
}
