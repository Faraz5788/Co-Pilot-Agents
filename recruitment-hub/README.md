# Recruitment Hub

Enterprise recruitment management platform — a lightweight Applicant Tracking System designed to integrate with Workday as the HR system of record.

## Architecture

```
Frontend (Next.js App Router)
    ↓
Application API (Server Actions + API Routes)
    ↓
Supabase (PostgreSQL + Auth + Storage + RLS)
    ↓
Integration Layer (HRIS Provider Interface)
    ↓
External Systems (Workday, M365 — future)
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| UI | Tailwind CSS 4, Radix UI, lucide-react |
| Backend | Next.js API Routes, Server Components |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Validation | Zod |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### Installation

```bash
cd recruitment-hub
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration: copy contents of `supabase/migrations/00001_initial_schema.sql` into the Supabase SQL Editor and execute
3. Run the seed data: execute `supabase/seed/seed.sql` then `supabase/seed/demo-data.sql`
4. Create demo users: `npx tsx scripts/setup-demo.ts`

### Create Storage Bucket

In Supabase dashboard, create a storage bucket called `documents` with:
- Public: No
- File size limit: 10MB
- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| System Admin | admin@recruitment-hub.dev | Demo1234! |
| Rec Admin | rec.admin@recruitment-hub.dev | Demo1234! |
| Recruiter | sarah.jones@recruitment-hub.dev | Demo1234! |
| Recruiter | alex.smith@recruitment-hub.dev | Demo1234! |
| Hiring Manager | james.wilson@recruitment-hub.dev | Demo1234! |
| Hiring Manager | emma.thompson@recruitment-hub.dev | Demo1234! |
| Hiring Manager | david.brown@recruitment-hub.dev | Demo1234! |
| Interviewer | lisa.chen@recruitment-hub.dev | Demo1234! |
| HR / Reward | hr.reward@recruitment-hub.dev | Demo1234! |

### Building

```bash
npm run build
```

## Security

- Row Level Security (RLS) enforced on all 29 tables
- Server-side Zod validation on all mutations
- Signed URLs for document access (5-minute expiry)
- Audit logging for sensitive operations
- Role-based access control with 6 roles
- No public storage URLs

## Workday Integration (Future)

Architecture includes `workday_mapping` table, `integration_events` log, `HRISProvider` interface with mock implementation, and Workday ID fields on all reference entities.

## License

Proprietary — internal use only.
