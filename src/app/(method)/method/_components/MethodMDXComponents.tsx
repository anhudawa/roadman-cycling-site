import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Custom MDX components for The Roadman Method protocols.
 *
 * Standard markdown elements (h2/h3/p/ul/li/blockquote/strong) get
 * picked up by `.prose-method` in globals.css. The components below
 * are author-facing — authors can drop them into MDX to surface a
 * tip box, a stat callout, or a fully attributed expert quote.
 */

interface CalloutProps {
  tone?: "tip" | "warn" | "note";
  title?: string;
  children: ReactNode;
}

function Callout({ tone = "tip", title, children }: CalloutProps) {
  const toneClasses =
    tone === "warn"
      ? "border-coral/60 bg-coral/[0.06]"
      : tone === "note"
        ? "border-white/20 bg-white/[0.03]"
        : "border-coral/40 bg-coral/[0.04]";
  const label =
    title ??
    (tone === "warn" ? "Watch out" : tone === "note" ? "Note" : "Tip");
  return (
    <aside
      className={`not-prose my-8 rounded-xl border-l-4 ${toneClasses} border-y border-r border-white/10 p-5 md:p-6`}
    >
      <p className="font-heading text-coral text-[11px] tracking-[0.3em] uppercase mb-2">
        {label}
      </p>
      <div className="text-foreground-muted leading-relaxed space-y-3 [&>p]:m-0 [&>p+p]:mt-3">
        {children}
      </div>
    </aside>
  );
}

interface StatProps {
  value: string;
  label: string;
  sub?: string;
}

function Stat({ value, label, sub }: StatProps) {
  return (
    <span className="not-prose inline-flex items-baseline gap-2 rounded-md border border-coral/40 bg-coral/[0.06] px-2.5 py-1 align-baseline">
      <span className="font-heading text-coral text-base leading-none tracking-wide">
        {value}
      </span>
      <span className="font-heading text-off-white text-[11px] tracking-[0.18em] uppercase">
        {label}
      </span>
      {sub && (
        <span className="font-body text-foreground-muted text-[11px]">
          {sub}
        </span>
      )}
    </span>
  );
}

interface StatBlockProps {
  value: string;
  label: string;
  sub?: string;
}

function StatBlock({ value, label, sub }: StatBlockProps) {
  return (
    <div className="not-prose my-6 rounded-lg border border-coral/30 bg-coral/[0.05] p-5 text-center">
      <p className="font-heading text-coral text-3xl md:text-4xl leading-none tracking-wide mb-2">
        {value}
      </p>
      <p className="font-heading text-off-white text-xs tracking-[0.25em] uppercase">
        {label}
      </p>
      {sub && (
        <p className="font-body text-foreground-muted text-sm mt-2">{sub}</p>
      )}
    </div>
  );
}

interface ExpertQuoteProps {
  attribution: string;
  role?: string;
  children: ReactNode;
}

function ExpertQuote({ attribution, role, children }: ExpertQuoteProps) {
  return (
    <figure className="not-prose my-8 rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
      <span
        aria-hidden
        className="block font-heading text-coral/40 text-5xl leading-none mb-2 select-none"
      >
        &ldquo;
      </span>
      <blockquote className="text-off-white text-lg leading-relaxed mb-4 [&>p]:m-0 [&>p+p]:mt-3 italic">
        {children}
      </blockquote>
      <figcaption className="flex items-center gap-3 pt-3 border-t border-white/5">
        <span className="h-2 w-2 rounded-full bg-coral" aria-hidden />
        <span className="font-heading text-off-white text-sm tracking-[0.18em] uppercase">
          {attribution}
        </span>
        {role && (
          <span className="text-foreground-muted text-xs">— {role}</span>
        )}
      </figcaption>
    </figure>
  );
}

type StrongProps = ComponentPropsWithoutRef<"strong">;

function MethodStrong(props: StrongProps) {
  return <strong className="text-off-white font-semibold" {...props} />;
}

export const methodMdxComponents = {
  Callout,
  Stat,
  StatBlock,
  ExpertQuote,
  strong: MethodStrong,
};
