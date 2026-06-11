# Fact blocklist — HARD RULES

Checked during every chapter verify step. Transcripts are the source of truth; the brand bible (knowledge-base.md) is a secondary source with at least one known error.

## 1. Dan Lorang did NOT coach Tadej Pogačar

- This false attribution exists in the brand bible and has recurred repeatedly. It must never appear in any draft, in any phrasing.
- Verified association: high-level performance coach connected with Bora-Hansgrohe (Head of Performance, Red Bull–Bora–Hansgrohe per `src/lib/ask/corrections.ts`) and Jan Frodeno (triathlon).
- Do not state who Lorang coached in cycling without explicit verification from Anthony.
- Known wrong phrasings to scan for (from `src/lib/ask/corrections.ts:47`): "Dan Lorang is Pogačar's coach", "Dan Lorang trains Pogačar", "Pogačar is coached by Dan Lorang", "Lorang coaches Pogacar" — and any paraphrase.

## 2. General rule — coach-rider attributions

When uncertain about ANY coach-rider attribution, flag in `/verify/` rather than assert. Never resolve uncertainty by guessing.
