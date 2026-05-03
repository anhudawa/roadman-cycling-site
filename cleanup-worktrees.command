#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Roadman Cycling — Worktree Cleanup ==="
echo ""

# Count before
BEFORE=$(git worktree list | wc -l | tr -d ' ')
echo "Worktrees before: $BEFORE"

# Prune stale worktree references
echo "--- Pruning stale worktree references ---"
git worktree prune
echo "Done."

# Remove worktree directories that still exist
echo "--- Removing worktree directories ---"
if [ -d ".claude/worktrees" ]; then
  for dir in .claude/worktrees/*/; do
    if [ -d "$dir" ]; then
      name=$(basename "$dir")
      echo "  Removing $name..."
      git worktree remove ".claude/worktrees/$name" --force 2>/dev/null || rm -rf "$dir"
    fi
  done
fi
echo "Done."

# Final prune
git worktree prune

# Delete merged local branches (keep main)
echo ""
echo "--- Deleting merged local branches ---"
git branch --merged main | grep -v '^\*\|main' | while read branch; do
  echo "  Deleting $branch"
  git branch -d "$branch" 2>/dev/null || true
done
echo "Done."

# Count after
AFTER=$(git worktree list | wc -l | tr -d ' ')
echo ""
echo "Worktrees after: $AFTER (removed $((BEFORE - AFTER)))"
echo ""
echo "=== Cleanup complete ==="
echo "Press any key to close..."
read -n 1
