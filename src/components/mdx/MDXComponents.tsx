import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

/**
 * MDX component overrides.
 *
 * Swaps the raw <img> that markdown image syntax (`![alt](src)`) produces for
 * Next.js's <Image>, so blog-body images get lazy loading, AVIF/WebP, and
 * responsive srcset for free.
 *
 * next/image requires explicit dimensions (or `fill`). MDX markdown syntax
 * doesn't carry dimensions, so we default to 1200x630 (our OG/featured aspect)
 * and let the browser letter/pillar-box with `h-auto` via CSS. Authors can
 * still pass width/height via JSX <img> in MDX to override.
 */
type ImgProps = ComponentPropsWithoutRef<"img">;

function MDXImage({ src, alt, width, height, ...rest }: ImgProps) {
  if (!src || typeof src !== "string") return null;

  const isExternal = /^https?:\/\//i.test(src);
  // Remote images would need to be allow-listed in next.config remotePatterns.
  // Fall back to a plain <img> for safety if we ever author an off-site image.
  if (isExternal) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" {...rest} />;
  }

  const w = typeof width === "number" ? width : width ? Number(width) : 1200;
  const h = typeof height === "number" ? height : height ? Number(height) : 630;

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={w}
      height={h}
      sizes="(max-width: 768px) 100vw, 768px"
      className="rounded-xl w-full h-auto my-8"
    />
  );
}

type AnchorProps = ComponentPropsWithoutRef<"a">;

function MDXLink({ href, children, ...rest }: AnchorProps) {
  const isExternal = href && /^https?:\/\//i.test(href);
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  img: MDXImage,
  a: MDXLink,
};
