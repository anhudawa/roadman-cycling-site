import { applicationNextUrl, assessApplication } from "./application-offer";

export type EnrollmentResult = {
  status: "enrolled" | "failed" | "uncertain" | "suppressed";
  error?: string;
  subscriberId?: string;
  journeyId?: string;
};

type Subscriber = { id: string; email: string; status: string };

/** Unlike the general newsletter helper, every required step is checked and an
 * existing opt-out is never reactivated. No email is sent during preparation.
 * The callback durably marks the point after which retrying may duplicate mail.
 */
export async function enrollNdyApplicant(
  input: { name: string; email: string; accessToken: string; goal: string; hours: string; frustration: string },
  beforeEnroll: (subscriberId: string) => Promise<void>,
): Promise<EnrollmentResult> {
  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUBLICATION_ID;
  const automation = process.env.BEEHIIV_AUTOMATION_NDY_APPLICATION;
  if (!key || !pub || !automation) return { status: "failed", error: "Beehiiv application automation is not configured" };
  const base = `https://api.beehiiv.com/v2/publications/${pub}`;
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const request = (path: string, init: RequestInit = {}) => fetch(`${base}${path}`, {
    ...init, headers, cache: "no-store", signal: AbortSignal.timeout(8000),
  });
  let subscriberId: string | undefined;
  let enrolling = false;
  try {
    const lookup = async () => {
      const res = await request(`/subscriptions?email=${encodeURIComponent(input.email)}&limit=100`);
      if (!res.ok) throw new Error(`Beehiiv subscriber lookup failed (${res.status})`);
      const json = await res.json() as { data?: Subscriber[] };
      return json.data?.find((s) => s.email.toLowerCase() === input.email.toLowerCase());
    };
    let subscriber = await lookup();
    if (!subscriber) {
      const res = await request("/subscriptions", { method: "POST", body: JSON.stringify({
        email: input.email, reactivate_existing: false, send_welcome_email: false,
        utm_source: "roadman-site", utm_medium: "coaching-application", utm_campaign: "ndy-application",
      }) });
      if (res.status === 409) subscriber = await lookup();
      else {
        if (!res.ok) throw new Error(`Beehiiv subscriber creation failed (${res.status})`);
        subscriber = (await res.json() as { data?: Subscriber }).data;
      }
    }
    if (!subscriber?.id) throw new Error("Beehiiv did not return a subscriber ID");
    subscriberId = subscriber.id;
    if (subscriber.status !== "active") return {
      status: "suppressed", subscriberId,
      error: "Subscriber is not active; check opt-in or suppression in Beehiiv before sending",
    };
    const assessment = assessApplication(input);
    const fields = {
      ndy_first_name: input.name.trim().split(/\s+/)[0],
      ndy_application_message: assessment.message,
      ndy_join_url: applicationNextUrl(input.accessToken, "join"),
      ndy_questions_url: applicationNextUrl(input.accessToken, "questions"),
    };
    const updated = await request(`/subscriptions/${subscriberId}`, { method: "PATCH", body: JSON.stringify({
      custom_fields: Object.entries(fields).map(([name, value]) => ({ name, value })),
    }) });
    if (!updated.ok) throw new Error(`Beehiiv application fields failed (${updated.status})`);
    const tagged = await request(`/subscriptions/${subscriberId}/tags`, { method: "POST", body: JSON.stringify({ tags: ["ndy-applicant"] }) });
    if (!tagged.ok) throw new Error(`Beehiiv application tag failed (${tagged.status})`);
    await beforeEnroll(subscriberId);
    enrolling = true;
    const enrolled = await request(`/automations/${automation}/journeys`, {
      method: "POST", body: JSON.stringify({ subscription_id: subscriberId }),
    });
    // A timeout or 5xx may occur after Beehiiv has accepted a send. Never retry
    // that ambiguous request automatically. The admin sees 'Check Beehiiv'.
    if (!enrolled.ok) return {
      status: enrolled.status >= 500 ? "uncertain" : "failed", subscriberId,
      error: `Beehiiv automation enrollment failed (${enrolled.status})`,
    };
    const journey = (await enrolled.json() as { data?: { id?: string } }).data;
    if (!journey?.id) return { status: "uncertain", subscriberId, error: "Beehiiv accepted enrollment without a journey ID; check before retrying" };
    return { status: "enrolled", subscriberId, journeyId: journey.id };
  } catch (err) {
    return {
      status: enrolling ? "uncertain" : "failed", subscriberId,
      error: err instanceof Error ? err.message : "Beehiiv request failed",
    };
  }
}
