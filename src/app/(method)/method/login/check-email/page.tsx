import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Check your email · The Method",
};

export default function CheckEmailPage() {
  return (
    <Container as="section" width="narrow" className="min-h-[80vh] py-20 flex flex-col justify-center">
      <p className="font-heading text-sm tracking-[0.3em] text-coral mb-3">
        THE ROADMAN METHOD
      </p>
      <h1 className="font-heading uppercase leading-[0.95] text-5xl md:text-6xl mb-4">
        Check your inbox
      </h1>
      <p className="text-lg text-foreground-muted mb-3">
        If that email is on the list, a sign-in link is on the way. The link
        expires in 15 minutes and only works once.
      </p>
      <p className="text-foreground-muted">
        Nothing in two minutes? Check spam, then{" "}
        <a
          href="/method/login"
          className="text-coral underline-offset-4 hover:underline"
        >
          request another
        </a>
        .
      </p>
    </Container>
  );
}
