import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import {
  getAssignmentById,
  updateAssignment,
  TRAININGPEAKS_ASSIGNMENT_STATUSES,
  type TrainingPeaksAssignmentStatus,
  type UpdateAssignmentParams,
} from "@/lib/crm/trainingpeaks-assignments";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const patch: UpdateAssignmentParams = {};

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (
      typeof body.status !== "string" ||
      !(TRAININGPEAKS_ASSIGNMENT_STATUSES as string[]).includes(body.status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status as TrainingPeaksAssignmentStatus;
  }

  if (Object.prototype.hasOwnProperty.call(body, "tpAthleteId")) {
    patch.tpAthleteId =
      body.tpAthleteId === null || body.tpAthleteId === ""
        ? null
        : String(body.tpAthleteId).trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "tpPlanId")) {
    patch.tpPlanId =
      body.tpPlanId === null || body.tpPlanId === ""
        ? null
        : String(body.tpPlanId).trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "planStartDate")) {
    if (body.planStartDate === null || body.planStartDate === "") {
      patch.planStartDate = null;
    } else if (
      typeof body.planStartDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.planStartDate)
    ) {
      patch.planStartDate = body.planStartDate;
    } else {
      return NextResponse.json(
        { error: "planStartDate must be YYYY-MM-DD" },
        { status: 400 }
      );
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "notes")) {
    patch.notes =
      body.notes === null || body.notes === "" ? null : String(body.notes);
  }

  const updated = await updateAssignment(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ assignment: updated });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const row = await getAssignmentById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ assignment: row });
}
