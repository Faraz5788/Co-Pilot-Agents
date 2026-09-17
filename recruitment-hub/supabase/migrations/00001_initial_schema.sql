-- ============================================================================
-- Recruitment Hub — Initial Schema
-- ============================================================================
-- This migration creates the complete database schema for the Recruitment
-- Management System, including:
--   1. Extensions
--   2. Enums
--   3. Helper functions (roles, updated_at trigger, number generators)
--   4. Tables (reference data, core recruitment entities, operational data)
--   5. Indexes
--   6. Triggers (updated_at maintenance)
--   7. Row Level Security (RLS) policies
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()


-- ============================================================================
-- 2. ENUMS
-- ============================================================================

create type requisition_status as enum (
  'draft', 'pending_approval', 'approved', 'open', 'on_hold', 'closed', 'cancelled'
);

create type application_status as enum (
  'active', 'rejected', 'withdrawn', 'hired', 'on_hold'
);

create type interview_status as enum (
  'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
);

create type interview_type as enum (
  'telephone_screen', 'recruiter_interview', 'hiring_manager_interview',
  'technical_interview', 'panel_interview', 'final_interview'
);

create type location_type as enum (
  'in_person', 'remote', 'hybrid'
);

create type offer_status as enum (
  'draft', 'pending_approval', 'approved', 'sent', 'accepted', 'declined', 'withdrawn'
);

create type approval_status as enum (
  'pending', 'approved', 'rejected', 'cancelled'
);

create type employment_type as enum (
  'full_time', 'part_time', 'contract', 'temporary', 'intern'
);

create type document_type as enum (
  'cv', 'cover_letter', 'certificate', 'reference', 'other'
);

create type notification_type as enum (
  'candidate_review', 'interview_scheduled', 'feedback_required', 'offer_pending',
  'stage_change', 'requisition_update', 'general'
);

create type integration_direction as enum (
  'inbound', 'outbound'
);

create type integration_status as enum (
  'queued', 'processing', 'success', 'failed', 'retrying'
);

create type recommendation_type as enum (
  'strong_yes', 'yes', 'mixed', 'no', 'strong_no'
);

create type stage_type as enum (
  'application', 'screening', 'review', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'
);


-- ============================================================================
-- 3. HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 updated_at maintenance trigger
-- ----------------------------------------------------------------------------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- 3.2 Candidate / requisition reference number generators
-- ----------------------------------------------------------------------------
create or replace function generate_candidate_number()
returns text as $$
declare
  next_num int;
begin
  select coalesce(max(cast(substring(candidate_number from 5) as int)), 0) + 1
  into next_num from candidates;
  return 'CND-' || lpad(next_num::text, 6, '0');
end;
$$ language plpgsql;

create or replace function generate_requisition_reference()
returns text as $$
declare
  next_num int;
begin
  select coalesce(max(cast(substring(reference_number from 5) as int)), 0) + 1
  into next_num from requisitions;
  return 'REQ-' || lpad(next_num::text, 6, '0');
end;
$$ language plpgsql;

-- Note: role-check helper functions (get_user_roles, has_role, has_any_role)
-- are defined in Section 7, after the `users`, `roles` and `user_roles`
-- tables they depend on have been created.


-- ============================================================================
-- 4. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Identity & access
-- ----------------------------------------------------------------------------

-- Roles available in the system (admin, rec_admin, recruiter, hiring_manager, etc.)
create table roles (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Application users, one-to-one with Supabase auth.users
create table users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text unique not null,
  first_name  text not null,
  last_name   text not null,
  avatar_url  text,
  status      text not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Many-to-many join between users and roles
create table user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users (id) on delete cascade,
  role_id    uuid references roles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);


-- ----------------------------------------------------------------------------
-- 4.2 Reference / master data (mostly synced from Workday)
-- ----------------------------------------------------------------------------

create table departments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text unique,
  workday_id  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  country     text,
  workday_id  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table cost_centres (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text unique,
  workday_id  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table job_profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text,
  level       text,
  workday_id  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table positions (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  position_number  text unique,
  job_profile_id   uuid references job_profiles (id),
  department_id    uuid references departments (id),
  workday_id       text,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table grades (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  level       int,
  workday_id  text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table sources (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table rejection_reasons (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table pipeline_stages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  display_order int not null,
  stage_type    stage_type not null,
  is_default    boolean not null default false,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table competencies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 4.3 Core recruitment entities
-- ----------------------------------------------------------------------------

create table requisitions (
  id                     uuid primary key default gen_random_uuid(),
  reference_number       text unique not null,
  workday_requisition_id text,
  title                  text not null,
  description            text,
  job_profile_id         uuid references job_profiles (id),
  position_id            uuid references positions (id),
  department_id          uuid references departments (id),
  cost_centre_id         uuid references cost_centres (id),
  location_id            uuid references locations (id),
  hiring_manager_id      uuid not null references users (id),
  lead_recruiter_id      uuid references users (id),
  employment_type        employment_type not null default 'full_time',
  fte                    numeric(3,2) not null default 1.00,
  vacancy_count          int not null default 1,
  is_replacement         boolean not null default false,
  replacement_worker_id  text,
  grade_id               uuid references grades (id),
  salary_min             numeric(12,2),
  salary_max             numeric(12,2),
  currency               text not null default 'GBP',
  reason_for_hire        text,
  target_start_date      date,
  requested_date         date,
  approved_date          date,
  opened_date            date,
  closed_date            date,
  status                 requisition_status not null default 'draft',
  internal_notes         text,
  created_by             uuid references users (id),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table candidates (
  id                     uuid primary key default gen_random_uuid(),
  candidate_number       text unique not null,
  first_name             text not null,
  middle_name            text,
  last_name              text not null,
  preferred_name         text,
  email                  text unique not null,
  phone                  text,
  location               text,
  linkedin_url           text,
  source_id              uuid references sources (id),
  current_employer       text,
  current_job_title      text,
  notice_period          text,
  salary_expectation     numeric(12,2),
  currency               text,
  right_to_work_status   text,
  consent_given          boolean not null default false,
  consent_date           timestamptz,
  gdpr_retention_date    date,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table candidate_documents (
  id             uuid primary key default gen_random_uuid(),
  candidate_id   uuid references candidates (id) on delete cascade,
  document_type  document_type not null default 'cv',
  storage_path   text not null,
  filename       text not null,
  mime_type      text not null,
  file_size      int,
  uploaded_by    uuid references users (id),
  uploaded_at    timestamptz not null default now()
);

create table applications (
  id                     uuid primary key default gen_random_uuid(),
  candidate_id           uuid references candidates (id),
  requisition_id         uuid references requisitions (id),
  current_stage_id       uuid references pipeline_stages (id),
  application_status     application_status not null default 'active',
  application_date       date not null default current_date,
  assigned_recruiter_id  uuid references users (id),
  source_id              uuid references sources (id),
  salary_expectation     numeric(12,2),
  notice_period          text,
  screening_summary      text,
  rejection_reason_id    uuid references rejection_reasons (id),
  withdrawal_reason      text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (candidate_id, requisition_id)
);

create table application_stage_history (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid references applications (id) on delete cascade,
  from_stage_id   uuid references pipeline_stages (id),
  to_stage_id     uuid not null references pipeline_stages (id),
  changed_by      uuid references users (id),
  changed_at      timestamptz not null default now(),
  notes           text
);


-- ----------------------------------------------------------------------------
-- 4.4 Interviewing
-- ----------------------------------------------------------------------------

create table interviews (
  id               uuid primary key default gen_random_uuid(),
  application_id   uuid references applications (id) on delete cascade,
  interview_type   interview_type not null,
  scheduled_start  timestamptz not null,
  scheduled_end    timestamptz not null,
  location_type    location_type not null default 'remote',
  location         text,
  meeting_url      text,
  notes            text,
  status           interview_status not null default 'scheduled',
  created_by       uuid references users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table interviewers (
  id           uuid primary key default gen_random_uuid(),
  interview_id uuid references interviews (id) on delete cascade,
  user_id      uuid references users (id),
  unique (interview_id, user_id)
);

create table interview_scorecards (
  id                     uuid primary key default gen_random_uuid(),
  interview_id           uuid references interviews (id) on delete cascade,
  reviewer_id            uuid references users (id),
  overall_recommendation recommendation_type,
  overall_score          int check (overall_score between 1 and 5),
  strengths              text,
  concerns               text,
  submitted_at           timestamptz,
  status                 text not null default 'draft' check (status in ('draft', 'submitted')),
  created_at             timestamptz not null default now()
);

create table interview_feedback (
  id            uuid primary key default gen_random_uuid(),
  scorecard_id  uuid references interview_scorecards (id) on delete cascade,
  competency_id uuid references competencies (id),
  score         int check (score between 1 and 5),
  comments      text
);


-- ----------------------------------------------------------------------------
-- 4.5 Offers & approvals
-- ----------------------------------------------------------------------------

create table offers (
  id                   uuid primary key default gen_random_uuid(),
  application_id       uuid references applications (id),
  salary               numeric(12,2) not null,
  currency             text not null default 'GBP',
  grade_id             uuid references grades (id),
  job_title            text not null,
  location_id          uuid references locations (id),
  employment_type      employment_type not null default 'full_time',
  fte                  numeric(3,2) not null default 1.00,
  proposed_start_date  date,
  bonus                text,
  additional_terms     text,
  status               offer_status not null default 'draft',
  created_by           uuid references users (id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Generic approvals table, used for requisition approvals, offer approvals, etc.
-- object_type + object_id form a polymorphic reference to the approved entity.
create table approvals (
  id             uuid primary key default gen_random_uuid(),
  object_type    text not null,
  object_id      uuid not null,
  approval_type  text not null,
  approver_id    uuid references users (id),
  status         approval_status not null default 'pending',
  requested_at   timestamptz not null default now(),
  responded_at   timestamptz,
  comments       text
);


-- ----------------------------------------------------------------------------
-- 4.6 Notes & notifications
-- ----------------------------------------------------------------------------

create table recruiter_notes (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid references applications (id) on delete cascade,
  created_by     uuid references users (id),
  note           text not null,
  created_at     timestamptz not null default now()
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users (id) on delete cascade,
  type        notification_type not null default 'general',
  title       text not null,
  message     text,
  object_type text,
  object_id   uuid,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 4.7 Integration & audit
-- ----------------------------------------------------------------------------

create table workday_mapping (
  id                  uuid primary key default gen_random_uuid(),
  object_type         text not null,
  internal_id         uuid not null,
  workday_id          text not null,
  workday_descriptor  text,
  last_synced_at      timestamptz,
  created_at          timestamptz not null default now()
);

create table integration_events (
  id                uuid primary key default gen_random_uuid(),
  integration       text not null,
  direction         integration_direction not null,
  object_type       text not null,
  object_id         uuid,
  status            integration_status not null default 'queued',
  request_payload   jsonb,
  response_payload  jsonb,
  error_message     text,
  created_at        timestamptz not null default now(),
  processed_at      timestamptz
);

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users (id),
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);


-- ============================================================================
-- 5. INDEXES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Identity & access
-- ----------------------------------------------------------------------------
create index idx_user_roles_user_id on user_roles (user_id);
create index idx_user_roles_role_id on user_roles (role_id);

-- ----------------------------------------------------------------------------
-- 5.2 Reference data foreign keys
-- ----------------------------------------------------------------------------
create index idx_positions_job_profile_id on positions (job_profile_id);
create index idx_positions_department_id on positions (department_id);

-- ----------------------------------------------------------------------------
-- 5.3 Requisitions
-- ----------------------------------------------------------------------------
create index idx_requisitions_status on requisitions (status);
create index idx_requisitions_hiring_manager_id on requisitions (hiring_manager_id);
create index idx_requisitions_lead_recruiter_id on requisitions (lead_recruiter_id);
create index idx_requisitions_department_id on requisitions (department_id);
create index idx_requisitions_job_profile_id on requisitions (job_profile_id);
create index idx_requisitions_position_id on requisitions (position_id);
create index idx_requisitions_cost_centre_id on requisitions (cost_centre_id);
create index idx_requisitions_location_id on requisitions (location_id);
create index idx_requisitions_grade_id on requisitions (grade_id);
create index idx_requisitions_created_by on requisitions (created_by);

-- ----------------------------------------------------------------------------
-- 5.4 Candidates
-- ----------------------------------------------------------------------------
create index idx_candidates_email on candidates (email);
create index idx_candidates_candidate_number on candidates (candidate_number);
create index idx_candidates_source_id on candidates (source_id);

create index idx_candidate_documents_candidate_id on candidate_documents (candidate_id);
create index idx_candidate_documents_uploaded_by on candidate_documents (uploaded_by);

-- ----------------------------------------------------------------------------
-- 5.5 Applications
-- ----------------------------------------------------------------------------
create index idx_applications_candidate_id on applications (candidate_id);
create index idx_applications_requisition_id on applications (requisition_id);
create index idx_applications_current_stage_id on applications (current_stage_id);
create index idx_applications_assigned_recruiter_id on applications (assigned_recruiter_id);
create index idx_applications_application_status on applications (application_status);
create index idx_applications_source_id on applications (source_id);
create index idx_applications_rejection_reason_id on applications (rejection_reason_id);

create index idx_application_stage_history_application_id on application_stage_history (application_id);
create index idx_application_stage_history_from_stage_id on application_stage_history (from_stage_id);
create index idx_application_stage_history_to_stage_id on application_stage_history (to_stage_id);
create index idx_application_stage_history_changed_by on application_stage_history (changed_by);

-- ----------------------------------------------------------------------------
-- 5.6 Interviewing
-- ----------------------------------------------------------------------------
create index idx_interviews_application_id on interviews (application_id);
create index idx_interviews_status on interviews (status);
create index idx_interviews_scheduled_start on interviews (scheduled_start);
create index idx_interviews_created_by on interviews (created_by);

create index idx_interviewers_interview_id on interviewers (interview_id);
create index idx_interviewers_user_id on interviewers (user_id);

create index idx_interview_scorecards_interview_id on interview_scorecards (interview_id);
create index idx_interview_scorecards_reviewer_id on interview_scorecards (reviewer_id);

create index idx_interview_feedback_scorecard_id on interview_feedback (scorecard_id);
create index idx_interview_feedback_competency_id on interview_feedback (competency_id);

-- ----------------------------------------------------------------------------
-- 5.7 Offers & approvals
-- ----------------------------------------------------------------------------
create index idx_offers_application_id on offers (application_id);
create index idx_offers_status on offers (status);
create index idx_offers_grade_id on offers (grade_id);
create index idx_offers_location_id on offers (location_id);
create index idx_offers_created_by on offers (created_by);

create index idx_approvals_object_type_object_id on approvals (object_type, object_id);
create index idx_approvals_approver_id on approvals (approver_id);
create index idx_approvals_status on approvals (status);

-- ----------------------------------------------------------------------------
-- 5.8 Notes & notifications
-- ----------------------------------------------------------------------------
create index idx_recruiter_notes_application_id on recruiter_notes (application_id);
create index idx_recruiter_notes_created_by on recruiter_notes (created_by);

create index idx_notifications_user_id on notifications (user_id);
create index idx_notifications_read_at on notifications (read_at);

-- ----------------------------------------------------------------------------
-- 5.9 Integration & audit
-- ----------------------------------------------------------------------------
create index idx_workday_mapping_object_type on workday_mapping (object_type);
create index idx_workday_mapping_internal_id on workday_mapping (internal_id);
create index idx_workday_mapping_workday_id on workday_mapping (workday_id);

create index idx_integration_events_object_type_object_id on integration_events (object_type, object_id);
create index idx_integration_events_status on integration_events (status);

create index idx_audit_log_entity_type on audit_log (entity_type);
create index idx_audit_log_entity_id on audit_log (entity_id);
create index idx_audit_log_user_id on audit_log (user_id);
create index idx_audit_log_created_at on audit_log (created_at);


-- ============================================================================
-- 6. TRIGGERS — updated_at maintenance
-- ============================================================================

create trigger trg_users_updated_at before update on users
  for each row execute function update_updated_at();

create trigger trg_departments_updated_at before update on departments
  for each row execute function update_updated_at();

create trigger trg_locations_updated_at before update on locations
  for each row execute function update_updated_at();

create trigger trg_cost_centres_updated_at before update on cost_centres
  for each row execute function update_updated_at();

create trigger trg_job_profiles_updated_at before update on job_profiles
  for each row execute function update_updated_at();

create trigger trg_positions_updated_at before update on positions
  for each row execute function update_updated_at();

create trigger trg_grades_updated_at before update on grades
  for each row execute function update_updated_at();

create trigger trg_pipeline_stages_updated_at before update on pipeline_stages
  for each row execute function update_updated_at();

create trigger trg_requisitions_updated_at before update on requisitions
  for each row execute function update_updated_at();

create trigger trg_candidates_updated_at before update on candidates
  for each row execute function update_updated_at();

create trigger trg_applications_updated_at before update on applications
  for each row execute function update_updated_at();

create trigger trg_interviews_updated_at before update on interviews
  for each row execute function update_updated_at();

create trigger trg_offers_updated_at before update on offers
  for each row execute function update_updated_at();


-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 Role-check helper functions
--     (defined here, now that users / roles / user_roles exist)
-- ----------------------------------------------------------------------------

create or replace function public.get_user_roles(user_uuid uuid)
returns text[] as $$
  select coalesce(array_agg(r.name), '{}')
  from user_roles ur
  join roles r on r.id = ur.role_id
  where ur.user_id = user_uuid;
$$ language sql security definer stable;

create or replace function public.has_role(role_name text)
returns boolean as $$
  select role_name = any(public.get_user_roles(auth.uid()));
$$ language sql security definer stable;

create or replace function public.has_any_role(role_names text[])
returns boolean as $$
  select public.get_user_roles(auth.uid()) && role_names;
$$ language sql security definer stable;

-- Convenience wrapper: true for admins and recruitment-admins, the two
-- "see everything" roles referenced repeatedly by the policies below.
create or replace function public.is_admin()
returns boolean as $$
  select public.has_any_role(array['admin', 'rec_admin']);
$$ language sql security definer stable;

-- Check interviewer assignment without going through RLS (breaks the
-- interviews ↔ interviewers policy cycle that would otherwise cause
-- "infinite recursion detected in policy" errors).
create or replace function public.user_is_interviewer(p_interview_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from interviewers
    where interview_id = p_interview_id and user_id = p_user_id
  );
$$ language sql security definer stable;


-- ----------------------------------------------------------------------------
-- 7.2 Enable RLS on every table
-- ----------------------------------------------------------------------------

alter table roles enable row level security;
alter table users enable row level security;
alter table user_roles enable row level security;
alter table departments enable row level security;
alter table locations enable row level security;
alter table cost_centres enable row level security;
alter table job_profiles enable row level security;
alter table positions enable row level security;
alter table grades enable row level security;
alter table sources enable row level security;
alter table rejection_reasons enable row level security;
alter table pipeline_stages enable row level security;
alter table competencies enable row level security;
alter table requisitions enable row level security;
alter table candidates enable row level security;
alter table candidate_documents enable row level security;
alter table applications enable row level security;
alter table application_stage_history enable row level security;
alter table interviews enable row level security;
alter table interviewers enable row level security;
alter table interview_scorecards enable row level security;
alter table interview_feedback enable row level security;
alter table offers enable row level security;
alter table approvals enable row level security;
alter table recruiter_notes enable row level security;
alter table notifications enable row level security;
alter table workday_mapping enable row level security;
alter table integration_events enable row level security;
alter table audit_log enable row level security;


-- ----------------------------------------------------------------------------
-- 7.3 Reference / master data — readable by any authenticated user,
--     writable only by admins. These tables carry no sensitive information
--     and are needed throughout the app for dropdowns and lookups.
-- ----------------------------------------------------------------------------

create policy "reference_data_select_authenticated" on roles
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on roles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on departments
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on departments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on locations
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on locations
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on cost_centres
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on cost_centres
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on job_profiles
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on job_profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on positions
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on positions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on grades
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on grades
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on sources
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on sources
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on rejection_reasons
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on rejection_reasons
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on pipeline_stages
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on pipeline_stages
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reference_data_select_authenticated" on competencies
  for select using (auth.role() = 'authenticated');
create policy "reference_data_write_admin" on competencies
  for all using (public.is_admin()) with check (public.is_admin());


-- ----------------------------------------------------------------------------
-- 7.4 users
--     - Everyone can read their own profile.
--     - Admins can read (and manage) all profiles.
-- ----------------------------------------------------------------------------

create policy "users_select_own" on users
  for select using (id = auth.uid());

create policy "users_select_admin" on users
  for select using (public.is_admin());

create policy "users_update_own" on users
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "users_all_admin" on users
  for all using (public.is_admin()) with check (public.is_admin());

-- user_roles: users can see their own role assignments; admins manage all.
create policy "user_roles_select_own" on user_roles
  for select using (user_id = auth.uid());

create policy "user_roles_all_admin" on user_roles
  for all using (public.is_admin()) with check (public.is_admin());


-- ----------------------------------------------------------------------------
-- 7.5 requisitions
--     - Admins / rec_admins see all.
--     - Recruiters see requisitions assigned to them (lead_recruiter_id).
--     - Hiring managers see their own requisitions (hiring_manager_id).
-- ----------------------------------------------------------------------------

create policy "requisitions_select_admin" on requisitions
  for select using (public.is_admin());

create policy "requisitions_select_recruiter" on requisitions
  for select using (
    public.has_role('recruiter') and lead_recruiter_id = auth.uid()
  );

create policy "requisitions_select_hiring_manager" on requisitions
  for select using (
    public.has_role('hiring_manager') and hiring_manager_id = auth.uid()
  );

create policy "requisitions_insert_admin_recruiter" on requisitions
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "requisitions_update_admin" on requisitions
  for update using (public.is_admin()) with check (public.is_admin());

create policy "requisitions_update_recruiter" on requisitions
  for update using (
    public.has_role('recruiter') and lead_recruiter_id = auth.uid()
  ) with check (
    public.has_role('recruiter') and lead_recruiter_id = auth.uid()
  );

create policy "requisitions_update_hiring_manager" on requisitions
  for update using (
    public.has_role('hiring_manager') and hiring_manager_id = auth.uid()
  ) with check (
    public.has_role('hiring_manager') and hiring_manager_id = auth.uid()
  );

create policy "requisitions_delete_admin" on requisitions
  for delete using (public.is_admin());


-- ----------------------------------------------------------------------------
-- 7.6 candidates
--     - Admins / rec_admins / recruiters see all candidates. Recruiters are
--       further scoped to "their" candidates at the application layer
--       (e.g. via assigned_recruiter_id on applications), since a candidate
--       record itself is not owned by a single requisition/recruiter.
-- ----------------------------------------------------------------------------

create policy "candidates_select_recruiting_team" on candidates
  for select using (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "candidates_insert_recruiting_team" on candidates
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "candidates_update_recruiting_team" on candidates
  for update using (
    public.is_admin() or public.has_role('recruiter')
  ) with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "candidates_delete_admin" on candidates
  for delete using (public.is_admin());

-- candidate_documents follow the same access rules as their parent candidate.
create policy "candidate_documents_select_recruiting_team" on candidate_documents
  for select using (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "candidate_documents_insert_recruiting_team" on candidate_documents
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "candidate_documents_update_recruiting_team" on candidate_documents
  for update using (
    public.is_admin() or public.has_role('recruiter')
  ) with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "candidate_documents_delete_admin" on candidate_documents
  for delete using (public.is_admin());


-- ----------------------------------------------------------------------------
-- 7.7 applications
--     - Same shape as requisitions: admins see all, recruiters see
--       applications they're assigned to, hiring managers see applications
--       against their own requisitions.
-- ----------------------------------------------------------------------------

create policy "applications_select_admin" on applications
  for select using (public.is_admin());

create policy "applications_select_recruiter" on applications
  for select using (
    public.has_role('recruiter') and assigned_recruiter_id = auth.uid()
  );

create policy "applications_select_hiring_manager" on applications
  for select using (
    public.has_role('hiring_manager')
    and exists (
      select 1 from requisitions r
      where r.id = applications.requisition_id
        and r.hiring_manager_id = auth.uid()
    )
  );

create policy "applications_insert_admin_recruiter" on applications
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "applications_update_admin" on applications
  for update using (public.is_admin()) with check (public.is_admin());

create policy "applications_update_recruiter" on applications
  for update using (
    public.has_role('recruiter') and assigned_recruiter_id = auth.uid()
  ) with check (
    public.has_role('recruiter') and assigned_recruiter_id = auth.uid()
  );

create policy "applications_delete_admin" on applications
  for delete using (public.is_admin());

-- application_stage_history mirrors the parent application's visibility.
create policy "application_stage_history_select" on application_stage_history
  for select using (
    public.is_admin()
    or exists (
      select 1 from applications a
      where a.id = application_stage_history.application_id
        and (
          (public.has_role('recruiter') and a.assigned_recruiter_id = auth.uid())
          or (
            public.has_role('hiring_manager')
            and exists (
              select 1 from requisitions r
              where r.id = a.requisition_id and r.hiring_manager_id = auth.uid()
            )
          )
        )
    )
  );

create policy "application_stage_history_insert_admin_recruiter" on application_stage_history
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );


-- ----------------------------------------------------------------------------
-- 7.8 interviews / interviewers / scorecards / feedback
--     - Participants (interviewers, the interview creator, admins, the
--       assigned recruiter and the hiring manager of the underlying
--       requisition) can see the interview.
-- ----------------------------------------------------------------------------

create policy "interviews_select_participants" on interviews
  for select using (
    public.is_admin()
    or created_by = auth.uid()
    or public.user_is_interviewer(id, auth.uid())
    or exists (
      select 1 from applications a
      where a.id = interviews.application_id
        and (
          (public.has_role('recruiter') and a.assigned_recruiter_id = auth.uid())
          or (
            public.has_role('hiring_manager')
            and exists (
              select 1 from requisitions r
              where r.id = a.requisition_id and r.hiring_manager_id = auth.uid()
            )
          )
        )
    )
  );

create policy "interviews_insert_admin_recruiter" on interviews
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "interviews_update_admin_recruiter_creator" on interviews
  for update using (
    public.is_admin()
    or (public.has_role('recruiter') and created_by = auth.uid())
  ) with check (
    public.is_admin()
    or (public.has_role('recruiter') and created_by = auth.uid())
  );

create policy "interviews_delete_admin" on interviews
  for delete using (public.is_admin());

-- interviewers: visible to admins and to the interview's own participants.
create policy "interviewers_select_participants" on interviewers
  for select using (
    public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from interviews iv
      where iv.id = interviewers.interview_id and iv.created_by = auth.uid()
    )
  );

create policy "interviewers_insert_admin_recruiter" on interviewers
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "interviewers_delete_admin_recruiter" on interviewers
  for delete using (
    public.is_admin() or public.has_role('recruiter')
  );

-- interview_scorecards: visible to admins, the reviewer who owns it, and
-- other participants of the same interview.
create policy "interview_scorecards_select_participants" on interview_scorecards
  for select using (
    public.is_admin()
    or reviewer_id = auth.uid()
    or public.user_is_interviewer(interview_id, auth.uid())
  );

create policy "interview_scorecards_insert_reviewer" on interview_scorecards
  for insert with check (
    public.is_admin()
    or reviewer_id = auth.uid()
  );

create policy "interview_scorecards_update_own" on interview_scorecards
  for update using (
    public.is_admin() or reviewer_id = auth.uid()
  ) with check (
    public.is_admin() or reviewer_id = auth.uid()
  );

create policy "interview_scorecards_delete_admin" on interview_scorecards
  for delete using (public.is_admin());

-- interview_feedback follows its parent scorecard's visibility.
create policy "interview_feedback_select" on interview_feedback
  for select using (
    public.is_admin()
    or exists (
      select 1 from interview_scorecards sc
      where sc.id = interview_feedback.scorecard_id
        and (
          sc.reviewer_id = auth.uid()
          or public.user_is_interviewer(sc.interview_id, auth.uid())
        )
    )
  );

create policy "interview_feedback_insert_own_scorecard" on interview_feedback
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from interview_scorecards sc
      where sc.id = interview_feedback.scorecard_id and sc.reviewer_id = auth.uid()
    )
  );

create policy "interview_feedback_update_own_scorecard" on interview_feedback
  for update using (
    public.is_admin()
    or exists (
      select 1 from interview_scorecards sc
      where sc.id = interview_feedback.scorecard_id and sc.reviewer_id = auth.uid()
    )
  ) with check (
    public.is_admin()
    or exists (
      select 1 from interview_scorecards sc
      where sc.id = interview_feedback.scorecard_id and sc.reviewer_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------------------
-- 7.9 offers
--     - Admins, the assigned recruiter on the underlying application, and
--       HR / reward users can see offers.
-- ----------------------------------------------------------------------------

create policy "offers_select_admin_recruiter_reward" on offers
  for select using (
    public.is_admin()
    or public.has_role('hr_reward')
    or exists (
      select 1 from applications a
      where a.id = offers.application_id and a.assigned_recruiter_id = auth.uid()
    )
  );

create policy "offers_insert_admin_recruiter_reward" on offers
  for insert with check (
    public.is_admin() or public.has_role('recruiter') or public.has_role('hr_reward')
  );

create policy "offers_update_admin_recruiter_reward" on offers
  for update using (
    public.is_admin()
    or public.has_role('hr_reward')
    or exists (
      select 1 from applications a
      where a.id = offers.application_id and a.assigned_recruiter_id = auth.uid()
    )
  ) with check (
    public.is_admin()
    or public.has_role('hr_reward')
    or exists (
      select 1 from applications a
      where a.id = offers.application_id and a.assigned_recruiter_id = auth.uid()
    )
  );

create policy "offers_delete_admin" on offers
  for delete using (public.is_admin());


-- ----------------------------------------------------------------------------
-- 7.10 approvals
--     - Admins see all. Approvers see approvals assigned to them.
-- ----------------------------------------------------------------------------

create policy "approvals_select_admin" on approvals
  for select using (public.is_admin());

create policy "approvals_select_approver" on approvals
  for select using (approver_id = auth.uid());

create policy "approvals_insert_admin_recruiter" on approvals
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "approvals_update_admin" on approvals
  for update using (public.is_admin()) with check (public.is_admin());

create policy "approvals_update_approver" on approvals
  for update using (approver_id = auth.uid()) with check (approver_id = auth.uid());


-- ----------------------------------------------------------------------------
-- 7.11 recruiter_notes
--     - Only admins and recruiters can see/manage these notes.
--     - Hiring managers are explicitly excluded.
-- ----------------------------------------------------------------------------

create policy "recruiter_notes_select_admin_recruiter" on recruiter_notes
  for select using (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "recruiter_notes_insert_admin_recruiter" on recruiter_notes
  for insert with check (
    public.is_admin() or public.has_role('recruiter')
  );

create policy "recruiter_notes_update_admin_own" on recruiter_notes
  for update using (
    public.is_admin() or (public.has_role('recruiter') and created_by = auth.uid())
  ) with check (
    public.is_admin() or (public.has_role('recruiter') and created_by = auth.uid())
  );

create policy "recruiter_notes_delete_admin" on recruiter_notes
  for delete using (public.is_admin());


-- ----------------------------------------------------------------------------
-- 7.12 notifications
--     - Users can only see (and manage) their own notifications.
-- ----------------------------------------------------------------------------

create policy "notifications_select_own" on notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notifications_insert_admin_system" on notifications
  for insert with check (public.is_admin());

create policy "notifications_delete_own" on notifications
  for delete using (user_id = auth.uid());


-- ----------------------------------------------------------------------------
-- 7.13 workday_mapping / integration_events — internal integration tables,
--      admin only.
-- ----------------------------------------------------------------------------

create policy "workday_mapping_all_admin" on workday_mapping
  for all using (public.is_admin()) with check (public.is_admin());

create policy "integration_events_all_admin" on integration_events
  for all using (public.is_admin()) with check (public.is_admin());


-- ----------------------------------------------------------------------------
-- 7.14 audit_log — admins only.
-- ----------------------------------------------------------------------------

create policy "audit_log_select_admin" on audit_log
  for select using (public.is_admin());

create policy "audit_log_insert_admin" on audit_log
  for insert with check (public.is_admin());

-- Audit log rows are immutable by design: no update/delete policies are
-- defined, so those operations are denied by default under RLS.


-- ============================================================================
-- End of migration
-- ============================================================================
