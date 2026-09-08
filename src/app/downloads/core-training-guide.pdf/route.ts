const CORE_GUIDE_SOURCE =
  "https://drive.google.com/uc?export=download&id=1M7geF6Z9vW2S6OH52yCmHPjBHrnuQ_wp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = await fetch(CORE_GUIDE_SOURCE, {
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": "RoadmanCycling-CoreGuide/1.0",
    },
  });

  if (!upstream.ok) {
    console.error(
      `[CoreGuide] upstream download failed: ${upstream.status} ${upstream.statusText}`,
    );
    return new Response("Core Training Guide is temporarily unavailable.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const bytes = await upstream.arrayBuffer();
  const magic = new TextDecoder("ascii").decode(bytes.slice(0, 5));
  if (magic !== "%PDF-") {
    console.error(
      `[CoreGuide] upstream did not return a PDF (${upstream.headers.get("content-type") ?? "unknown type"}, ${bytes.byteLength} bytes)`,
    );
    return new Response("Core Training Guide is temporarily unavailable.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="core-training-guide.pdf"',
      "Content-Length": String(bytes.byteLength),
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
