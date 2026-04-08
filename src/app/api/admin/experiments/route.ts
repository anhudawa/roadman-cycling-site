import { NextRequest, NextResponse } from "next/server";
import type { ABTest, ABVariant, ABElementType } from "@/lib/ab/types";

// TODO: Replace with Drizzle queries against ab_tests table
const experiments = new Map<string, ABTest>();

export async function GET() {
  const all = Array.from(experiments.values()).sort((a, b) => {
    // Running first, then draft, then completed
    const statusOrder = { running: 0, draft: 1, completed: 2 };
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  return NextResponse.json({ ok: true, experiments: all });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      page,
      element,
      variants,
      createdBy,
    }: {
      name: string;
      page: string;
      element: ABElementType;
      variants: Omit<ABVariant, "id">[];
      createdBy?: "manual" | "agent";
    } = body;

    if (!name || !page || !element || !variants?.length) {
      return NextResponse.json(
        { error: "Missing required fields: name, page, element, variants" },
        { status: 400 }
      );
    }

    const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const experiment: ABTest = {
      id,
      name,
      page,
      element,
      variants: variants.map((v, i) => ({
        id: `var_${id}_${i}`,
        label: v.label,
        content: v.content,
      })),
      status: "draft",
      createdBy: createdBy ?? "manual",
    };

    experiments.set(id, experiment);

    return NextResponse.json({ ok: true, experiment }, { status: 201 });
  } catch (err) {
    console.error("[Experiments] POST error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
