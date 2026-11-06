# Changelog

## 1.2.1

- Fork upstream sync workflow: a daily job opens or updates an `upstream-sync` pull request merging `openai/codex-plugin-cc` main into the fork, dispatches CI on it, and files an issue instead when the merge conflicts or touches workflow files.

## 1.2.0

- `security-review` subcommand and `/codex:security-review`: always-Daybreak defensive review on `gpt-6-sol`, with `cwe`, `attack_path`, and `exploitability` on every finding (schema `security-review-output.schema.json`).
- One review round per change: a completed review of the same class (standard or security) on the same change is refused with exit code 2 unless `--force` is passed. On a feature branch the change is keyed on the branch and its merge-base whatever scope `auto` picks; a missing merge-base (shallow clone, unrelated history) falls back to the base commit instead of failing.
- Job files record `request: { model, effort, daybreak, accessProgram }` with the resolved model; reviews add `reviewClass` and `changeKey`.
- `--model sol` resolves to the newest visible `gpt-*-sol` model from `model/list`, for reviews and tasks; review commands now also honor the `luna` alias.
- Reviews show a best-effort `Codex quota:` line from `account/rateLimits/read`.

## 1.1.0

- Fork marketplace `ram-codex` (RamKoPrasanna/codex-plugin-cc).
- `--daybreak` on adversarial-review and rescue: requests the Daybreak Blue access program, defaults to `gpt-6-sol`, and fails fast on models without Daybreak.
- Prompting skill renamed to `codex-prompting` and revised for GPT-6; `luna` alias, `max` and `ultra` efforts.

## 1.0.0

- Initial version of the Codex plugin for Claude Code
