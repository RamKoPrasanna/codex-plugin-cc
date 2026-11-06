---
name: codex-cli-runtime
description: Internal helper contract for calling the codex-companion runtime from Claude Code
user-invocable: false
---

# Codex Runtime

Use this skill only inside the `codex:codex-rescue` subagent.

Primary helper:
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" task "<raw arguments>"`

Execution rules:
- The rescue subagent is a forwarder, not an orchestrator. Its only job is to invoke `task` once and return that stdout unchanged.
- Prefer the helper over hand-rolled `git`, direct Codex CLI strings, or any other Bash activity.
- Do not call `setup`, `review`, `adversarial-review`, `security-review`, `status`, `result`, or `cancel` from `codex:codex-rescue`.
- Use `task` for every rescue request, including diagnosis, planning, research, and explicit fix requests.
- You may use the `codex-prompting` skill to rewrite the user's request into a tighter Codex prompt before the single `task` call.
- That prompt drafting is the only Claude-side work allowed. Do not inspect the repo, solve the task yourself, or add independent analysis outside the forwarded prompt text.
- Leave `--effort` unset unless the user explicitly requests a specific effort.
- Leave model unset by default. Add `--model` only when the user explicitly asks for one.
- Map `luna` (or the legacy `spark`) to `--model gpt-6-luna`.
- Pass `sol` through as `--model sol`; the runtime resolves it to the newest visible `gpt-*-sol` model from the Codex catalog and fails with a clear error if the catalog is unreachable.
- Default to a write-capable Codex run by adding `--write` unless the user explicitly asks for read-only behavior or only wants review, diagnosis, or research without edits.

Command selection:
- Use exactly one `task` invocation per rescue handoff.
- If the forwarded request includes `--background` or `--wait`, treat that as Claude-side execution control only. Strip it before calling `task`, and do not treat it as part of the natural-language task text.
- If the forwarded request includes `--model`, normalize `luna` or `spark` to `gpt-6-luna` and pass it through to `task`.
- If the forwarded request includes `--effort`, pass it through to `task`.
- If the forwarded request includes `--daybreak`, pass it through to `task` and keep it out of the task text.
- If the forwarded request includes `--resume`, strip that token from the task text and add `--resume-last`.
- If the forwarded request includes `--fresh`, strip that token from the task text and do not add `--resume-last`.
- `--resume`: always use `task --resume-last`, even if the request text is ambiguous.
- `--fresh`: always use a fresh `task` run, even if the request sounds like a follow-up.
- `--effort`: accepted values are `low`, `medium`, `high`, `xhigh`, `max`, `ultra`.
- `task --resume-last`: internal helper for "keep going", "resume", "apply the top fix", or "dig deeper" after a previous rescue run.

Safety rules:
- Default to write-capable Codex work in `codex:codex-rescue` unless the user explicitly asks for read-only behavior.
- Preserve the user's task text as-is apart from stripping routing flags.
- Do not inspect the repository, read files, grep, monitor progress, poll status, fetch results, cancel jobs, summarize output, or do any follow-up work of your own.
- Return the stdout of the `task` command exactly as-is.
- If the Bash call fails or Codex cannot be invoked, return nothing.

Review subcommands (main Claude thread only, never from `codex:codex-rescue`):
- `review`, `adversarial-review`, and `security-review` share flags: `--base <ref>`, `--scope auto|working-tree|branch`, `--model <model|sol>`, `--force`, `--json`. `adversarial-review` and `security-review` also take focus text after the flags.
- `security-review` always runs under Daybreak (Daybreak Blue access program) on `gpt-6-sol` by default, and its findings add `cwe`, `attack_path`, and `exploitability`. `--model sol` resolves to a model without Daybreak today, so it is refused with the list of Daybreak-capable models.
- One review round per change: a completed `review` or `adversarial-review` (class `standard`) or `security-review` (class `security`) blocks another of the same class on the same change. Change means the HEAD commit for working-tree scope, or branch name plus merge-base for branch scope, so fix-up edits and fix-up commits count as the same change. Failed and cancelled runs do not count.
- A refused review exits with code 2 and a message naming the earlier job id and verdict; with `--json` it also prints `{ "status": "refused", "reason": "review-round-completed", "priorJob": { "id", "verdict" } }`. Do not pass `--force` unless the user explicitly asked for another round.
- Every job records `request: { model, effort, daybreak, accessProgram }` with the resolved model (reviews add `reviewClass` and `changeKey`); read it with `status <job-id> --json` or `result <job-id> --json`.
- Reviews print one `Codex quota:` line with the remaining percentage and reset time when the account rate limits are readable; it is skipped silently otherwise.
