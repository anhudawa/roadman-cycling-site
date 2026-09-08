// Shared, public offer facts. The payment selection happens on Skool.
export const NDY_APPLICATION_OFFER = {
  aboutUrl: "https://www.skool.com/roadmancycling/about",
  checkoutUrl: "https://www.skool.com/roadmancycling/plans?src=join",
  price: "$195 USD/month",
  adminNotificationEmail: "anthony@roadmancycling.com",
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
      ? "We've automatically reviewed your application. Based on your cycling goal and available training time, we think Not Done Yet is a great fit for you."
      : "Thanks for applying to Not Done Yet. We'd like to check how the coaching fits your circumstances. You can explore the programme below, or ask Sarah a question before joining.",
  };
}

export function ndyApplicationFlowEnabled() {
  return process.env.NDY_APPLICATION_FLOW_ENABLED === "true";
}

export function applicationNextUrl(token: string, view: "join" | "questions" = "join") {
  // Fragment keeps the bearer token out of request URLs, access logs and referrers.
  return `https://www.roadmancycling.com/apply/next#${view}/${token}`;
}
