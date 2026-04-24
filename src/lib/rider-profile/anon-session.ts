import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

const COOKIE_NAME = "roadman_ask_anon";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

export async function getOrCreateAnonSessionKey(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME);
  if (existing?.value) return existing.value;
  const key = randomBytes(24).toString("base64url");
  jar.set(COOKIE_NAME, key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return key;
}

export async function readAnonSessionKey(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}
