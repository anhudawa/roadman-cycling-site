import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailMessages } from "@/lib/db/schema";
import { addActivity } from "@/lib/crm/contacts";

type ResendEventType =
  | "email.sent"
  | "email.delivered"
  | "email.bounced"
  | "email.complained"
  | "email.opened"
  | "email.clicked"
  | string;

interface ResendEvent {
  type?: ResendEventType;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    subject?: string;
    click?: { link?: string };
    bounce?: { message?: string };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Svix-style signature verification. Resend sends three headers:
 *   svix-id, svix-timestamp, svix-signature
 * where svix-signature is a space-separated list of "v1,<base64>".
 * The signed string is `${id}.${timestamp}.${body}` and the secret is
 * delivered as `whsec_<base64>` $— strip the prefix before decoding.
 */
function verifySvixSignature(
  rawBody: string,
  headers: Headers,
  secret: string
): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  const normalizedSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(normalizedSecret, "base64");
  } catch {
    return false;
  }

  const signedPayload = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(signedPayload)
    .digest("base64");

  const candidates = signatureHeader
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const idx = p.indexOf(",");
      return idx === -1 ? p : p.slice(idx + 1);
    });

  return candidates.some((sig) => {
    try {
      const a = Buffer.from(sig, "base64");
      const b = Buffer.from(expected, "base64");
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  // Fail-closed: missing secret is a misconfig, not a bypass. Allowing
  // unverified events would let anyone inflate open/click stats by POSTing
  // fabricated events to this endpoint.
  if (!secret) {
    console.error(
      "[resend webhook] RESEND_WEBHOOK_SECRET not set $— rejecting event"
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }
  if (!verifySvixSignature(rawBody, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type;
  const emailId = event.data?.email_id;
  if (!type || !emailId) {
    return NextResponse.json({ ok: true });
  }

  const matches = await db
    .select()
    .from(emailMessages)
    .where(eq(emailMessages.resendMessageId, emailId))
    .limit(1);
  const message = matches[0];
  if (!message) {
    // Non-CRM email or unmatched $— silently accept.
    return NextResponse.json({ ok: true });
  }

  const now = new Date();

  switch (type) {
    case "email.sent": {
      await db
        .update(emailMessages)
        .set({ status: "sent", sentAt: message.sentAt ?? now })
        .where(eq(emailMessages.id, message.id));
      break;
    }
    case "email.delivered": {
      await db
        .update(emailMessages)
        .set({ status: "delivered", deliveredAt: now })
        .where(eq(emailMessages.id, message.id));
      break;
    }
    case "email.bounced": {
      const bounceMsg =
        (event.data?.bounce && typeof event.data.bounce === "object"
          ? (event.data.bounce as { message?: string }).message
          : undefined) ?? "Bounced";
      await db
        .update(emailMessages)
        .set({ status: "bounced", errorMessage: bounceMsg })
        .where(eq(emailMessages.id, message.id));
      break;
    }
    case "email.complained": {
      await db
        .update(emailMessages)
        .set({ status: "complained" })
        .where(eq(emailMessages.id, message.id));
      break;
    }
    case "email.opened": {
      await db
        .update(emailMessages)
        .set({ openedAt: message.openedAt ?? now })
        .where(eq(emailMessages.id, message.id));
      await addActivity(message.contactId, {
        type: "email_opened",
        title: `Opened: ${message.subject}`,
        meta: { messageId: message.id, resendId: emailId },
      });
      break;
    }
    case "email.clicked": {
      const link =
        event.data?.click && typeof event.data.click === "object"
          ? (event.data.click as { link?: string }).link
          : undefined;
      await db
        .update(emailMessages)
        .set({ clickedAt: now })
        .where(eq(emailMessages.id, message.id));
      await addActivity(message.contactId, {
        type: "email_clicked",
        title: `Clicked link in: ${message.subject}`,
        meta: { messageId: message.id, resendId: emailId, link: link ?? null },
      });
      break;
    }
    default:
      // Unknown event $— accept silently.
      break;
  }

  return NextResponse.json({ ok: true });
}
