import Image from "next/image";
import { isGenericImage, pillarColor } from "@/lib/blog-images";
import type { ContentPillar } from "@/types";

interface PostCardVisualProps {
  featuredImage?: string | null;
  title: string;
  pillar?: ContentPillar;
  /** e.g. "(max-width: 768px) 100vw, 33vw" */
  sizes?: string;
  /** Any additional classes for the outer container */
  className?: string;
}

/**
 * Shared card visual for blog post cards. Renders either:
 *
 *  - the post's featuredImage, if it's unique per post (happy path)
 *  - a typography-first fallback, if the image is in the
 *    GENERIC_BLOG_IMAGES pool (ie. shared across many posts)
 *
 * The fallback:
 *  - pillar-coloured gradient bg
 *  - oversized pillar glyph hint (a "Ã˜" dot on a subtle grain)
 *  - headline echo $€” smaller than the card's main title so it doesn't
 *    feel like duplicate copy, just a visual anchor
 *
 * Parent components size the card via a 16:9 wrapper; this component
 * fills it with `absolute inset-0`.
 *
 * Aspect ratio, hover effects, and rounded corners are the parent's
 * responsibility $€” keeps the visual agnostic to where it's dropped in.
 */
export function PostCardVisual({
  featuredImage,
  title,
  pillar,
  sizes,
  className = "",
}: PostCardVisualProps) {
  const useTypographyCard = isGenericImage(featuredImage);

  if (useTypographyCard) {
    const color = pillarColor(pillar);

    return (
      <div
        className={`absolute inset-0 flex items-end p-5 ${className}`}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, rgba(33, 1, 64, 0.92) 85%)`,
        }}
        aria-hidden="true"
      >
        {/* Subtle grain overlay $€” scoped to this card so it
            doesn't rely on the global grain-overlay class. */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Big watermark dot in the top-right $€” minimal visual
            anchor, coral-tinted on a typography-heavy card. */}
        <div
          aria-hidden="true"
          className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.35)" }}
        />

        {/* Bottom-left title echo, clipped. Gives the card some
            typography without duplicating the card body's h3. */}
        <p
          className="relative z-10 font-heading text-off-white/85 leading-[0.95] line-clamp-3"
          style={{
            fontSize: "clamp(1.25rem, 2.4vw, 1.75rem)",
            letterSpacing: "-0.01em",
            textShadow: "0 2px 18px rgba(0,0,0,0.35)",
          }}
        >
          {title.toUpperCase()}
        </p>
      </div>
    );
  }

  // Real image path $€” unchanged from prior behaviour.
  return (
    <Image
      src={featuredImage as string}
      alt={title}
      fill
      className={`object-cover group-hover:scale-105 transition-transform duration-500 ${className}`}
      sizes={sizes}
    />
  );
}
