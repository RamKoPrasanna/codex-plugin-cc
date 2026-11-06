import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { afterEach } from "node:test";
import { fileURLToPath } from "node:url";

import { loadBrokerSession } from "../plugins/codex/scripts/lib/broker-lifecycle.mjs";

const SESSION_HOOK = fileURLToPath(new URL("../plugins/codex/scripts/session-lifecycle-hook.mjs", import.meta.url));
const trackedTempDirs = new Set();

export function makeTempDir(prefix = "codex-plugin-test-") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  trackedTempDirs.add(dir);
  return dir;
}

// Companion commands start a detached shared broker that only the SessionEnd hook stops, so a
// test that ran one against a temp workspace would otherwise leave it running. Only workspaces
// this test created are torn down: a global scan would also hit brokers of test files running in
// parallel and of the live Claude Code session.
export function shutdownTrackedBrokers() {
  const dirs = [...trackedTempDirs];
  trackedTempDirs.clear();
  for (const dir of dirs) {
    if (!loadBrokerSession(dir)) {
      continue;
    }
    spawnSync(process.execPath, [SESSION_HOOK, "SessionEnd"], {
      cwd: dir,
      env: process.env,
      encoding: "utf8",
      input: JSON.stringify({ hook_event_name: "SessionEnd", cwd: dir }),
      windowsHide: true
    });
  }
}

afterEach(() => {
  shutdownTrackedBrokers();
});

export function writeExecutable(filePath, source) {
  fs.writeFileSync(filePath, source, { encoding: "utf8", mode: 0o755 });
}

export function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    encoding: "utf8",
    input: options.input,
    shell: options.shell ?? (process.platform === "win32" && !path.isAbsolute(command)),
    windowsHide: true
  });
}

export function initGitRepo(cwd) {
  run("git", ["init", "-b", "main"], { cwd });
  run("git", ["config", "user.name", "Codex Plugin Tests"], { cwd });
  run("git", ["config", "user.email", "tests@example.com"], { cwd });
  run("git", ["config", "commit.gpgsign", "false"], { cwd });
  run("git", ["config", "tag.gpgsign", "false"], { cwd });
}
