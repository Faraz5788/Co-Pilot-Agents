-- ============================================================================
-- Recruitment Hub — Reference Data Seed
-- ============================================================================
-- Populates the static/reference tables that the rest of the application
-- depends on: roles, departments, locations, cost centres, job profiles,
-- positions, grades, sources, rejection reasons, pipeline stages and
-- competencies.
--
-- This file intentionally does NOT touch `auth.users` or the `users` table —
-- those are created through Supabase Auth and can only be provisioned via
-- the Auth Admin API, not plain SQL. See `scripts/setup-demo.ts` for that,
-- and `supabase/seed/demo-data.sql` for data that depends on those users
-- existing.
--
-- Intended to run against a freshly migrated, empty database (this is
-- exactly what `supabase db reset` does: re-apply migrations, then run this
-- file). Re-running it against a database that already has this data will
-- create duplicates for any table without a unique constraint on the seeded
-- columns.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Roles
-- ----------------------------------------------------------------------------

insert into roles (name, description) values
  ('admin', 'System Administrator'),
  ('rec_admin', 'Recruitment Administrator'),
  ('recruiter', 'Recruiter'),
  ('hiring_manager', 'Hiring Manager'),
  ('interviewer', 'Interviewer'),
  ('hr_reward', 'HR / Reward')
on conflict (name) do nothing;


-- ----------------------------------------------------------------------------
-- Departments (10)
-- ----------------------------------------------------------------------------

insert into departments (name, code, active) values
  ('Human Resources', 'HR', true),
  ('Finance', 'FIN', true),
  ('Technology', 'TECH', true),
  ('Marketing', 'MKT', true),
  ('Operations', 'OPS', true),
  ('Legal', 'LEGAL', true),
  ('Sales', 'SALES', true),
  ('Product', 'PROD', true),
  ('Engineering', 'ENG', true),
  ('Data & Analytics', 'DATA', true)
on conflict (code) do nothing;


-- ----------------------------------------------------------------------------
-- Locations (8)
-- ----------------------------------------------------------------------------

insert into locations (name, city, country, active) values
  ('London', 'London', 'United Kingdom', true),
  ('Manchester', 'Manchester', 'United Kingdom', true),
  ('Birmingham', 'Birmingham', 'United Kingdom', true),
  ('Edinburgh', 'Edinburgh', 'United Kingdom', true),
  ('New York', 'New York', 'United States', true),
  ('Dublin', 'Dublin', 'Ireland', true),
  ('Berlin', 'Berlin', 'Germany', true),
  ('Singapore', 'Singapore', 'Singapore', true);


-- ----------------------------------------------------------------------------
-- Cost Centres (6)
-- ----------------------------------------------------------------------------

insert into cost_centres (name, code, active) values
  ('Human Resources', 'CC-HR-001', true),
  ('Finance', 'CC-FIN-002', true),
  ('Technology', 'CC-TECH-003', true),
  ('Marketing', 'CC-MKT-004', true),
  ('Operations', 'CC-OPS-005', true),
  ('Sales', 'CC-SALES-006', true)
on conflict (code) do nothing;


-- ----------------------------------------------------------------------------
-- Job Profiles (12)
-- ----------------------------------------------------------------------------

insert into job_profiles (name, code, level, active) values
  ('HR Analyst', 'JP-001', 'Associate', true),
  ('HR Business Partner', 'JP-002', 'Manager', true),
  ('Software Engineer', 'JP-003', 'Professional', true),
  ('Senior Software Engineer', 'JP-004', 'Senior', true),
  ('Data Analyst', 'JP-005', 'Professional', true),
  ('BI Developer', 'JP-006', 'Professional', true),
  ('Product Manager', 'JP-007', 'Manager', true),
  ('Marketing Manager', 'JP-008', 'Manager', true),
  ('Finance Analyst', 'JP-009', 'Associate', true),
  ('Operations Manager', 'JP-010', 'Manager', true),
  ('Sales Executive', 'JP-011', 'Professional', true),
  ('Legal Counsel', 'JP-012', 'Senior', true);


-- ----------------------------------------------------------------------------
-- Grades (6)
-- ----------------------------------------------------------------------------

insert into grades (name, level, active) values
  ('Grade 1', 1, true),
  ('Grade 2', 2, true),
  ('Grade 3', 3, true),
  ('Grade 4', 4, true),
  ('Grade 5', 5, true),
  ('Grade 6', 6, true);


-- ----------------------------------------------------------------------------
-- Positions (10) — linked to job profiles and departments above
-- ----------------------------------------------------------------------------

insert into positions (title, position_number, job_profile_id, department_id, active)
values
  ('HR Analyst', 'P-001',
    (select id from job_profiles where code = 'JP-001'),
    (select id from departments where code = 'HR'), true),
  ('HR Business Partner', 'P-002',
    (select id from job_profiles where code = 'JP-002'),
    (select id from departments where code = 'HR'), true),
  ('Software Engineer', 'P-003',
    (select id from job_profiles where code = 'JP-003'),
    (select id from departments where code = 'ENG'), true),
  ('Senior Software Engineer', 'P-004',
    (select id from job_profiles where code = 'JP-004'),
    (select id from departments where code = 'ENG'), true),
  ('Data Analyst', 'P-005',
    (select id from job_profiles where code = 'JP-005'),
    (select id from departments where code = 'DATA'), true),
  ('BI Developer', 'P-006',
    (select id from job_profiles where code = 'JP-006'),
    (select id from departments where code = 'DATA'), true),
  ('Product Manager', 'P-007',
    (select id from job_profiles where code = 'JP-007'),
    (select id from departments where code = 'PROD'), true),
  ('Marketing Manager', 'P-008',
    (select id from job_profiles where code = 'JP-008'),
    (select id from departments where code = 'MKT'), true),
  ('Finance Analyst', 'P-009',
    (select id from job_profiles where code = 'JP-009'),
    (select id from departments where code = 'FIN'), true),
  ('Operations Manager', 'P-010',
    (select id from job_profiles where code = 'JP-010'),
    (select id from departments where code = 'OPS'), true)
on conflict (position_number) do nothing;


-- ----------------------------------------------------------------------------
-- Sources (8)
-- ----------------------------------------------------------------------------

insert into sources (name, category, active) values
  ('LinkedIn', 'job_board', true),
  ('Indeed', 'job_board', true),
  ('Glassdoor', 'job_board', true),
  ('Employee Referral', 'referral', true),
  ('Company Website', 'career_site', true),
  ('Agency', 'agency', true),
  ('Job Board', 'job_board', true),
  ('Direct Application', 'other', true);


-- ----------------------------------------------------------------------------
-- Rejection Reasons (8)
-- ----------------------------------------------------------------------------

insert into rejection_reasons (name, category, active) values
  ('Insufficient experience', 'screening', true),
  ('Skills mismatch', 'screening', true),
  ('Failed technical assessment', 'interview', true),
  ('Cultural fit concerns', 'interview', true),
  ('Salary expectations too high', 'offer', true),
  ('Position filled', 'process', true),
  ('Candidate withdrew', 'candidate_decision', true),
  ('Better qualified candidate found', 'process', true);


-- ----------------------------------------------------------------------------
-- Pipeline Stages (12, in order)
-- ----------------------------------------------------------------------------

insert into pipeline_stages (name, display_order, stage_type, is_default, active) values
  ('Applied', 1, 'application', true, true),
  ('CV Review', 2, 'screening', false, true),
  ('Recruiter Screening', 3, 'screening', false, true),
  ('Hiring Manager Review', 4, 'review', false, true),
  ('Interview 1', 5, 'interview', false, true),
  ('Interview 2', 6, 'interview', false, true),
  ('Final Review', 7, 'review', false, true),
  ('Offer Approval', 8, 'offer', false, true),
  ('Offer', 9, 'offer', false, true),
  ('Hired', 10, 'hired', false, true),
  ('Rejected', 11, 'rejected', false, true),
  ('Withdrawn', 12, 'withdrawn', false, true);


-- ----------------------------------------------------------------------------
-- Competencies (6)
-- ----------------------------------------------------------------------------

insert into competencies (name, description, category, active) values
  ('Relevant Experience', 'Depth and relevance of prior experience to the role', 'core', true),
  ('Technical Knowledge', 'Technical skills and knowledge required for the role', 'core', true),
  ('Communication Skills', 'Ability to communicate clearly with stakeholders', 'behavioural', true),
  ('Problem Solving', 'Ability to analyse problems and reach sound solutions', 'core', true),
  ('Role Motivation', 'Motivation and enthusiasm for the specific role', 'behavioural', true),
  ('Values & Behavioural Competencies', 'Alignment with company values and behaviours', 'behavioural', true);


-- ============================================================================
-- End of reference data seed
-- ============================================================================
