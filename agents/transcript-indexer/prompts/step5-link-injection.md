# Step 5 — Internal Link Injection

This step is programmatic — no LLM call needed.

## Logic

After a new episode page passes Step 4:

1. Find 3-5 existing episodes in the same primary cluster
2. For each, check if the episode's MDX file already links to the new episode
3. If not, add a reciprocal link

## Implementation

### Finding related episodes
- Read `content/podcast/meta/<ep>.json` sidecars for cluster assignments
- Filter to same primary cluster
- Sort by publish date (most recent first)
- Take top 3-5 that don't already link to the new episode

### Injecting links
- Read the target episode's MDX file
- Look for an existing `## You Might Also Like` or `## Related` section
- If found, append the new episode link to that section
- If not found, add a `## You Might Also Like` section before the transcript

### Link format in MDX
```mdx
[Episode title](/podcast/episode-slug)
```

### Constraints
- Maximum 1 new link added per existing episode per run
- Never remove existing links
- Never modify content outside the related/links section
- Track all edits for inclusion in the PR
