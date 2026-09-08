# Roadman editorial publication standard

Anthony rejected the Good Legs example week on 7 September 2026. The table took a screen of space to say "Gym session" on Friday. It supplied no session, recovery instruction or sufficient reasoning. Calling it a concrete example in our release review was wrong. Technical success did not establish editorial quality.

## The decision before publication

Every changed section must earn its space. Write down the reader's question, the useful answer, the evidence and the editorial decision. A reader should leave with a clearer understanding, a usable decision or a well-supported reason to consider the product. Product pages need concrete capabilities and benefits; they do not need invented prescriptions to sound specific.

Reject a section when:

- Removing it loses no useful information.
- It labels a topic or an activity without explaining what matters about it.
- A table or illustration spreads one sentence over a screen.
- An example omits the inputs, actual output or reasoning needed to understand it. A training example must identify the rider/context and explain the relevant session details and trade-offs; "Gym session" is insufficient. Do not invent sets, loads or recovery effects to fill the gap.
- A claim has no directly supporting source, or a study is used to imply a product result it did not test.
- The language could be pasted onto any coaching brand unchanged: generic promises, repeated conclusions, empty contrasts, ornate headings hiding thin material.
- Internal boundaries or implementation details displace the reader's reason to care.
- Availability, price, membership inclusion, quotations, case results or named review credits exceed what is verified.

Read the finished page on desktop and mobile. Review headings in sequence, paragraphs aloud, every table/caption and each call to action. Check density and usefulness as well as overflow. Record the actual viewport, page and observations. A type check, HTTP 200 or screenshot alone is not editorial approval. Do not award decimal quality scores or claim that writing is guaranteed free of AI characteristics.

## Enforced production check

`npm run build` runs `scripts/editorial-gate.mjs` before Next builds. Vercel's explicit build command uses this script. GitHub runs the same gate on every pull request and main push. The gate fingerprints file paths and bytes in `content`, `src` and `public`, including shared components, feeds, metadata, generated content and assets. Test/spec source files are excluded. The broad scope intentionally catches indirect changes; some code-only changes will also need review.

The initial baseline freezes the existing site after removing the rejected section. **It is not approval of the archive or the remaining Good Legs copy.** There is no routine baseline-update command. Changing the baseline to admit new copy defeats the control and is forbidden.

Anthony authorized Codex to own final QA on 8 September 2026: “Yes, change it. You be the final QA, but have strict gates to protect the integrity of the site.” This replaces the GitHub-comment requirement. It does not assert that Anthony reviewed this release.

Any different content requires:

1. `editorial/release.json`, bound to the content fingerprint, with an entry for every changed substantive section and review evidence for claims, examples, voice, offers and presentation. Mechanical changes shared across many routes can have one entry identifying their full scope; inspect representative rendered instances of each affected template.
2. `editorial/qa.json`, signed by Codex as final reviewer, with `decision: publish`, no unresolved blockers, and completed claims, editorial, offers, desktop, mobile, interactions, SEO and technical checks. Each check needs actual evidence. Desktop/mobile records identify the rendered URL, actual viewport dimensions and observations. Mobile must be checked at 320–480 CSS pixels; desktop at least 1000. Source inspection alone does not satisfy either.
3. Exact content, review-file and publication-control hashes. Edits invalidate the sign-off. Missing checks, failed/pending checks, incomplete rendered review or stale evidence stop production. Preview builds remain available to finish QA.

Run generators before fingerprinting. Record results only after executing the relevant checks. Technical QA must include the gate rejection tests, type checking, focused behavior tests, content audit and link validation. Explain existing unrelated failures with baseline evidence; newly introduced failures block release. Check indexability, canonicals, schema accuracy and working CTAs on affected surfaces. Do not submit real applications or payments while testing.

Read the final copy yourself. A phrase detector cannot judge whether an example is useful, evidence directly supports a claim, or a page sounds like Roadman. Reject empty demonstrations, generic sales promises and internal publishing language. Correct or remove unsupported material. Do not invent product facts to improve specificity.

Use `editorial/release.example.json` and `editorial/qa.example.json` as structure only; placeholders cannot pass. The QA record is an agent attestation, not an independent human signature or proof of literary quality. Never mark a check passed because tools were unavailable. Keep the current deployment live while resolving a blocker. After deployment, verify the changed public pages and roll back a release that introduces a material regression.

## Limits and operational ownership

The gate checks completeness and exact revision binding; Codex is accountable for the accuracy of the review. It cannot guarantee literary quality or prevent an administrator deliberately rewriting controls. CI reruns rejection tests and the production gate. Main-branch protection was absent when inspected; no administrator-level protection is claimed.

The frozen baseline remains unchanged and is not retrospective endorsement of the archive. These controls cover repository-built content, not runtime database entries, external CMS publications, Skool or the separate Good Legs site. Further changes that weaken the controls or reset the baseline require Anthony's explicit authorization.
