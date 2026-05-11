import { redirect } from "next/navigation";

/**
 * /method/login/verify — landing for users who navigate there directly
 * (e.g. paste the email link into a browser without the token query).
 *
 * The actual token consumption happens in the API route
 * `GET /api/method/login/verify` — that route 302s to /method on success
 * or back to /method/login?error=invalid on failure. Hitting this page
 * with no token means the token query was stripped or the user
 * mistyped — bounce them to the login form.
 */
export default async function VerifyLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  if (params.token) {
    // Defensive: forward to the API handler. Normal email-click traffic
    // never lands here because the link points directly at /api/...
    redirect(
      `/api/method/login/verify?token=${encodeURIComponent(params.token)}`,
    );
  }
  redirect("/method/login?error=invalid");
}
