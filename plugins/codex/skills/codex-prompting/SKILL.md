---
name: codex-prompting
description: Internal guidance for composing Codex prompts for coding, review, diagnosis, and research tasks inside the Codex Claude Code plugin
user-invocable: false
---

# Codex Prompting

Use this skill when `codex:codex-rescue` needs to ask Codex for help.

Prompt Codex like an operator, not a collaborator. Keep prompts lean: state the goal, what done looks like, the output shape, and the few constraints that matter. Current GPT-6 models follow short instructions well, and long step-by-step itineraries or recipes can hinder them. Do not script the route; describe the destination.

Core rules:
- Prefer one clear task per Codex run. Split unrelated asks into separate runs.
- Define completion up front: what the end state is and how Codex knows it is done.
- Bias toward action. These models tend to ask for clarification and stop early, so tell Codex to keep going until the goal is complete and to pick the most reasonable low-risk interpretation. Reserve "ask first" for risky, destructive, or irreversible steps; do not carry over blanket "ask before proceeding" language for ordinary work.
- Calibrate verification to the change. These models tend to over-test small edits, so ask for a targeted check for a small change and broader verification only for large or risky ones.
- Ask for compact output explicitly. They default to verbose, heavily formatted answers.
- Keep instructions short and non-conflicting. These models are sensitive to AGENTS.md and skills, so a contradictory or redundant instruction costs more than it used to. Point to docs or files only when they are relevant to the task.
- Add grounding rules only where unsupported guesses would hurt quality (review, research, root-cause analysis).
- Prefer tightening the prompt over raising reasoning effort. If effort must go up, step one level at a time (low, medium, high, xhigh, max) and stop when the result is good enough.

Structure is optional. XML tags give a prompt stable internal structure and work well, but a short plain-prose prompt is fine when the task is simple. When you do use tags, use the names from the reference file and only the few the task needs.

A typical lean prompt:
- `<task>`: the concrete job, the relevant repository or failure context, and the expected end state.
- An output block (`<structured_output_contract>` or `<compact_output_contract>`) when the response shape matters.
- `<default_follow_through_policy>` so Codex acts instead of asking routine questions.
- `<grounding_rules>` or `<citation_rules>` for review and research.
- `<verification_loop>`, `<completeness_contract>`, or `<action_safety>` only when the task is risky or write-capable.

How to choose prompt shape:
- Use built-in `review` or `adversarial-review` commands when the job is reviewing local git changes. Those prompts already carry the review contract.
- Use `task` when the task is diagnosis, planning, research, or implementation and you need to control the prompt more directly.
- Use `task --resume-last` for follow-up instructions on the same Codex thread. Send only the delta instruction instead of restating the whole prompt unless the direction changed materially.

Prompt assembly checklist:
1. State the task, scope, and definition of done.
2. Choose the smallest output contract that still makes the answer easy to use.
3. Say whether Codex should keep going by default (usually yes) or stop for a specific high-risk decision.
4. Add verification, grounding, and safety blocks only where the task needs them.
5. Cut redundant or conflicting instructions before sending.

Reusable blocks live in [references/prompt-blocks.md](references/prompt-blocks.md).
Concrete end-to-end templates live in [references/codex-prompt-recipes.md](references/codex-prompt-recipes.md).
Common failure modes to avoid live in [references/codex-prompt-antipatterns.md](references/codex-prompt-antipatterns.md).
