---
description: Run a Daybreak security review of local git changes, with CWE-tagged findings and attack paths
argument-hint: '[--wait|--background] [--base <ref>] [--scope auto|working-tree|branch] [--model <model>] [--force] [--json] [focus ...]'
allowed-tools: Read, Glob, Grep, Bash(node:*), Bash(git:*), AskUserQuestion
---

Run a defensive Codex security review through the shared plugin runtime.
It always runs under the Daybreak Blue access program on `gpt-6-sol` unless `--model` names another Daybreak-capable model.
Each finding carries a CWE ID, an exploitability rating, and a concrete attack path.

Raw slash-command arguments:
`$ARGUMENTS`

Core constraint:
- This command is review-only.
- Do not fix issues, apply patches, or suggest that you are about to make changes.
- Your only job is to run the review and return Codex's output verbatim to the user.

Execution mode rules:
- If the raw arguments include `--wait`, do not ask. Run in the foreground.
- If the raw arguments include `--background`, do not ask. Run in a Claude background task.
- Otherwise, estimate the review size before asking:
  - For working-tree review, start with `git status --short --untracked-files=all`.
  - For working-tree review, also inspect both `git diff --shortstat --cached` and `git diff --shortstat`.
  - For base-branch review, use `git diff --shortstat <base>...HEAD`.
  - Treat untracked files or directories as reviewable work for auto or working-tree review even when `git diff --shortstat` is empty.
  - Only conclude there is nothing to review when the relevant scope is actually empty.
  - Recommend waiting only when the scoped review is clearly tiny, roughly 1-2 files total and no sign of a broader directory-sized change.
  - In every other case, including unclear size, recommend background.
- Then use `AskUserQuestion` exactly once with two options, putting the recommended option first and suffixing its label with `(Recommended)`:
  - `Wait for results`
  - `Run in background`

Argument handling:
- Preserve the user's arguments exactly. Do not strip `--wait` or `--background` yourself.
- It uses the same target selection as `/codex:adversarial-review`: working-tree review, branch review, and `--base <ref>`, plus optional focus text after the flags.
- Daybreak is always on; there is no flag for it.
- `--model sol` resolves to the newest `gpt-*-sol` model, which may not support Daybreak. If the companion reports that Daybreak is not available for the model, return that message; do not retry with another model unless the user asks.
- Each change gets one security review round. If the companion exits with code 2 and a "Refused: ... Pass --force to run another round" message, return that message verbatim. Do not add `--force` yourself; only pass it when the user explicitly asked for another round.
- `--json` prints the structured result (`result.findings[]` with `cwe`, `attack_path`, `exploitability`) instead of the rendered report.

Foreground flow:
- Run:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" security-review "$ARGUMENTS"
```
- Return the command stdout verbatim, exactly as-is.
- Do not paraphrase, summarize, or add commentary before or after it.
- Do not fix any issues mentioned in the review output.

Background flow:
- Launch the review with `Bash` in the background:
```typescript
Bash({
  command: `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" security-review "$ARGUMENTS"`,
  description: "Codex security review",
  run_in_background: true
})
```
- Do not call `BashOutput` or wait for completion in this turn.
- After launching the command, tell the user: "Codex security review started in the background. Check `/codex:status` for progress."
- A refused round creates no job, so `/codex:status` will not list it. When the background task finishes with exit code 2, return its "Refused: ..." message verbatim instead of pointing to `/codex:status`.
