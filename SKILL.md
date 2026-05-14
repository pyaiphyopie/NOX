---
name: fix-code-errors
description: "Identify, diagnose, and fix code errors in the current workspace while validating the repair with build or test checks."
argument-hint: What code or files should this skill fix?
disable-model-invocation: true
---

# Fix Code Errors Skill

## Purpose
This skill is for workspace-scoped code error remediation. Use it when the project has compile-time errors, runtime exceptions, type failures, test failures, or syntax issues.

## Workflow
1. Review the current error context from diagnostics, compiler output, test failures, or user-provided messages.
2. Reproduce the failure with the available build/test command or by inspecting the affected file(s).
3. Isolate the root cause and choose the appropriate fix:
   - syntax or parsing errors: correct tokens, braces, imports, and JSX/JS syntax.
   - type or lint errors: update types, interfaces, annotations, and imports.
   - runtime failures: inspect stack traces, reproduce the failure, and correct the logic.
   - test failures: focus on the failing scenario and keep fixes minimal and targeted.
4. Apply the fix to the relevant file(s) and preserve existing project conventions.
5. Validate the fix by rerunning the failing command, build, or test.
6. Confirm there are no remaining errors in the targeted scope.

## Decision Points
- If build/test commands are not available, ask the user for the exact reproduction command or the relevant files.
- If the error is isolated to one file, fix that file and validate locally.
- If multiple errors appear, prioritize the earliest or root-cause error first.
- If the fix requires code changes beyond the immediate error, explain the reasoning and keep changes focused.

## Quality Criteria
- The targeted error is resolved.
- The fix is verified with the relevant build or test command when possible.
- Unrelated files are not changed unless necessary for the repair.
- The solution is clear, minimal, and consistent with the project’s existing code style.

## Suggested prompts
- "Fix code errors in this workspace and rerun the build."
- "Resolve the compile error in `nox_figma_clickable_prototype_spec_react.jsx`."
- "Diagnose the runtime exception and update the code."
- "Repair failing tests and confirm the workspace build passes."
