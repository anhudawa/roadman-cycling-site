import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { getChannelVideos } from "@/lib/youtube/client";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videos = await getChannelVideos(100);
    return NextResponse.json({ videos });
  } catch (err) {
    console.error("[Exploder] Failed to fetch videos:", err);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos" },
      { status: 500 }
    );
  }
}
