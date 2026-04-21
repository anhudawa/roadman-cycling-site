import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getPostBySlug } from "@/lib/blog";

/**
 * Dynamic blog hero generator — Satori-backed.
 *
 * Preview URLs (once deployed):
 *   /api/og/blog-hero?slug=<any-existing-blog-slug>
 *   /api/og/blog-hero?title=Any%20Title&pillar=coaching
 *
 * Returns a 1600×900 (16:9) PNG. Consumers render it at whatever
 * aspect they need — the post page hero crops to 21:9, the /blog
 * index cards render at 16:9 as-is.
 *
 * Design brief:
 *  - Same visual language as the homepage glitch hero — deep-purple
 *    bg (#210140), pillar-coloured accents, subtle grain.
 *  - Enormous pillar-coloured numeric "0Ø" glyph at right as the
 *    visual anchor (cheaper than a real portrait, reads as a
 *    data/benchmark signal).
 *  - Headline fills the left rail — Bebas-style condensed caps,
 *    auto-sized based on length.
 *  - "ROADMAN" watermark at the bottom, 24px tracked-out.
 *
 * Cache strategy: post titles are stable, so responses get a long
 * Cache-Control so Vercel CDN handles the hit volume without
 * re-invoking Satori per request.
 */

// Node runtime (default) — Satori works fine here and getPostBySlug
// reads MDX files from disk at render time. Responses cache
// aggressively via the Cache-Control header on the response, so
// Satori only runs once per unique (slug|title|pillar) tuple.

const pillarColors: Record<string, string> = {
  coaching: "#F16363",
  nutrition: "#4CAF50",
  strength: "#FF9800",
  recovery: "#2196F3",
  "le-metier": "#9C27B0",
};

const pillarLabels: Record<string, string> = {
  coaching: "COACHING",
  nutrition: "NUTRITION",
  strength: "STRENGTH & CONDITIONING",
  recovery: "RECOVERY",
  "le-metier": "LE METIER",
};

function resolveTitleFontSize(title: string): number {
  // Target a ~3-5 line wrap at 1600px wide with the left rail (~900px
  // of content width). Tune down for long titles so nothing clips.
  if (title.length > 80) return 68;
  if (title.length > 55) return 84;
  if (title.length > 35) return 110;
  return 130;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const titleParam = url.searchParams.get("title");
  const pillarParam = url.searchParams.get("pillar");

  let title: string;
  let pillar: string;

  if (slug) {
    const post = getPostBySlug(slug);
    title = post?.title ?? slug.replace(/-/g, " ").toUpperCase();
    pillar = post?.pillar ?? "coaching";
  } else {
    title = titleParam ?? "Roadman Cycling";
    pillar = pillarParam ?? "coaching";
  }

  const accent = pillarColors[pillar] ?? "#F16363";
  const pillarLabel = pillarLabels[pillar] ?? pillar.toUpperCase();
  const fontSize = resolveTitleFontSize(title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#210140",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Diagonal pillar-coloured radial glow — visual interest
            in the right-bottom quadrant without dominating. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 78% 62%, ${accent}33 0%, transparent 45%)`,
          }}
        />

        {/* Top coral seam (matches homepage hero) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${accent}b3, transparent)`,
          }}
        />

        {/* Oversized pillar "•" glyph — minimal brand anchor. Tuned
            so it reads as an accent, not a bullseye. */}
        <div
          style={{
            position: "absolute",
            right: "110px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            border: `2px solid ${accent}`,
            opacity: 0.9,
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 60px 10px ${accent}66`,
            }}
          />
        </div>

        {/* Inner content rail */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            padding: "90px 90px 80px",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* ── top row: pillar + blog ───────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "10px 20px",
                borderRadius: "999px",
                background: `${accent}1f`,
                border: `1px solid ${accent}66`,
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: accent,
                }}
              />
              <span
                style={{
                  color: accent,
                  fontSize: "20px",
                  letterSpacing: "4px",
                  fontWeight: 600,
                }}
              >
                {pillarLabel}
              </span>
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "20px",
                letterSpacing: "4px",
              }}
            >
              ROADMAN · BLOG
            </span>
          </div>

          {/* ── headline ─────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "1000px",
            }}
          >
            <h1
              style={{
                color: "#FAFAFA",
                fontSize: `${fontSize}px`,
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                margin: 0,
                textTransform: "uppercase",
                textShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              {title}
            </h1>

            {/* 48px coral hairline — matches the homepage hero */}
            <div
              style={{
                width: "48px",
                height: "2px",
                background: accent,
                marginTop: "40px",
              }}
            />
          </div>

          {/* ── bottom row: brand + url ──────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                color: "#FAFAFA",
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "8px",
                textTransform: "uppercase",
              }}
            >
              ROADMAN
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "18px",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              roadmancycling.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1600,
      height: 900,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/png",
      },
    },
  );
}
