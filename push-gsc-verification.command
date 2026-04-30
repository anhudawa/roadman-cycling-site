#!/bin/bash
cd "$(dirname "$0")"
echo "Pushing GSC verification tag to main..."
git push origin main
echo ""
echo "Done! Wait ~60 seconds for Vercel to deploy, then click VERIFY in Google Search Console."
read -p "Press Enter to close..."
