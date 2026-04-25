# Step 6 $€” PR Creation

This step uses `gh` CLI $€” no LLM call needed.

## Watch Mode (single episode)

### Branch
```
episode/<ep-number>-<slug>
```

### PR Title
```
Episode <n>: <title> $€” auto-indexed
```

### PR Body Template
```markdown
## Auto-Indexed Episode

**Episode:** <title>
**Number:** <ep-number>
**Cluster:** <primary_cluster> (secondary: <secondary_clusters>)
**Persona:** <primary_persona>
**Guest:** <guest_name> (<guest_credentials>)

## Sacred Cow Checklist
- [x/] Contrarian hook
- [x/] Villain identified
- [x/] Insider credibility
- [x/] Evidence layer
- [x/] Universal principle
- [x/] Personal story / NDY member
- [x/] Cultural critique

**Score:** <score>/7

## Internal Links Added
- Added link from `<slug>` $†’ new episode
- Added link from `<slug>` $†’ new episode

## Files Changed
- `content/podcast/<slug>.mdx` (new episode page)
- `content/podcast/meta/<ep>.json` (metadata sidecar)
- `content/podcast/transcripts/<ep>.txt` (raw transcript)
- `content/podcast/<existing-slug>.mdx` (reciprocal link) Ã— N

## Cost
- Tokens used: <total_tokens>
- Runtime: <runtime_seconds>s
- Regeneration attempts: <regen_count>
```

### Labels
- `auto-indexed`
- `needs-human-rewrite` (only if Step 4 failed after 3 attempts)

## Backfill Mode (batch)

### Branch
```
backfill/<start-ep>-<end-ep>
```

### PR Title
```
Backfill: Episodes <start>-<end> $€” auto-indexed (<count> episodes)
```

### PR Body
Same template but repeated per episode, with a summary table at top showing
pass/fail status for each episode in the batch.
