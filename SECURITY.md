# Security Policy

## Supported versions

Security fixes are considered for the `main` branch of this repository only.

## Reporting a vulnerability

Please report security issues privately via GitHub Security Advisories for this repository:
https://github.com/pyaiphyopie/NOX/security/advisories/new

Do not open a public issue for vulnerabilities. Include steps to reproduce, affected paths, and impact. You can expect an acknowledgment after maintainers review the report.

## Scope notes

- Never commit secrets, tokens, or production `PAYMENTS_MODE=fake` credentials.
- Payment webhooks must verify signatures; see ADR-004 under `docs/adr/`.
