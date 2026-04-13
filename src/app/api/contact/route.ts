import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

const NOTIFICATION_EMAIL = "anthony@roadmancycling.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    console.log(`[Contact Form] From: ${name} <${email}> | Subject: ${subject}`);

    // Store in database
    try {
      await db.insert(contactSubmissions).values({
        name,
        email,
        subject,
        message,
      });
    } catch (dbErr) {
      console.error("[Contact Form] DB insert failed:", dbErr);
    }

    // Send email notification
    const resend = getResend();
    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          from: "Roadman Cycling <noreply@roadmancycling.com>",
          to: NOTIFICATION_EMAIL,
          replyTo: email,
          subject: `[Contact Form] ${subject} — from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p>${message.replace(/\n/g, "<br />")}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Reply directly to this email to respond to ${name}.</p>
          `,
        });
        console.log("[Contact Form] Email sent:", JSON.stringify(emailResult));
      } catch (emailErr) {
        console.error("[Contact Form] Resend email failed:", emailErr);
      }
    } else {
      console.warn("[Contact Form] RESEND_API_KEY not configured — email not sent");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
