<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Roadman editorial publishing rule

Read `docs/editorial-publishing-standard.md` before changing public content.
Passing technical tests is not editorial approval. Every changed section needs
a reader question, a useful answer and evidence. Cut empty examples and filler.
Do not claim a numerical literary-quality score or an invented human review.

Content changes must pass `npm run editorial:check` before production. Anthony
explicitly delegated final QA to Codex on 8 September 2026. Do the review and
rendered checks yourself; do not ask him to review the whole site or post a GitHub
approval string. Never impersonate a human review. Record actual observations,
failed checks and limitations. A blocked browser is not a visual pass.
Keep the initial baseline frozen. Missing, incomplete, failed or stale QA blocks
publication. Further changes to the baseline or weakening publication controls
require explicit authorization. Preview permission is not production approval.
