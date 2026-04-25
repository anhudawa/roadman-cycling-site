import crypto from "crypto";
import { db } from "@/lib/db";
import { consentRecords } from "@/lib/db/schema";
import type { ConsentRecord, ConsentType } from "./types";

/**
 * Consent audit log. Every explicit consent UI interaction writes here
 * with a copy-version hash and a one-way IP hash. The boolean flags on
 * `rider_profiles` remain the fast-read state; this table is the GDPR
 * audit trail $— if a rider asks "what exactly did I agree to and when?"
 * we can replay it precisely.
 */

export interface LogConsentInput {
  riderProfileId: number | null;
  email: string;
  consentType: ConsentType;
  granted: boolean;
  /** Which surface captured the consent, e.g. "fuelling:save-form". */
  source: string;
  /** Verbatim consent copy the rider saw (hashed for space + privacy). */
  copyText?: string | null;
  /** Raw client IP $— hashed on the way in, never stored plain. */
  ipAddress?: string | null;
  userAgent?: string | null;
}

function hashCopy(copyText: string | null | undefined): string | null {
  if (!copyText) return null;
  return crypto.createHash("sha256").update(copyText).digest("hex").slice(0, 16);
}

function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  // Salt with a process-local secret if available so hashes can't be
  // looked up from a rainbow table of public IP space.
  const salt = process.env.CONSENT_IP_SALT ?? "roadman-consent";
  return crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export async function logConsent(input: LogConsentInput): Promise<ConsentRecord> {
  const [row] = await db
    .insert(consentRecords)
    .values({
      riderProfileId: input.riderProfileId,
      email: input.email,
      consentType: input.consentType,
      granted: input.granted,
      source: input.source,
      copyVersion: hashCopy(input.copyText),
      ipHash: hashIp(input.ipAddress),
      userAgent: input.userAgent ?? null,
    })
    .returning();

  return {
    id: row.id,
    riderProfileId: row.riderProfileId,
    email: row.email,
    consentType: row.consentType as ConsentType,
    granted: row.granted,
    source: row.source,
    copyVersion: row.copyVersion,
    ipHash: row.ipHash,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
  };
}

export type { ConsentType, ConsentRecord };
