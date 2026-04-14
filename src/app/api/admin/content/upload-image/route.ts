import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const contentId = formData.get("contentId") as string | null;

    if (!file || !contentId) {
      return NextResponse.json(
        { error: "image and contentId are required" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and AVIF images are allowed" },
        { status: 400 },
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 5MB" },
        { status: 400 },
      );
    }

    // Generate filename from contentId + timestamp
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `blog-${contentId}-${Date.now()}.${ext}`;
    const imgDir = path.join(process.cwd(), "public/images/blog");
    fs.mkdirSync(imgDir, { recursive: true });

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(imgDir, filename), buffer);

    const imagePath = `/images/blog/${filename}`;

    return NextResponse.json({ imagePath });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
