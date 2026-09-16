# Security

## Authentication
- Supabase Auth with email/password
- JWT-based session management via cookies
- Middleware refreshes session on each request
- Unauthenticated requests to /dashboard/* redirect to /login

## Authorization
- Row Level Security (RLS) on all 29 database tables
- 88 RLS policies enforcing role-based access
- Server-side role checks in API routes
- Frontend route protection is convenience only — not a security boundary

## Data Protection
- Candidate documents stored in private Supabase Storage bucket
- Signed URLs with 5-minute expiry for document access
- Document access logged in audit trail
- No public URLs for sensitive files
- File type validation (PDF, DOC, DOCX only)
- File size limit (10MB)

## Input Validation
- Zod schemas validate all API inputs server-side
- SQL injection prevented by Supabase's parameterized queries
- XSS prevented by React's default escaping

## Audit Trail
- All sensitive operations logged with: user, action, entity, old/new values, timestamp
- Audit log is append-only (no update/delete RLS policies)
- Admin-only access to audit log viewer

## Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## GDPR Readiness
- Candidate consent tracking (consent_given, consent_date)
- GDPR retention date field
- Architecture supports data deletion/anonymisation
- Audit log supports subject access requests
