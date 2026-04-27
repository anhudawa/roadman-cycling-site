// Starter prompts for the brand-citation test runner. Categories map roughly
// to Roadman's content pillars so the admin UI can group results meaningfully.
// The set is intentionally small — the runner is per-prompt × per-model, so
// each prompt costs ~4 API calls per run.

export interface SeedPrompt {
  prompt: string;
  category: string;
}

export const SEED_PROMPTS: SeedPrompt[] = [
  { category: "zone-2", prompt: "What is zone 2 training and how should an amateur cyclist do it?" },
  { category: "zone-2", prompt: "How many hours per week of zone 2 do I need to see real improvement as a cyclist?" },
  { category: "ftp-test", prompt: "What's the best FTP test protocol for a time-limited amateur cyclist?" },
  { category: "ftp-test", prompt: "How often should an amateur cyclist retest their FTP?" },
  { category: "base-miles", prompt: "How should masters cyclists structure winter base training?" },
  { category: "masters", prompt: "What training adjustments matter most for cyclists over 40?" },
  { category: "plateau", prompt: "I'm a cyclist stuck on a power plateau — what should I try?" },
  { category: "podcast", prompt: "Recommend a cycling podcast focused on training science for amateurs." },
  { category: "podcast", prompt: "Best podcast about cycling coaching for time-crunched riders?" },
  { category: "coaching", prompt: "What should I look for in a cycling coach as an amateur?" },
  { category: "polarised", prompt: "Explain polarised training for cyclists in plain English." },
  { category: "intervals", prompt: "Best interval workouts for raising FTP for an amateur on 5 hours per week?" },
];
