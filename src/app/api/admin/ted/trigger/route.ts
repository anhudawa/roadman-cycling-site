import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const WORKFLOW_FILES: Record<string, string> = {
  "draft-prompt": "ted-draft-prompt.yml",
  "post-prompt": "ted-post-prompt.yml",
  welcomes: "ted-welcomes.yml",
  "surface-threads": "ted-surface-threads.yml",
};

function canTrigger(): { ok: true } | { ok: false; reason: string } {
  if (!process.env.GITHUB_TOKEN) {
    return { ok: false, reason: "GITHUB_TOKEN not set" };
  }
  if (!process.env.GITHUB_REPO) {
    return { ok: false, reason: "GITHUB_REPO not set (format: owner/repo)" };
  }
  return { ok: true };
}

// GET $— report whether manual triggers are available.
export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const check = canTrigger();
  return NextResponse.json({
    available: check.ok,
    reason: check.ok ? null : check.reason,
    workflows: Object.keys(WORKFLOW_FILES),
  });
}

// POST $— trigger a workflow_dispatch on the given workflow.
// Body: { workflow: "draft-prompt" | "post-prompt" | "welcomes" | "surface-threads", inputs?: Record<string,string> }
export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const check = canTrigger();
  if (!check.ok) {
    return NextResponse.json(
      { error: `Manual trigger unavailable: ${check.reason}` },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    workflow?: string;
    inputs?: Record<string, string>;
    branch?: string;
  };

  if (!body.workflow || !WORKFLOW_FILES[body.workflow]) {
    return NextResponse.json(
      { error: "Invalid workflow; must be one of: " + Object.keys(WORKFLOW_FILES).join(", ") },
      { status: 400 }
    );
  }

  const repo = process.env.GITHUB_REPO!;
  const file = WORKFLOW_FILES[body.workflow];
  const ref = body.branch ?? process.env.GITHUB_DEFAULT_BRANCH ?? "main";

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${file}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          ref,
          inputs: body.inputs ?? {},
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `GitHub dispatch failed: ${res.status} ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      dispatched: body.workflow,
      file,
      ref,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
