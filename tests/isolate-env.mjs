// Running the suite from inside a Claude Code session inherits the live plugin's state dir and
// session id, which redirects job state away from the temp dirs the tests assert on.
for (const name of ["CLAUDE_PLUGIN_DATA", "CODEX_COMPANION_SESSION_ID", "CODEX_COMPANION_TRANSCRIPT_PATH"]) {
  delete process.env[name];
}
