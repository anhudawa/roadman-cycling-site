import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Blood Engine",
  description: "Sign in to Blood Engine to run a new report or view your history.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const params = await searchParams;
  const fromCheckout = params.paid === "1";

  return (
    <Section background="deep-purple" fullHeight>
      <Container width="narrow" className="text-center">
        <p className="font-heading tracking-[0.3em] text-coral text-sm md:text-base mb-6">
          Blood Engine
        </p>
        <h1 className="font-heading uppercase text-[var(--text-section)] leading-none text-off-white">
          Sign in
        </h1>
        {fromCheckout ? (
          <p className="mt-6 text-body-lg text-foreground-muted max-w-md mx-auto">
            Payment received. Check your inbox for a sign-in link — it should arrive in under a minute.
            If it doesn&apos;t, use the form below to send a new one.
          </p>
        ) : (
          <p className="mt-6 text-body-lg text-foreground-muted max-w-md mx-auto">
            Enter your email and we&apos;ll send you a sign-in link.
          </p>
        )}
        <div className="mt-10 max-w-md mx-auto">
          <LoginForm />
        </div>
        <p className="mt-10 text-sm text-foreground-subtle">
          Don&apos;t have access yet?{" "}
          <a href="/blood-engine" className="text-coral hover:underline">
            Get lifetime access for €97 →
          </a>
        </p>
      </Container>
    </Section>
  );
}
