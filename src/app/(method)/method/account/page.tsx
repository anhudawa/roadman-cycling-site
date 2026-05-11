import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getMethodSession } from "@/lib/method/auth";
import { LogoutButton } from "../_components/LogoutButton";

export const metadata: Metadata = {
  title: "Account · The Method",
};

export default async function MethodAccountPage() {
  const session = await getMethodSession();
  if (!session) redirect("/method/login");

  const enrollment = session.enrollment;

  return (
    <Container as="section" width="narrow" className="py-16">
      <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
        THE ROADMAN METHOD
      </p>
      <h1 className="font-heading uppercase leading-[0.95] text-5xl md:text-6xl mb-10">
        Account
      </h1>

      <dl className="grid gap-4 mb-12">
        <div className="grid grid-cols-[auto_1fr] gap-x-6 py-3 border-t border-white/10">
          <dt className="text-sm text-foreground-muted">Email</dt>
          <dd className="text-off-white">{enrollment.email}</dd>
        </div>
        {enrollment.name && (
          <div className="grid grid-cols-[auto_1fr] gap-x-6 py-3 border-t border-white/10">
            <dt className="text-sm text-foreground-muted">Name</dt>
            <dd className="text-off-white">{enrollment.name}</dd>
          </div>
        )}
        <div className="grid grid-cols-[auto_1fr] gap-x-6 py-3 border-t border-white/10">
          <dt className="text-sm text-foreground-muted">Status</dt>
          <dd className="text-off-white capitalize">{enrollment.status}</dd>
        </div>
        {enrollment.paidAt && (
          <div className="grid grid-cols-[auto_1fr] gap-x-6 py-3 border-t border-b border-white/10">
            <dt className="text-sm text-foreground-muted">Joined</dt>
            <dd className="text-off-white">
              {enrollment.paidAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        )}
      </dl>

      <h2 className="font-heading uppercase tracking-wider text-xl mb-3">
        Need help?
      </h2>
      <p className="text-foreground-muted mb-8">
        Reply to any email from us, or write to{" "}
        <a
          href="mailto:support@roadmancycling.com"
          className="text-coral underline-offset-4 hover:underline"
        >
          support@roadmancycling.com
        </a>
        .
      </p>

      <LogoutButton />
    </Container>
  );
}
