import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { LoginForm } from "../_components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in · The Method",
};

export default async function MethodLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error === "invalid"
    ? "That sign-in link has expired or already been used. Request a fresh one below."
    : null;

  return (
    <Container as="section" width="narrow" className="min-h-[80vh] py-20 flex flex-col justify-center">
      <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
        THE ROADMAN METHOD
      </p>
      <h1 className="font-heading uppercase leading-[0.95] text-5xl md:text-6xl mb-4">
        Sign in
      </h1>
      <p className="text-lg text-foreground-muted mb-8 max-w-lg">
        Enter your email — we'll send you a one-tap sign-in link. No passwords,
        no fuss.
      </p>
      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral"
        >
          {errorMessage}
        </p>
      )}
      <LoginForm />
      <p className="mt-12 text-sm text-foreground-muted">
        Haven't bought yet?{" "}
        <a
          href="/method/checkout"
          className="text-coral underline-offset-4 hover:underline"
        >
          Read about The Method →
        </a>
      </p>
    </Container>
  );
}
