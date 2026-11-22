import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AGENT_JOB_SCHEMA_VERSION,
  canAcceptJob,
  validateCheckerVerdict,
  validateRuntimeEvidence,
  validateTaskDispatch,
  type CheckerVerdict,
  type RuntimeEvidence,
  type TaskDispatch,
} from "./agent-job";

test("rejects dispatch without schema or prod token", () => {
  assert.ok(validateTaskDispatch({}).length > 0);
  const prod: TaskDispatch = {
    schema_version: AGENT_JOB_SCHEMA_VERSION,
    task_id: "t1",
    state_ref: "s1",
    constraints: {
      environment: "prod",
      max_patch_loops: 3,
      max_files: 20,
      allow_network: false,
    },
  };
  assert.ok(validateTaskDispatch(prod).some((e) => e.includes("policy_token")));
});

test("runtime evidence cannot invent runs when sandbox is down", () => {
  const fake: RuntimeEvidence = {
    task_id: "t1",
    sandbox_id: "none",
    sandbox_available: false,
    runs: [
      {
        command: ["echo", "hi"],
        cwd: "/",
        exit_code: 0,
        stdout_ref: "x",
        stderr_ref: "y",
        duration_ms: 1,
      },
    ],
    artifacts: [],
  };
  assert.ok(validateRuntimeEvidence(fake).some((e) => e.includes("runs must be empty")));
});

test("checker cannot pass with fail findings or a transcript flag", () => {
  const bad = {
    task_id: "t1",
    verdict: "pass",
    findings: [{ code: "X", severity: "fail", message: "boom" }],
    invariants_checked: ["secrets.never_in_git_logs_or_sandbox_env"],
    used_codegen_transcript: true,
  };
  const errors = validateCheckerVerdict(bad);
  assert.ok(errors.some((e) => e.includes("used_codegen_transcript")));
  assert.ok(errors.some((e) => e.includes("pass verdict")));
});

test("accept requires matching ids, pass verdict, and live evidence", () => {
  const evidence: RuntimeEvidence = {
    task_id: "t1",
    sandbox_id: "sbx-1",
    sandbox_available: true,
    runs: [
      {
        command: ["pnpm", "test"],
        cwd: "/work",
        exit_code: 0,
        stdout_ref: "out",
        stderr_ref: "err",
        duration_ms: 12,
      },
    ],
    artifacts: [{ path: "packages/shared-types/src/agent-job.ts", hash: "abc" }],
  };
  const verdict: CheckerVerdict = {
    task_id: "t1",
    verdict: "pass",
    findings: [],
    invariants_checked: ["checker.no_codegen_transcript"],
    used_codegen_transcript: false,
  };
  assert.deepEqual(canAcceptJob({ evidence, verdict, environment: "dev" }), []);
  assert.ok(
    canAcceptJob({
      evidence: { ...evidence, sandbox_available: false, runs: [] },
      verdict,
      environment: "dev",
    }).length > 0,
  );
});
