// Shared, public offer facts. The payment selection happens on Skool.
export const NDY_APPLICATION_OFFER = {
  aboutUrl: "https://www.skool.com/roadmancycling/about",
  checkoutUrl: "https://www.skool.com/roadmancycling/plans?src=join",
  price: "$195 USD/month",
  trialDays: 7,
  sarahEmail: "sarah@roadmancycling.com",
} as const;

export const NDY_GOALS = [
  "Race or event with a date",
  "Hit a specific power number",
  "Stop getting dropped on group rides",
  "Lose weight without losing power",
  "Get structured after years of winging it",
] as const;

export const NDY_HOURS = ["4-6 hours", "6-9 hours", "9-12 hours", "12+ hours"];

export function assessApplication(input: { goal: string; hours: string; frustration: string }) {
  // This is an explicit, deterministic suitability screen, not a human review
  // or an assessment of whether someone is medically cleared to exercise.
  const ready = (NDY_GOALS as readonly string[]).includes(input.goal) &&
    NDY_HOURS.includes(input.hours) &&
    !/\b(injur\w*|comeback|pain|surgery|doctor|rehab\w*)\b/i.test(input.frustration);
  return {
    outcome: ready ? "ready" as const : "review" as const,
    message: ready
      ? "Your application to Not Done Yet has been approved."
      : "We've received your application. Please ask Sarah about the programme before joining so she can check that it suits you.",
  };
}

export function ndyApplicationFlowEnabled() {
  return process.env.NDY_APPLICATION_FLOW_ENABLED === "true";
}

export function applicationNextUrl(token: string, view: "join" | "questions" = "join") {
  // Fragment keeps the bearer token out of request URLs, access logs and referrers.
  // Preview applications share the configured database, but their action API is
  // enabled only on the preview deployment during release QA. Keep each token on
  // the deployment that created it; production always uses the public origin.
  const deploymentHost = process.env.VERCEL_URL?.trim();
  const origin = process.env.VERCEL_ENV === "preview" && deploymentHost
    ? `https://${deploymentHost.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
    : "https://www.roadmancycling.com";
  return `${origin}/apply/next#${view}/${token}`;
}
