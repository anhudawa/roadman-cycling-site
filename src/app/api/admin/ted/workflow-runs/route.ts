import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const WORKFLOWS = [
  "ted-draft-prompt.yml",
  "ted-post-prompt.yml",
  "ted-welcomes.yml",
  "ted-surface-threads.yml",
] as const;

interface WorkflowRun {
  workflow: string;
  id: number;
  runNumber: number;
  status: string;
  conclusion: string | null;
  event: string;
  branch: string;
  createdAt: string;
  url: string;
}

// GET /api/admin/ted/workflow-runs $€” last 5 runs per Ted workflow
export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return NextResponse.json({
      available: false,
      reason: !process.env.GITHUB_TOKEN
        ? "GITHUB_TOKEN not set"
        : "GITHUB_REPO not set",
      runs: [],
    });
  }

  const repo = process.env.GITHUB_REPO;
  const all: WorkflowRun[] = [];

  await Promise.all(
    WORKFLOWS.map(async (wf) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo}/actions/workflows/${wf}/runs?per_page=5`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              "X-GitHub-Api-Version": "2022-11-28",
            },
            // Cache for a minute $€” GitHub API rate limit is 5000/hour per token
            next: { revalidate: 60 },
          }
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          workflow_runs?: Array<{
            id: number;
            run_number: number;
            status: string;
            conclusion: string | null;
            event: string;
            head_branch: string;
            created_at: string;
            html_url: string;
          }>;
        };
        for (const r of data.workflow_runs ?? []) {
          all.push({
            workflow: wf.replace("ted-", "").replace(".yml", ""),
            id: r.id,
            runNumber: r.run_number,
            status: r.status,
            conclusion: r.conclusion,
            event: r.event,
            branch: r.head_branch,
            createdAt: r.created_at,
            url: r.html_url,
          });
        }
      } catch {
        // one workflow failing shouldn't block the others
      }
    })
  );

  all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({
    available: true,
    runs: all,
    fetchedAt: new Date().toISOString(),
  });
}
