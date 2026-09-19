/**
 * 0X Alpha / NOX Core OS — job + evidence contracts.
 * Edges carry these objects. Prose is not a valid handoff.
 */

export const AGENT_JOB_SCHEMA_VERSION = "0x-alpha.job.v1" as const;

export type Environment = "dev" | "staging" | "prod" | "sim";

export type JobStatus =
  | "queued"
  | "planning"
  | "writing"
  | "running"
  | "checking"
  | "accepted"
  | "rejected"
  | "patched"
  | "escalated";

export type FileAction = "create" | "modify" | "delete";

export interface IntentRef {
  intent_id: string;
  user_id: string;
  task_graph_ref: string;
  policy_profile: string;
  environment: Environment;
}

export interface TaskDispatch {
  schema_version: typeof AGENT_JOB_SCHEMA_VERSION;
  task_id: string;
  state_ref: string;
  intent?: IntentRef;
  constraints: {
    environment: Environment;
    max_patch_loops: number;
    max_files: number;
    allow_network: boolean;
    languages?: string[];
    target_paths?: string[];
  };
  expected_output_schema?: Record<string, unknown>;
  policy_token?: string;
}

export interface PlanNodeOutput {
  task_id: string;
  summary: string;
  files: Array<{
    path: string;
    action: FileAction;
    rationale: string;
  }>;
  tests: string[];
  risks: string[];
  requires_governance: boolean;
}

export interface WriteNodeOutput {
  task_id: string;
  files: Array<{
    path: string;
    action: FileAction;
    content_hash: string;
    bytes: number;
  }>;
  worktree_ref: string;
}

export interface RuntimeRun {
  command: string[];
  cwd: string;
  exit_code: number;
  stdout_ref: string;
  stderr_ref: string;
  duration_ms: number;
}

export interface RuntimeEvidence {
  task_id: string;
  sandbox_id: string;
  sandbox_available: boolean;
  runs: RuntimeRun[];
  artifacts: Array<{ path: string; hash: string }>;
}

export type CheckerSeverity = "info" | "warn" | "fail";

export interface CheckerFinding {
  code: string;
  severity: CheckerSeverity;
  path?: string;
  message: string;
  evidence_ref?: string;
}

export interface CheckerVerdict {
  task_id: string;
  verdict: "pass" | "fail" | "escalate";
  findings: CheckerFinding[];
  invariants_checked: string[];
  /** Must always be false. Checker may not read CodeGen transcript. */
  used_codegen_transcript: false;
}

export interface StateDelta {
  state_ref: string;
  delta: {
    job_status: JobStatus;
    artifact_ref?: string;
    checker_verdict?: CheckerVerdict["verdict"];
    loop_index: number;
  };
  version: number;
  signature: string;
}

export interface RouterDecision {
  next: "accept" | "patch" | "reject" | "escalate";
  reason: string;
  loop_index: number;
}

export const DEFAULT_CONSTRAINTS = {
  max_patch_loops: 3,
  max_files: 20,
  allow_network: false,
} as const;

export const FROZEN_INVARIANTS = [
  "ticket.server_record_is_source_of_truth",
  "ticket.qr_is_credential_only",
  "payment.adapter_only",
  "payment.webhook_verify_and_idempotent",
  "secrets.never_in_git_logs_or_sandbox_env",
  "auth.rls_rbac_not_disabled_for_tests",
  "prod.mutate_requires_governance_token",
  "checker.no_codegen_transcript",
] as const;

export function isEnvironment(value: unknown): value is Environment {
  return value === "dev" || value === "staging" || value === "prod" || value === "sim";
}

export function isJobStatus(value: unknown): value is JobStatus {
  return (
    typeof value === "string" &&
    [
      "queued",
      "planning",
      "writing",
      "running",
      "checking",
      "accepted",
      "rejected",
      "patched",
      "escalated",
    ].includes(value)
  );
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function validateTaskDispatch(input: unknown): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return ["task_dispatch must be an object"];
  const job = input as Partial<TaskDispatch>;
  if (job.schema_version !== AGENT_JOB_SCHEMA_VERSION) {
    errors.push(`schema_version must be ${AGENT_JOB_SCHEMA_VERSION}`);
  }
  if (!isNonEmptyString(job.task_id)) errors.push("task_id required");
  if (!isNonEmptyString(job.state_ref)) errors.push("state_ref required");
  if (!job.constraints || !isEnvironment(job.constraints.environment)) {
    errors.push("constraints.environment must be dev|staging|prod|sim");
  }
  if (job.constraints && job.constraints.environment === "prod" && !job.policy_token) {
    errors.push("prod jobs require policy_token");
  }
  return errors;
}

export function validateRuntimeEvidence(input: unknown): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return ["runtime_evidence must be an object"];
  const ev = input as Partial<RuntimeEvidence>;
  if (!isNonEmptyString(ev.task_id)) errors.push("task_id required");
  if (typeof ev.sandbox_available !== "boolean") errors.push("sandbox_available required");
  if (!Array.isArray(ev.runs)) errors.push("runs must be an array");
  if (ev.sandbox_available === false && Array.isArray(ev.runs) && ev.runs.length > 0) {
    errors.push("runs must be empty when sandbox_available is false");
  }
  if (ev.sandbox_available === true && Array.isArray(ev.runs) && ev.runs.length === 0) {
    errors.push("sandbox run claimed but runs[] is empty");
  }
  return errors;
}

export function validateCheckerVerdict(input: unknown): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return ["checker_verdict must be an object"];
  const v = input as Partial<CheckerVerdict>;
  if (!isNonEmptyString(v.task_id)) errors.push("task_id required");
  if (v.verdict !== "pass" && v.verdict !== "fail" && v.verdict !== "escalate") {
    errors.push("verdict must be pass|fail|escalate");
  }
  if (v.used_codegen_transcript !== false) {
    errors.push("used_codegen_transcript must be false");
  }
  if (!Array.isArray(v.invariants_checked) || v.invariants_checked.length === 0) {
    errors.push("invariants_checked must be non-empty");
  }
  if (v.verdict === "pass" && Array.isArray(v.findings)) {
    const fails = v.findings.filter((f) => f.severity === "fail");
    if (fails.length > 0) errors.push("pass verdict cannot include fail findings");
  }
  return errors;
}

export function canAcceptJob(args: {
  evidence: RuntimeEvidence;
  verdict: CheckerVerdict;
  environment: Environment;
  policy_token?: string;
}): string[] {
  const errors = [
    ...validateRuntimeEvidence(args.evidence),
    ...validateCheckerVerdict(args.verdict),
  ];
  if (args.verdict.verdict !== "pass") errors.push("cannot accept unless checker verdict is pass");
  if (args.evidence.task_id !== args.verdict.task_id) {
    errors.push("evidence.task_id and verdict.task_id must match");
  }
  if (args.environment === "prod" && !args.policy_token) {
    errors.push("prod accept requires policy_token");
  }
  if (args.evidence.sandbox_available === false) {
    errors.push("cannot accept without runtime evidence (sandbox unavailable)");
  }
  return errors;
}
