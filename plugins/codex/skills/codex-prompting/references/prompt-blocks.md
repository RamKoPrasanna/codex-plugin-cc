# Prompt Blocks

Optional building blocks for Codex prompts. Most prompts need only `task` plus one or two others; a short plain-prose prompt is fine for simple work.
When you use a block, wrap it in the XML tag shown in its heading and keep it consistent with the rest of the prompt.

## Core Wrapper

### `task`

Use in nearly every prompt.

```xml
<task>
Describe the concrete job, the relevant repository or failure context, and the expected end state.
</task>
```

## Output and Format

### `structured_output_contract`

Use when the response shape matters.

```xml
<structured_output_contract>
Return exactly the requested output shape and nothing else.
Keep the answer compact.
Put the highest-value findings or decisions first.
</structured_output_contract>
```

### `compact_output_contract`

Use when you want concise prose instead of a schema. Models default to verbose, heavily formatted output, so this is worth including.

```xml
<compact_output_contract>
Keep the final answer short and plain.
No scene-setting, recap, or heavy formatting.
</compact_output_contract>
```

## Follow-through and Completion

### `default_follow_through_policy`

Use in most prompts. Counters the tendency to ask for clarification and stop early.

```xml
<default_follow_through_policy>
Default to the most reasonable low-risk interpretation and keep going until the goal is complete.
Only stop to ask when a missing detail changes correctness or safety, or the next step is destructive or irreversible.
</default_follow_through_policy>
```

### `completeness_contract`

Use for debugging, implementation, or any multi-step task where Codex might stop at the first plausible answer.

```xml
<completeness_contract>
Resolve the task fully before stopping.
Do not stop at the first plausible answer.
Check whether there are follow-on fixes, edge cases, or cleanup needed for a correct result.
</completeness_contract>
```

### `verification_loop`

Use when correctness matters. Scale it to the change: omit it for trivial edits.

```xml
<verification_loop>
Before finalizing, run the checks that fit the size of the change (a targeted test for a small edit, broader verification only for large or risky changes).
If a check fails, revise instead of reporting the first draft.
</verification_loop>
```

## Grounding and Missing Context

### `missing_context_gating`

Use when Codex might otherwise guess.

```xml
<missing_context_gating>
Do not guess missing repository facts.
If required context is absent, retrieve it with tools or state exactly what remains unknown.
</missing_context_gating>
```

### `grounding_rules`

Use for review, research, or root-cause analysis.

```xml
<grounding_rules>
Ground every claim in the provided context or your tool outputs.
Do not present inferences as facts.
If a point is a hypothesis, label it clearly.
</grounding_rules>
```

### `citation_rules`

Use when external research or quotes matter.

```xml
<citation_rules>
Back important claims with citations or explicit references to the source material you inspected.
Prefer primary sources.
</citation_rules>
```

## Safety and Scope

### `action_safety`

Use for write-capable or potentially broad tasks.

```xml
<action_safety>
Keep changes tightly scoped to the stated task.
Avoid unrelated refactors, renames, or cleanup unless they are required for correctness.
Call out any risky or irreversible action before taking it.
</action_safety>
```

## Task-Specific Blocks

### `research_mode`

Use for exploration, comparisons, or recommendations.

```xml
<research_mode>
Separate observed facts, reasoned inferences, and open questions.
Prefer breadth first, then go deeper only where the evidence changes the recommendation.
</research_mode>
```

### `dig_deeper_nudge`

Use for review and adversarial inspection.

```xml
<dig_deeper_nudge>
After you find the first plausible issue, check for second-order failures, empty-state behavior, retries, stale state, and rollback paths before you finalize.
</dig_deeper_nudge>
```

### `progress_updates`

Use when the run may take a while.

```xml
<progress_updates>
If you provide progress updates, keep them brief and outcome-based.
Mention only major phase changes or blockers.
</progress_updates>
```
