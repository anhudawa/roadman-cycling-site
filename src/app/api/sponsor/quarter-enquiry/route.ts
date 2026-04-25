import { NextRequest, NextResponse } from "next/server";
import { notifyQuarterEnquiry } from "@/lib/notifications";

/**
 * POST /api/sponsor/quarter-enquiry
 *
 * Fires when a brand passes the quarter pre-screener (budget >= 6k).
 * Sends notification to anthony@ and sarah@ so they know a call is coming.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandName, budget, launchMonth } = body;

    if (!brandName?.trim() || !budget?.trim() || !launchMonth?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await notifyQuarterEnquiry(brandName, budget, launchMonth);

    if (!result.success) {
      console.error("Quarter enquiry notification failed:", result.error);
      // Don't block the user flow $— log and return success anyway
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quarter enquiry error:", error);
    // Non-blocking: the user still gets their Calendly link
    return NextResponse.json({ success: true });
  }
}
