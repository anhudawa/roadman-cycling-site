import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Log the contact form submission
    // In production, integrate with email service (e.g., Resend, SendGrid)
    // to send notification to ted@roadmancycling.com
    console.log(`[Contact Form] From: ${name} <${email}> | Subject: ${subject}`);
    console.log(`[Contact Form] Message: ${message}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
