# Strix: Application Security & Pentesting Ruleset

> Autonomous AI Security, OWASP Top 10 Audit, and Code Remediation Standards based on Strix (`usestrix/strix`).

---

## 1. Threat Modeling & Boundary Security
- **Trust Boundaries**: Validate all user-supplied inputs at API & Server Action entry points. Never trust client-sent metadata (`user_metadata`, unverified cookies, or local storage tokens).
- **Fail-Closed Defaulting**: Authentication and environment secret guards (e.g. `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) must strictly reject non-matching or missing headers with `401 Unauthorized` / loud errors.
- **SQL & Data Isolation**: All database queries must be protected by PostgreSQL Row-Level Security (RLS) policies using server-managed user IDs (`auth.uid()`) and `SECURITY DEFINER` security helper functions.

---

## 2. OWASP Top 10 Audit Checklist
- **A01: Broken Access Control**: Verify RLS policies on all tables (`SELECT`, `INSERT`, `UPDATE`, `DELETE`). Ensure multi-tenant tenant, room, and financial records are scoped by `organization_id` / `property_id`.
- **A02: Cryptographic Failures**: Never store plain-text passwords or secret keys. Use secure cookie headers (`@supabase/ssr`) with `HttpOnly`, `SameSite=Lax`, and `Secure` flags.
- **A03: Injection (XSS / SQLi)**: Sanitize user text inputs before database insertion. Use parameterized queries via Supabase client library.
- **A07: Identification and Authentication Failures**: Ensure full-stack authentication state is verified on the server side via `supabase.auth.getUser()`.

---

## 3. Vulnerability Remediation & Verification Workflow
1. **Root Cause Fix**: When a vulnerability or broken access check is identified, fix the shared function at the root provider rather than patching individual caller sites.
2. **Fail-Closed Verification**: Verify that unauthenticated requests fail cleanly with HTTP `401` or `403` status.
3. **Automated Regression Guard**: Maintain automated unit and integration tests (`npm test`) covering authentication helper functions and sanitizers.
