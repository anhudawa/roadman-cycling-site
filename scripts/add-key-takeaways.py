#!/usr/bin/env python3
"""
One-shot helper for DEV-AEO-04: insert `keyTakeaways:` arrays into existing
blog MDX frontmatter without disturbing the rest of the YAML block.

Usage:
    python scripts/add-key-takeaways.py <slug> <takeaway1> <takeaway2> [takeaway3]

Inserts keyTakeaways immediately after the answerCapsule block in the
frontmatter. Idempotent — running twice on the same slug overwrites the
prior keyTakeaways block rather than duplicating it.

Bails out (exit 1) if:
- the file does not exist
- there is no answerCapsule field to anchor against
- the frontmatter cannot be located
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = ROOT / "content" / "blog"

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def yaml_quote(s: str) -> str:
    """Quote a single takeaway as a YAML double-quoted scalar.

    YAML double-quoted scalars need backslash and double-quote escaped.
    Everything else (apostrophes, em-dashes, percent signs) is fine raw.
    """
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def build_takeaways_block(items: list[str]) -> str:
    lines = ["keyTakeaways:"]
    for item in items:
        lines.append(f"  - {yaml_quote(item)}")
    return "\n".join(lines) + "\n"


def insert_after_answer_capsule(frontmatter: str, block: str) -> str:
    """Insert (or replace) the keyTakeaways block after answerCapsule.

    answerCapsule uses a folded scalar (`>-`) that spans multiple indented
    lines. We walk forward from `answerCapsule:` until we hit the next
    top-level key (a non-indented line) and insert before it.
    """
    # Strip any pre-existing keyTakeaways block first, so this is idempotent.
    frontmatter = re.sub(
        r"^keyTakeaways:\n(?:  - .*\n)+",
        "",
        frontmatter,
        flags=re.MULTILINE,
    )

    lines = frontmatter.split("\n")
    out: list[str] = []
    i = 0
    inserted = False
    while i < len(lines):
        out.append(lines[i])
        if not inserted and lines[i].startswith("answerCapsule:"):
            # Skip past the folded scalar's continuation lines (indented).
            i += 1
            while i < len(lines) and (lines[i].startswith(" ") or lines[i] == ""):
                # Bail on a blank line followed by a non-indented line — that's
                # the end of the scalar.
                if lines[i] == "" and i + 1 < len(lines) and not lines[i + 1].startswith(" "):
                    break
                out.append(lines[i])
                i += 1
            # Insert keyTakeaways block before the next top-level key.
            for tline in block.rstrip("\n").split("\n"):
                out.append(tline)
            inserted = True
            continue
        i += 1

    if not inserted:
        raise RuntimeError("answerCapsule field not found in frontmatter")

    return "\n".join(out)


def main() -> int:
    if len(sys.argv) < 4:
        print(__doc__, file=sys.stderr)
        return 2

    slug = sys.argv[1]
    items = sys.argv[2:]
    if not (2 <= len(items) <= 3):
        print(f"error: provide 2 or 3 takeaways (got {len(items)})", file=sys.stderr)
        return 2

    path = BLOG_DIR / f"{slug}.mdx"
    if not path.exists():
        print(f"error: {path} does not exist", file=sys.stderr)
        return 1

    text = path.read_text(encoding="utf-8")
    m = FRONTMATTER_RE.match(text)
    if not m:
        print(f"error: no frontmatter found in {path}", file=sys.stderr)
        return 1

    frontmatter = m.group(1)
    body = text[m.end():]

    block = build_takeaways_block(items)
    new_frontmatter = insert_after_answer_capsule(frontmatter, block)

    path.write_text(f"---\n{new_frontmatter}\n---\n{body}", encoding="utf-8")
    print(f"updated: {slug} ({len(items)} takeaways)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
