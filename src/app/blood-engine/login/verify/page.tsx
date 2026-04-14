import { redirect } from "next/navigation";
import { Section, Container } from "@/components/layout";
import { getUserById, recordLogin } from "@/lib/blood-engine/db";
import { verifyMagicLinkToken } from "@/lib/blood-engine/magic-link";
import { setSessionCookie, verifyTokenSignatureOnly } from "@/lib/blood-engine/session";
import { ResendLinkForm } from "./ResendLinkForm";

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

  // Token was signed by us (we can prove it via HMAC) but is expired — look up
  // the email so we can pre-fill the resend form. Pure UX, no access granted.
  // If the signature is wrong we just present a blank form.
  let prefillEmail: string | null = null;
  const decoded = verifyTokenSignatureOnly(token);
  if (decoded) {
    const user = await getUserById(decoded.userId);
    if (user?.hasAccess) prefillEmail = user.email;
  }

  return (
    <Section background="deep-purple" fullHeight>
      <Container width="narrow" className="text-center">
        <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white">
          Link invalid or expired
        </h1>
        <p className="mt-6 text-body-lg text-foreground-muted max-w-md mx-auto">
          Sign-in links expire after 30 minutes. Request a fresh one — it&apos;ll
          take a few seconds.
        </p>
        <div className="mt-10 max-w-md mx-auto">
          <ResendLinkForm initialEmail={prefillEmail ?? ""} />
        </div>
        <p className="mt-8 text-sm text-foreground-subtle">
          Don&apos;t have access yet?{" "}
          <a href="/blood-engine" className="text-coral hover:underline">
            Get lifetime access for €97 →
          </a>
        </p>
      </Container>
    </Section>
  );
}
