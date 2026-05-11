import { redirect } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { getProgressSummary } from "@/lib/method/progress";
import { isModuleUnlocked } from "@/lib/method/access";
import { METHOD_MODULES } from "@/lib/method/modules";
import { ProgressRing } from "./_components/ProgressRing";
import { ModuleCard } from "./_components/ModuleCard";

/**
 * /method — course dashboard.
 *
 * Server component. Pulls the session + progress, renders the 12-module
 * grid with per-module unlock state. Layout already redirects to /login
 * if no session, so this component can assume a session exists.
 */
export default async function MethodDashboard() {
  const session = await getMethodSession();
  if (!session) redirect("/method/login");

  const progress = await getProgressSummary(session.enrollment.id);

  return (
    <Container as="section" width="wide" className="pt-12 pb-12 md:pt-20">
      <header className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end mb-16">
        <div>
          <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
            THE ROADMAN METHOD
          </p>
          <h1 className="font-heading uppercase leading-[0.95] text-[clamp(3rem,7vw,6rem)] mb-4">
            {greetingFor(session.enrollment.name)}
          </h1>
          <p className="max-w-xl text-lg text-foreground-muted">
            Twelve modules. One framework. Work them in order. Take your time
            on Module 01 — everything else builds on it.
          </p>
        </div>
        <ProgressRing percent={progress.percentComplete} />
      </header>

      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-heading uppercase tracking-wider text-2xl">
          Modules
        </h2>
        <p className="text-sm text-foreground-muted">
          {progress.completedCount} of {progress.totalCount} complete
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {METHOD_MODULES.map((module) => {
          const availability = isModuleUnlocked(session.enrollment, module);
          const completed = progress.completedSlugs.has(module.slug);
          return (
            <li key={module.slug}>
              <ModuleCard
                module={module}
                availability={availability}
                completed={completed}
              />
            </li>
          );
        })}
      </ul>

      <p className="mt-12 text-sm text-foreground-muted">
        Need help? <Link href="/method/account" className="text-coral underline-offset-4 hover:underline">Account & support →</Link>
      </p>
    </Container>
  );
}

function greetingFor(name: string | null): string {
  if (!name) return "WELCOME BACK";
  const first = name.split(" ")[0]?.trim() ?? "";
  if (!first) return "WELCOME BACK";
  return `WELCOME BACK, ${first.toUpperCase()}`;
}
