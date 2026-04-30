#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock

# Stage the renamed episode file (git sees delete + create), blog post reference updates, and GuestBioCard fix
git add -A content/podcast/ep-2537-what-pros-actually-eat-to-win-michelin-chef-alan-murchison.mdx \
         content/podcast/what-pros-actually-eat-to-win-michelin-chef-alan-murchison.mdx \
         content/blog/alan-murchison-michelin-star-chef-cycling-nutrition.mdx \
         src/components/features/podcast/GuestBioCard.tsx

git commit -m "fix: Alan Murchison episode — drop inflated ep number, fix mobile layout, add YouTube ID

- Rename ep-2537-* to what-pros-actually-eat-* (no episode number)
- Remove episodeNumber from frontmatter
- Update companion blog post references to new slug
- GuestBioCard: inline-block → block so credential wraps properly on mobile
- Set youtubeId to vol4-3G0tQI"

git push origin main

echo ""
echo "Done — pushed episode rename + mobile fix + YouTube ID"
echo "Press any key to close..."
read -n 1
