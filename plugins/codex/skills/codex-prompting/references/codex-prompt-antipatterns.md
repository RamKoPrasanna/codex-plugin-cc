# Codex Prompt Anti-Patterns

Avoid these when prompting Codex.

## Vague task framing

Bad:

```text
Take a look at this and let me know what you think.
```

Better:

```xml
<task>
Review this change for material correctness and regression risks.
</task>
```

## Missing definition of done or output shape

Bad:

```text
Investigate and report back.
```

Better:

```xml
<structured_output_contract>
Return:
1. root cause
2. evidence
3. smallest safe next step
</structured_output_contract>
```

## Over-scripting the route

Bad:

```text
First read every file in src/, then list all functions, then build a call graph, then check each function for bugs, then write a summary table.
```

Better:

```xml
<task>
Find the cause of the intermittent timeout in the sync worker. Done means a root cause backed by evidence from the code or logs.
</task>
```

Step-by-step itineraries can hinder current models. State the goal and the end state; let Codex choose the path.

## Inviting Codex to stop and ask

Bad:

```text
Debug this failure. Check with me before making any change.
```

Better:

```xml
<default_follow_through_policy>
Keep going until the failure is fixed or you have a confident root cause.
Only stop to ask before destructive or irreversible actions.
</default_follow_through_policy>
```

Blanket "ask first" language makes these models stop early on ordinary work.

## Over-verifying small changes

Bad:

```text
After every edit, run the full test suite, the linter, and the type checker, and re-read every changed file.
```

Better:

```text
Run the targeted test for the changed path. Broaden only if it touches shared code.
```

## Asking for more reasoning instead of a better prompt

Bad:

```text
Think harder and be very smart.
```

Better: tighten the task and the done condition first. If effort still needs to rise, step up one level at a time (low, medium, high, xhigh, max).

## Mixing unrelated jobs into one run

Bad:

```text
Review this diff, fix the bug you find, update the docs, and suggest a roadmap.
```

Better:
- Run review first.
- Run a separate fix prompt if needed.
- Use a third run for docs or roadmap work.

## Conflicting or redundant instructions

Bad:

```text
Be concise. Provide a thorough, detailed, comprehensive write-up with full explanations.
```

Better: one output instruction. These models weigh every instruction heavily, so contradictions degrade results.

## Unsupported certainty

Bad:

```text
Tell me exactly why production failed.
```

Better:

```xml
<grounding_rules>
Ground every claim in the provided context or tool outputs.
If a point is an inference, label it clearly.
</grounding_rules>
```
