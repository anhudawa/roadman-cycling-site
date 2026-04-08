import { NextRequest, NextResponse } from "next/server";
import { notifyAnnualApplication, type AnnualApplicationData } from "@/lib/notifications";

/**
 * POST /api/sponsor/apply
 *
 * Receives Annual Title Partner application form data.
 * Sends a formatted summary email to anthony@roadmancycling.com via the
 * centralised notifications module.
 */

export async function POST(request: NextRequest) {
  try {
    const body: AnnualApplicationData = await request.json();

    // Validate required fields
    const required: (keyof AnnualApplicationData)[] = [
      "brandName",
      "website",
      "contactNameTitle",
      "contactEmail",
      "brandDescription",
      "targetCustomer",
      "outcome",
      "budgetRange",
      "previousExperience",
    ];

    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = await notifyAnnualApplication(body);

    if (!result.success) {
      console.error("Application email failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send application email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
