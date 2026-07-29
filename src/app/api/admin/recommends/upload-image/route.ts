import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_BYTES = 5 * 1024 * 1024;

function safePart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get("image");
  const productSlug = safePart(String(formData.get("productSlug") ?? "product")) || "product";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG, WebP or AVIF image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
  }

  const extension = safePart(file.name.split(".").pop() ?? "webp");
  const filename = `${productSlug}-${Date.now()}.${extension}`;
  try {
    if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`recommends/${filename}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
        maximumSizeInBytes: MAX_BYTES,
      });
      return NextResponse.json({ imageUrl: blob.url });
    }

    const directory = path.join(process.cwd(), "public", "images", "recommends");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ imageUrl: `/images/recommends/${filename}` });
  } catch (error) {
    console.error("[recommends/image] upload failed", error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
