#!/usr/bin/env python3
"""Manifesto verify-step scanner.

Mechanical checks for a chapter draft (the human checks — claim tracing,
verbatim quote verification — still happen by hand and go in the chapter's
/verify/ report):

  1. Fact blocklist (manifesto/blocklist.md rules — Lorang/Pogacar proximity)
  2. Banned words and banned openers (voice rules)
  3. Structural tells: em-dash density, "It isn't X. It's Y." loops,
     uniform paragraph lengths, three consecutive same-shape paragraphs
  4. Citation hygiene: quotes lacking an episode reference nearby

Usage: python3 manifesto/verify/scan.py drafts/ch01-v1.md
Exit code 1 if any HARD failure (blocklist) is found.
"""
import re, sys, statistics

BANNED_WORDS = [
    "delve", "unpack", "multifaceted", "in today's world", "it's worth noting",
    "straightforward", "game-changer", "game changer", "robust", "synergy",
    "at its core", "at the end of the day", "journey", "unlock your potential",
    "elevate",
]
# "leverage" banned as a verb only — approximate: leverage followed by noun-ish
BANNED_VERB_LEVERAGE = re.compile(r"\bleverag(e|es|ed|ing)\b", re.I)

BANNED_OPENERS = [
    "here's what nobody tells you",
    "the cycling internet won't tell you",
    "let me break this down",
    "stick around to the end",
]

def fail(issues, level, line, msg):
    issues.append((level, line, msg))

def main(path):
    text = open(path, encoding="utf-8").read()
    lines = text.split("\n")
    lower = text.lower()
    issues = []

    # --- 1. blocklist: Lorang must never be linked to Pogacar ---
    for i, ln in enumerate(lines, 1):
        l = ln.lower()
        if "lorang" in l and re.search(r"poga[cč]ar|pogacar", l):
            fail(issues, "HARD", i, "BLOCKLIST: Lorang and Pogacar in the same line")
    # window check: within 3 lines of each other
    lorang_lines = [i for i, ln in enumerate(lines) if "lorang" in ln.lower()]
    poga_lines = [i for i, ln in enumerate(lines) if re.search(r"poga[cč]ar", ln.lower())]
    for a in lorang_lines:
        for b in poga_lines:
            if 0 < abs(a - b) <= 3:
                fail(issues, "HARD", a + 1, "BLOCKLIST: Lorang within 3 lines of Pogacar — check the claim")
    if "lorang" in lower:
        fail(issues, "WARN", 0, "Lorang mentioned — verify the association is one Anthony explicitly approved")

    # --- 2. banned words / openers ---
    for w in BANNED_WORDS:
        for i, ln in enumerate(lines, 1):
            if w in ln.lower():
                fail(issues, "FAIL", i, f"banned word: '{w}'")
    if BANNED_VERB_LEVERAGE.search(text):
        for i, ln in enumerate(lines, 1):
            if BANNED_VERB_LEVERAGE.search(ln):
                fail(issues, "WARN", i, "'leverage' — banned as a verb, check usage")
    for o in BANNED_OPENERS:
        if o in lower:
            i = next(i for i, ln in enumerate(lines, 1) if o in ln.lower())
            fail(issues, "FAIL", i, f"banned opener: '{o}'")

    # --- 3. structural tells ---
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip() and not p.strip().startswith("#")]
    em_dashes = text.count("—")
    words = len(text.split())
    if words and em_dashes / words > 0.004:  # > ~1 per 250 words
        fail(issues, "WARN", 0, f"em-dash density high: {em_dashes} in {words} words")
    isnt_its = len(re.findall(r"\b(?:isn't|wasn't|not)\b[^.]*\.\s*It(?:'s|\s+is)\b", text, re.I))
    if isnt_its >= 3:
        fail(issues, "WARN", 0, f"'It isn't X. It's Y.' pattern appears {isnt_its} times")
    if len(paras) >= 6:
        lens = [len(p.split()) for p in paras]
        if statistics.pstdev(lens) / (statistics.mean(lens) or 1) < 0.35:
            fail(issues, "WARN", 0, "paragraph lengths unusually uniform — vary the rhythm")
        # three consecutive paragraphs sharing first-word + sentence-count shape
        for j in range(len(paras) - 2):
            trio = paras[j:j + 3]
            shapes = [(p.split()[0].lower(), p.count(".")) for p in trio]
            if len(set(shapes)) == 1:
                fail(issues, "WARN", 0, f"three consecutive same-shape paragraphs (around paragraph {j + 1})")

    # --- 4. citation hygiene: block quotes need an episode ref within 2 lines ---
    for i, ln in enumerate(lines):
        if ln.strip().startswith(">"):
            window = "\n".join(lines[max(0, i - 2):i + 3]).lower()
            if not re.search(r"ep[ .#-]?\d+|episode\s+\d+|\d{1,2}:\d{2}", window):
                fail(issues, "FAIL", i + 1, "quote without an episode/timestamp reference nearby")

    # --- report ---
    order = {"HARD": 0, "FAIL": 1, "WARN": 2}
    issues.sort(key=lambda x: (order[x[0]], x[1]))
    if not issues:
        print(f"{path}: clean")
        return 0
    for level, line, msg in issues:
        loc = f":{line}" if line else ""
        print(f"{level} {path}{loc} — {msg}")
    hard = sum(1 for lvl, _, _ in issues if lvl == "HARD")
    print(f"\n{len(issues)} issue(s), {hard} blocklist HARD failure(s)")
    return 1 if hard else 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
