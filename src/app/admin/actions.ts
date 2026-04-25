"use server";

import { login, logout } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { seedEvents } from "@/lib/admin/seed";

export async function loginAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  const success = await login(password);
  if (!success) {
    return { error: "Invalid password" };
  }

  // Seed data on first login if needed
  try {
    await seedEvents();
  } catch {
    // Non-critical $— dashboard works without seed data
  }

  // Return success instead of redirect() $— the client handles navigation
  // so the Set-Cookie header is properly applied before the redirect
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/admin/login");
}
