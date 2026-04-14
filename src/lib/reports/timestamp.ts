// src/lib/reports/timestamp.ts

export function approximateTimestamp(
  charIndex: number,
  transcriptLength: number,
  durationSeconds: number,
): number {
  if (transcriptLength <= 0 || durationSeconds <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, charIndex / transcriptLength));
  return Math.floor(ratio * durationSeconds);
}

export function parseDurationString(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  const parts = trimmed.split(':').map((p) => parseInt(p, 10));
  if (parts.some((n) => isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
