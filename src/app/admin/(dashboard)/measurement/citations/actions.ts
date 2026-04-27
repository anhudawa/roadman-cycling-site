"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import {
  addPrompt,
  deletePrompt,
  setPromptEnabled,
} from "@/lib/citation-tests/store";
import { runAllPrompts } from "@/lib/citation-tests";

async function ensureAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
}

export async function createPromptAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const category = String(formData.get("category") ?? "general").trim();
  if (!prompt) return;
  await addPrompt(prompt, category);
  revalidatePath("/admin/measurement/citations");
}

export async function togglePromptAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = Number(formData.get("id"));
  const enabled = formData.get("enabled") === "true";
  if (!Number.isFinite(id)) return;
  await setPromptEnabled(id, enabled);
  revalidatePath("/admin/measurement/citations");
}

export async function deletePromptAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;
  await deletePrompt(id);
  revalidatePath("/admin/measurement/citations");
}

export async function runNowAction(): Promise<void> {
  await ensureAdmin();
  // Fire-and-store: result rows land in brand_citation_runs; the page
  // revalidates and re-renders the matrix from there. We deliberately don't
  // surface the in-memory summary back to the form because Next.js form
  // actions wired via `<form action={fn}>` must return void.
  await runAllPrompts();
  revalidatePath("/admin/measurement/citations");
  revalidatePath("/admin/measurement");
}
