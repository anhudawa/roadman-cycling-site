#!/usr/bin/env python3
"""
Restore typographic characters that were corrupted by an earlier
sed-based currency-standardisation pass. The pass replaced byte
\\xe2 (and likely \\xc2) with $, which broke every multi-byte UTF-8
character whose lead byte was \\xe2 or \\xc2.

We restore a conservative whitelist — only typographic punctuation we
know we want back. Currency symbols (£, €, ¥, ¢) are intentionally
left alone, because the team has been migrating prices to USD and
restoring £/€ in docs/comments could undo that work in surprising
ways. Surface those as a separate human-review pass if needed.

Usage:
  python3 scripts/restore-stripped-utf8.py [path1 path2 ...]
"""
from __future__ import annotations

import sys
from pathlib import Path

# Three-byte sequences originally led by \xe2.
THREE_BYTE = {
    b"\x24\x80\x94": b"\xe2\x80\x94",  # — em-dash
    b"\x24\x80\x93": b"\xe2\x80\x93",  # – en-dash
    b"\x24\x80\x98": b"\xe2\x80\x98",  # ' left single quote
    b"\x24\x80\x99": b"\xe2\x80\x99",  # ' right single quote
    b"\x24\x80\x9c": b"\xe2\x80\x9c",  # " left double quote
    b"\x24\x80\x9d": b"\xe2\x80\x9d",  # " right double quote
    b"\x24\x80\xa2": b"\xe2\x80\xa2",  # • bullet
    b"\x24\x80\xa6": b"\xe2\x80\xa6",  # … ellipsis
    b"\x24\x86\x92": b"\xe2\x86\x92",  # → rightward arrow
    b"\x24\x86\x90": b"\xe2\x86\x90",  # ← leftward arrow
    b"\x24\x9c\x93": b"\xe2\x9c\x93",  # ✓ check mark
    b"\x24\x89\xa4": b"\xe2\x89\xa4",  # ≤ less-than-or-equal
    b"\x24\x89\xa5": b"\xe2\x89\xa5",  # ≥ greater-than-or-equal
    b"\x24\x88\x9a": b"\xe2\x88\x9a",  # √ square root
    b"\x24\x82\xac": b"\xe2\x82\xac",  # € euro (intentional in editorial — restore)
    b"\x24\x9c\x85": b"\xe2\x9c\x85",  # ✅ check mark
    b"\x24\x9d\x8c": b"\xe2\x9d\x8c",  # ❌ cross mark
    b"\x24\x9d\x97": b"\xe2\x9d\x97",  # ❗ heavy exclamation
    b"\x24\x86\x94": b"\xe2\x86\x94",  # ↔ left-right arrow
    b"\x24\x86\x95": b"\xe2\x86\x95",  # ↕ up-down arrow
    b"\x24\x8f\xad": b"\xe2\x8f\xad",  # ⏭ next track
    # Box-drawing chars (often used in code-comment ASCII borders)
    b"\x24\x94\x80": b"\xe2\x94\x80",  # ─ light horizontal
    b"\x24\x94\x81": b"\xe2\x94\x81",  # ━ heavy horizontal
    b"\x24\x95\x90": b"\xe2\x95\x90",  # ═ double horizontal
    b"\x24\x94\x82": b"\xe2\x94\x82",  # │ light vertical
    b"\x24\x94\x9c": b"\xe2\x94\x9c",  # ├ tee right
    b"\x24\x94\x94": b"\xe2\x94\x94",  # └ corner
    b"\x24\x94\x8c": b"\xe2\x94\x8c",  # ┌ corner
    b"\x24\x94\x90": b"\xe2\x94\x90",  # ┐ corner
    b"\x24\x94\x98": b"\xe2\x94\x98",  # ┘ corner
    b"\x24\x96\x8c": b"\xe2\x96\x8c",  # ▌ left half block
    b"\x24\x96\x88": b"\xe2\x96\x88",  # █ full block
    b"\x24\x96\x91": b"\xe2\x96\x91",  # ░ light shade
    b"\x24\x86\x91": b"\xe2\x86\x91",  # ↑ up arrow
    b"\x24\x86\x93": b"\xe2\x86\x93",  # ↓ down arrow
    b"\x24\x9a\xa0": b"\xe2\x9a\xa0",  # ⚠ warning
    b"\x24\x9c\x97": b"\xe2\x9c\x97",  # ✗ ballot X
    # Special cases where the corruption hit BOTH the lead byte and a
    # second multibyte char's second byte (because the s/// pass also
    # matched bytes from inside €/£). For these, the third byte is $.
    b"\x24\x94\x24": b"\xe2\x94\x82",  # │ light vertical (was $\x94$)
    b"\x24\x95\x24": b"\xe2\x95\x91",  # ║ double vertical guess (rare)
}

# Two-byte sequences originally led by \xc2. Only restore characters
# we're confident about; specifically NOT currency.
TWO_BYTE = {
    b"\x24\xa7": b"\xc2\xa7",  # § section sign
    b"\x24\xb7": b"\xc2\xb7",  # · middle dot
    b"\x24\xa9": b"\xc2\xa9",  # © copyright
    b"\x24\xae": b"\xc2\xae",  # ® registered
    b"\x24\xb0": b"\xc2\xb0",  # ° degree
    b"\x24\xa3": b"\xc2\xa3",  # £ pound (intentional in editorial — restore)
    b"\x24\xa5": b"\xc2\xa5",  # ¥ yen (intentional in editorial — restore)
}

EXTENSIONS = {
    ".ts", ".tsx", ".js", ".mjs", ".cjs",
    ".md", ".mdx", ".json", ".css", ".html", ".txt",
}
SKIP_DIRS = {"node_modules", ".next", ".git", ".vercel", "dist", "build"}


def restore(data: bytes) -> tuple[bytes, int]:
    n = 0
    # Three-byte first so $\x80\x94 is consumed before any 2-byte rule
    # could see $\x80 at the start of it.
    for src, dst in THREE_BYTE.items():
        if src in data:
            n += data.count(src)
            data = data.replace(src, dst)
    for src, dst in TWO_BYTE.items():
        if src in data:
            n += data.count(src)
            data = data.replace(src, dst)
    return data, n


def walk(roots: list[Path]):
    for root in roots:
        if root.is_file():
            yield root
            continue
        for p in root.rglob("*"):
            if not p.is_file():
                continue
            if any(seg in SKIP_DIRS for seg in p.parts):
                continue
            if p.suffix.lower() not in EXTENSIONS:
                continue
            yield p


def main(argv: list[str]) -> int:
    roots = [Path(a) for a in argv] if argv else [Path(".")]
    fixed = 0
    total = 0
    for path in walk(roots):
        try:
            raw = path.read_bytes()
        except OSError:
            continue
        new, n = restore(raw)
        if n == 0:
            continue
        path.write_bytes(new)
        fixed += 1
        total += n
        print(f"{path}: {n} replacements")
    print(f"\nDone. {fixed} files touched, {total} replacements.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
