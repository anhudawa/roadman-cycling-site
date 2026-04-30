"use client";

import { useEffect, useRef, useState } from "react";

interface IsolatedReportViewProps {
  /** Full HTML document (with its own <head>/<body>/<style>) for the report. */
  html: string;
  /** Accessible label for the iframe so screen readers announce its purpose. */
  title: string;
}

/**
 * Renders a saved report HTML document inside an `srcDoc` iframe so the
 * report's own styles can never leak into the surrounding page.
 *
 * Older cached reports embedded global rules (e.g. `<style>a { ... }`) and
 * full-document `<body style>` attributes; injecting that with
 * `dangerouslySetInnerHTML` lets `<style>` tags become page-wide stylesheets
 * and merges body attributes onto the host document — which is what was
 * making the site Footer render with the report's white-pill button styling.
 * The iframe gives true isolation (separate document, separate stylesheets)
 * regardless of what the cached HTML contains.
 */
export function IsolatedReportView({ html, title }: IsolatedReportViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(600);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const measure = () => {
      const doc = iframe.contentDocument;
      if (!doc?.body) return;
      // scrollHeight on body is the rendered document height.
      const next = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
      if (next > 0) setHeight(next);
    };

    const onLoad = () => {
      measure();
      const doc = iframe.contentDocument;
      if (!doc?.body) return;
      // Re-measure when the embedded document reflows (image loads, font
      // swaps, viewport changes inside the frame).
      const ro = new ResizeObserver(() => measure());
      ro.observe(doc.body);
      // Stash on the iframe so we can disconnect on unmount.
      (iframe as unknown as { __ro?: ResizeObserver }).__ro = ro;
    };

    iframe.addEventListener("load", onLoad);
    // Already-loaded case (HMR, srcDoc swap).
    if (iframe.contentDocument?.readyState === "complete") onLoad();

    return () => {
      iframe.removeEventListener("load", onLoad);
      const ro = (iframe as unknown as { __ro?: ResizeObserver }).__ro;
      ro?.disconnect();
    };
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={html}
      // `allow-same-origin` lets us read contentDocument for sizing; we omit
      // `allow-scripts` because saved reports are pure HTML/CSS and we never
      // want untrusted script execution from cached content.
      sandbox="allow-same-origin"
      className="block w-full rounded-xl border border-white/5 bg-off-white"
      style={{ height: `${height}px` }}
    />
  );
}
