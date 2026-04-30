#!/bin/bash
set -e
cd "$(dirname "$0")"
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock

echo "=== Roadman Cycling — Merge all completed branches ==="
echo ""

# 1. Stage and commit everything
echo "--- Staging all changes ---"
git add -A
git diff --cached --quiet 2>/dev/null || git commit -m "chore: commit remaining unstaged files

- Updated merge script, SEO audit plan, coaching page, .command scripts"
echo "✓ All changes committed"
echo ""

# 2. Pull and push
echo "--- Pulling remote changes ---"
git pull --rebase origin main

echo "--- Pushing to origin/main ---"
git push origin main

echo ""
echo "=== All done ==="
echo "Press any key to close..."
read -n 1
