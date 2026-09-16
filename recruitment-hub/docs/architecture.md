# Architecture

## System Overview

Recruitment Hub is a Next.js application backed by Supabase (PostgreSQL, Auth, Storage) with a modular integration layer designed for Workday connectivity.

## Layers

### Frontend Layer
- Next.js App Router with Server Components for data loading
- Client Components for interactive UI (forms, drag-and-drop, real-time updates)
- Tailwind CSS + Radix UI for accessible, enterprise-grade components

### API Layer
- Next.js API Routes for RESTful endpoints
- Server-side Zod validation on all mutations
- Consistent error handling and response format

### Service Layer
- Business logic encapsulated in service modules (requisitions, candidates, applications, etc.)
- Services accept a Supabase client — enabling RLS-scoped queries per user
- Audit logging integrated into all mutation services

### Database Layer
- PostgreSQL via Supabase
- 29 tables with full referential integrity
- Row Level Security on all tables
- Role-based access via helper functions (has_role, has_any_role)

### Integration Layer
- HRISProvider interface abstracts external HR system connectivity
- MockHRISProvider for development; WorkdayProvider for production
- Integration event log for debugging and monitoring
- Workday ID mapping table for entity correlation

## Key Design Decisions

1. **Candidate ≠ Application**: One candidate can have multiple applications across different requisitions
2. **Configurable Pipeline**: Pipeline stages stored in database, not hard-coded
3. **Server-side Security**: RLS + server validation; frontend controls are UX convenience only
4. **Audit Everything**: All sensitive mutations create audit log entries
5. **Workday-Ready**: All reference entities carry optional workday_id fields
