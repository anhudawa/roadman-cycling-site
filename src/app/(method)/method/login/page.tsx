import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/layout/Container";
import { LoginForm } from "../_components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in · The Method",
  robots: { index: false, follow: false },
};

const RETURN_HINT_COOKIE = "method_return_hint";

/**
 * /method/login
 *
 * Email-only sign-in. The header reframes itself for returning members
 * — if the `method_return_hint` cookie is set (we drop a non-HttpOnly
 * marker on first successful session) we say "Welcome back" instead of
 * "Sign in". The cookie carries no PII; it's purely a UX hint.
 */
export default async function MethodLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params.error === "invalid"
      ? "That sign-in link has expired or already been used. Request a fresh one below."
      : params.error === "session"
      ? "Your sign-in session ended. Pop your email in for a fresh link."
      : null;

  const cookieStore = await cookies();
  const isReturning = cookieStore.has(RETURN_HINT_COOKIE);

  const headline = isReturning ? "Welcome back" : "Sign in";
  const subhead = isReturning
    ? "One tap and you're straight back to where you left off."
    : "Drop your email in — we'll send you a one-tap sign-in link. No passwords, no fuss.";

  return (
    <Container as="section" width="narrow" className="min-h-[80vh] py-20 flex flex-col justify-center">
      <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
        THE ROADMAN METHOD
      </p>
      <h1 className="font-heading uppercase leading-[0.95] text-5xl md:text-6xl mb-4">
        {headline}
      </h1>
      <p className="text-lg text-foreground-muted mb-8 max-w-lg">{subhead}</p>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral"
        >
          {errorMessage}
        </p>
      )}

      <div className="rounded-xl border border-white/10 bg-charcoal/60 p-6 md:p-8">
        <LoginForm defaultEmail={params.email ?? ""} />
      </div>

      <div className="mt-12 grid gap-2 text-sm text-foreground-muted">
        <p>
          Haven&apos;t bought yet?{" "}
          <a
            href="/method/checkout"
            className="text-coral underline-offset-4 hover:underline"
          >
            Read about The Method →
          </a>
        </p>
        <p>
          Need a hand?{" "}
          <a
            href="mailto:support@roadmancycling.com"
            className="text-coral underline-offset-4 hover:underline"
          >
            support@roadmancycling.com
          </a>
        </p>
      </div>
    </Container>
  );
}
