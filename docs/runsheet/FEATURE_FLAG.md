# Feature flag: `runsheet_v1`

**Default:** off  
**Scope:** docs reservation only this PR. No runtime wiring exists (`backend/api` missing).

When implemented:

- Env: `NOX_FLAG_RUNSHEET_V1=false`
- Off → RunSheet routes 404
- On → fixture venue only, never all tenants
