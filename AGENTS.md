<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Roadman editorial publishing rule

Read `docs/editorial-publishing-standard.md` before changing public content.
Passing technical tests is not editorial approval. Every changed section needs
a reader question, a useful answer and evidence. Cut empty examples and filler.
Do not claim a numerical literary-quality score or an invented human review.

Content changes must pass `npm run editorial:check` before production. Prepare
the complete review and a rendered preview before requesting the editor's review.
Never post an editorial approval comment as Anthony through a connected account.
Never refresh the initial baseline, change the approver, bypass the build gate,
or weaken its checks to publish a revision. Such control changes require explicit
authorization. Preview permission is not production approval.
