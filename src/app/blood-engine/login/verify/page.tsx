import { redirect } from "next/navigation";
import { Section, Container } from "@/components/layout";
import { getUserById, recordLogin } from "@/lib/blood-engine/db";
import { verifyMagicLinkToken } from "@/lib/blood-engine/magic-link";
import { setSessionCookie } from "@/lib/blood-engine/session";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  const userId = verifyMagicLinkToken(token);

  if (userId) {
    const user = await getUserById(userId);
    if (user?.hasAccess) {
      await setSessionCookie(user.id);
      await recordLogin(user.id);
      redirect("/blood-engine/dashboard");
    }
  }

  return (
    <Section background="deep-purple" fullHeight>
      <Container width="narrow" className="text-center">
        <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white">
          Link invalid or expired
        </h1>
        <p className="mt-6 text-body-lg text-foreground-muted max-w-md mx-auto">
          Sign-in links expire after 30 minutes. Request a fresh one — it&apos;ll take a few seconds.
        </p>
        <div className="mt-10">
          <a
            href="/blood-engine/login"
            className="inline-block font-heading tracking-wider uppercase bg-coral hover:bg-coral-hover text-off-white px-8 py-4 rounded-md"
          >
            Send a new link
          </a>
        </div>
      </Container>
    </Section>
  );
}
