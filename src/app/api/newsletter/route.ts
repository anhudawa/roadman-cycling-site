import { NextResponse } from "next/server";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

export async function POST(request: Request) {
  try {
    const { email, source } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // If Beehiiv credentials are configured, subscribe via API
    if (BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
      const res = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({
            email,
            reactivate_existing: true,
            send_welcome_email: true,
            utm_source: "website",
            utm_medium: source || "organic",
            referring_site: "roadmancycling.com",
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        console.error("Beehiiv API error:", data);
        return NextResponse.json(
          { error: "Failed to subscribe. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Fallback: log the email if no Beehiiv credentials
    // In production, always configure BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID
    console.log(`[Newsletter Signup] ${email} (source: ${source})`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
