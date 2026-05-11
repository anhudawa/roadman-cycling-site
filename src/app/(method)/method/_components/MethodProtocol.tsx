import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { methodMdxComponents } from "./MethodMDXComponents";
import type { MethodModule } from "@/lib/method/modules";

interface MethodProtocolProps {
  module: MethodModule;
}

/**
 * Server-side MDX renderer for a Method module protocol.
 *
 * `module.protocolMdxPath` is repo-relative (e.g.
 * `content/method/protocols/01-where-you-actually-are.mdx`). We read
 * the file off disk, strip frontmatter via gray-matter, and hand the
 * body to next-mdx-remote/rsc with the Method-themed component map.
 *
 * If the file is missing we fall back to a quiet placeholder — the
 * module data drives the rest of the page, the protocol is one
 * surface among several.
 */
export async function MethodProtocol({ module }: MethodProtocolProps) {
  const repoRoot = process.cwd();
  const fullPath = path.join(repoRoot, module.protocolMdxPath);

  let body: string;
  try {
    const raw = await fs.readFile(fullPath, "utf-8");
    const parsed = matter(raw);
    body = parsed.content;
  } catch (err) {
    console.error(
      `[method/protocol] failed to load ${module.protocolMdxPath}:`,
      err,
    );
    return <ProtocolFallback minutes={module.estimatedReadMinutes} />;
  }

  return (
    <section
      aria-label="Protocol"
      className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-10"
    >
      <p className="font-heading text-coral text-[11px] tracking-[0.3em] uppercase mb-6">
        Protocol · {module.estimatedReadMinutes} min read
      </p>
      <div className="prose-method">
        <MDXRemote source={body} components={methodMdxComponents} />
      </div>
    </section>
  );
}

function ProtocolFallback({ minutes }: { minutes: number }) {
  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8 prose-method">
      <h2 className="font-heading uppercase tracking-wider text-2xl mb-4">
        Protocol
      </h2>
      <p className="text-foreground-muted leading-relaxed mb-3">
        Written protocol for this module is being finalised. When it
        publishes, you&apos;ll see the full breakdown here — the work, the why,
        and how it sits inside the twelve-week build.
      </p>
      <p className="text-sm text-foreground-muted">
        Approximate read: {minutes} min when published.
      </p>
    </section>
  );
}
