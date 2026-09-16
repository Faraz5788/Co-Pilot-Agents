-- ============================================================================
-- Recruitment Hub — Seed / Demo Data
-- ============================================================================
-- Run AFTER the initial schema migration.
-- Creates realistic demo data including:
--   • 6 roles + 8 demo users with role assignments
--   • 7 departments, 6 locations, 5 cost centres, 8 job profiles, 8 grades
--   • 8 sources, 6 rejection reasons, 10 pipeline stages, 8 competencies
--   • 12 requisitions in various statuses
--   • 55 candidates
--   • 40+ applications across the pipeline
--   • Interviews, scorecards, offers, recruiter notes, audit log entries
--
-- ⚠ This file contains NO secrets — all passwords are set via Supabase Auth.
--   Demo users must be created in Supabase Auth first (see README).
-- ============================================================================

-- Stable UUIDs for cross-references
-- Roles
DO $$ BEGIN

-- -------------------------------------------------------
-- ROLES
-- -------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
  ('10000000-0000-0000-0000-000000000001', 'admin',           'System administrator with full access'),
  ('10000000-0000-0000-0000-000000000002', 'rec_admin',       'Recruitment administrator — manages reference data and workflows'),
  ('10000000-0000-0000-0000-000000000003', 'recruiter',       'Recruiter — manages candidates, applications and interviews'),
  ('10000000-0000-0000-0000-000000000004', 'hiring_manager',  'Hiring manager — raises requisitions and approves offers'),
  ('10000000-0000-0000-0000-000000000005', 'interviewer',     'Interviewer — provides interview feedback'),
  ('10000000-0000-0000-0000-000000000006', 'hr_reward',       'HR reward analyst — manages compensation and offer approvals')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- DEPARTMENTS
-- -------------------------------------------------------
INSERT INTO departments (id, name, code, workday_id, active) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Engineering',      'ENG',  'WD-DEP-001', true),
  ('20000000-0000-0000-0000-000000000002', 'Product',          'PROD', 'WD-DEP-002', true),
  ('20000000-0000-0000-0000-000000000003', 'Design',           'DES',  'WD-DEP-003', true),
  ('20000000-0000-0000-0000-000000000004', 'Marketing',        'MKT',  'WD-DEP-004', true),
  ('20000000-0000-0000-0000-000000000005', 'Sales',            'SAL',  'WD-DEP-005', true),
  ('20000000-0000-0000-0000-000000000006', 'Human Resources',  'HR',   'WD-DEP-006', true),
  ('20000000-0000-0000-0000-000000000007', 'Finance',          'FIN',  'WD-DEP-007', true);

-- -------------------------------------------------------
-- LOCATIONS
-- -------------------------------------------------------
INSERT INTO locations (id, name, city, country, workday_id, active) VALUES
  ('30000000-0000-0000-0000-000000000001', 'London HQ',       'London',        'United Kingdom', 'WD-LOC-001', true),
  ('30000000-0000-0000-0000-000000000002', 'Manchester',      'Manchester',    'United Kingdom', 'WD-LOC-002', true),
  ('30000000-0000-0000-0000-000000000003', 'Edinburgh',       'Edinburgh',     'United Kingdom', 'WD-LOC-003', true),
  ('30000000-0000-0000-0000-000000000004', 'New York',        'New York',      'United States',  'WD-LOC-004', true),
  ('30000000-0000-0000-0000-000000000005', 'Berlin',          'Berlin',        'Germany',        'WD-LOC-005', true),
  ('30000000-0000-0000-0000-000000000006', 'Remote (Global)', NULL,            NULL,             'WD-LOC-006', true);

-- -------------------------------------------------------
-- COST CENTRES
-- -------------------------------------------------------
INSERT INTO cost_centres (id, name, code, workday_id, active) VALUES
  ('40000000-0000-0000-0000-000000000001', 'CC-Engineering',  'CC-ENG',  'WD-CC-001', true),
  ('40000000-0000-0000-0000-000000000002', 'CC-Product',      'CC-PROD', 'WD-CC-002', true),
  ('40000000-0000-0000-0000-000000000003', 'CC-Design',       'CC-DES',  'WD-CC-003', true),
  ('40000000-0000-0000-0000-000000000004', 'CC-Go-To-Market', 'CC-GTM',  'WD-CC-004', true),
  ('40000000-0000-0000-0000-000000000005', 'CC-Corporate',    'CC-CORP', 'WD-CC-005', true);

-- -------------------------------------------------------
-- JOB PROFILES
-- -------------------------------------------------------
INSERT INTO job_profiles (id, name, code, level, workday_id, active) VALUES
  ('50000000-0000-0000-0000-000000000001', 'Software Engineer',          'JP-SWE',  'IC3', 'WD-JP-001', true),
  ('50000000-0000-0000-0000-000000000002', 'Senior Software Engineer',   'JP-SSWE', 'IC4', 'WD-JP-002', true),
  ('50000000-0000-0000-0000-000000000003', 'Product Manager',            'JP-PM',   'IC4', 'WD-JP-003', true),
  ('50000000-0000-0000-0000-000000000004', 'UX Designer',               'JP-UXD',  'IC3', 'WD-JP-004', true),
  ('50000000-0000-0000-0000-000000000005', 'Data Analyst',              'JP-DA',   'IC2', 'WD-JP-005', true),
  ('50000000-0000-0000-0000-000000000006', 'Engineering Manager',       'JP-EM',   'M1',  'WD-JP-006', true),
  ('50000000-0000-0000-0000-000000000007', 'Marketing Specialist',      'JP-MKT',  'IC2', 'WD-JP-007', true),
  ('50000000-0000-0000-0000-000000000008', 'Sales Development Rep',     'JP-SDR',  'IC1', 'WD-JP-008', true);

-- -------------------------------------------------------
-- GRADES
-- -------------------------------------------------------
INSERT INTO grades (id, name, level, workday_id, active) VALUES
  ('60000000-0000-0000-0000-000000000001', 'Band 1 — Entry',       1, 'WD-G-001', true),
  ('60000000-0000-0000-0000-000000000002', 'Band 2 — Associate',   2, 'WD-G-002', true),
  ('60000000-0000-0000-0000-000000000003', 'Band 3 — Mid-Level',   3, 'WD-G-003', true),
  ('60000000-0000-0000-0000-000000000004', 'Band 4 — Senior',      4, 'WD-G-004', true),
  ('60000000-0000-0000-0000-000000000005', 'Band 5 — Staff',       5, 'WD-G-005', true),
  ('60000000-0000-0000-0000-000000000006', 'Band 6 — Principal',   6, 'WD-G-006', true),
  ('60000000-0000-0000-0000-000000000007', 'Band M1 — Manager',    7, 'WD-G-007', true),
  ('60000000-0000-0000-0000-000000000008', 'Band M2 — Sr Manager', 8, 'WD-G-008', true);

-- -------------------------------------------------------
-- POSITIONS
-- -------------------------------------------------------
INSERT INTO positions (id, title, position_number, job_profile_id, department_id, workday_id, active) VALUES
  ('51000000-0000-0000-0000-000000000001', 'Software Engineer — Platform', 'POS-001', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'WD-POS-001', true),
  ('51000000-0000-0000-0000-000000000002', 'Senior Software Engineer — Backend', 'POS-002', '50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'WD-POS-002', true),
  ('51000000-0000-0000-0000-000000000003', 'Product Manager — Growth', 'POS-003', '50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'WD-POS-003', true),
  ('51000000-0000-0000-0000-000000000004', 'UX Designer — Mobile', 'POS-004', '50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'WD-POS-004', true),
  ('51000000-0000-0000-0000-000000000005', 'Engineering Manager — Frontend', 'POS-005', '50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'WD-POS-005', true);

-- -------------------------------------------------------
-- SOURCES
-- -------------------------------------------------------
INSERT INTO sources (id, name, category, active) VALUES
  ('70000000-0000-0000-0000-000000000001', 'LinkedIn',          'online',    true),
  ('70000000-0000-0000-0000-000000000002', 'Indeed',            'online',    true),
  ('70000000-0000-0000-0000-000000000003', 'Employee Referral', 'referral',  true),
  ('70000000-0000-0000-0000-000000000004', 'Company Website',   'direct',    true),
  ('70000000-0000-0000-0000-000000000005', 'Recruiter Sourced', 'sourced',   true),
  ('70000000-0000-0000-0000-000000000006', 'University Fair',   'event',     true),
  ('70000000-0000-0000-0000-000000000007', 'Glassdoor',         'online',    true),
  ('70000000-0000-0000-0000-000000000008', 'Agency — TechStaff','agency',    true);

-- -------------------------------------------------------
-- REJECTION REASONS
-- -------------------------------------------------------
INSERT INTO rejection_reasons (id, name, category, active) VALUES
  ('71000000-0000-0000-0000-000000000001', 'Insufficient experience',        'skills',       true),
  ('71000000-0000-0000-0000-000000000002', 'Skills mismatch',                'skills',       true),
  ('71000000-0000-0000-0000-000000000003', 'Salary expectations too high',   'compensation', true),
  ('71000000-0000-0000-0000-000000000004', 'Failed technical assessment',    'assessment',   true),
  ('71000000-0000-0000-0000-000000000005', 'Culture fit concerns',           'cultural',     true),
  ('71000000-0000-0000-0000-000000000006', 'Position filled',               'operational',  true);

-- -------------------------------------------------------
-- PIPELINE STAGES (in display order)
-- -------------------------------------------------------
INSERT INTO pipeline_stages (id, name, display_order, stage_type, is_default, active) VALUES
  ('80000000-0000-0000-0000-000000000001', 'Applied',                  1,  'application', true,  true),
  ('80000000-0000-0000-0000-000000000002', 'CV Review',                2,  'screening',   false, true),
  ('80000000-0000-0000-0000-000000000003', 'Recruiter Screening',      3,  'screening',   false, true),
  ('80000000-0000-0000-0000-000000000004', 'Hiring Manager Review',    4,  'review',      false, true),
  ('80000000-0000-0000-0000-000000000005', 'Interview 1',              5,  'interview',   false, true),
  ('80000000-0000-0000-0000-000000000006', 'Interview 2',              6,  'interview',   false, true),
  ('80000000-0000-0000-0000-000000000007', 'Final Interview',          7,  'interview',   false, true),
  ('80000000-0000-0000-0000-000000000008', 'Offer',                    8,  'offer',       false, true),
  ('80000000-0000-0000-0000-000000000009', 'Hired',                    9,  'hired',       false, true),
  ('80000000-0000-0000-0000-000000000010', 'Rejected',                 10, 'rejected',    false, true);

-- -------------------------------------------------------
-- COMPETENCIES
-- -------------------------------------------------------
INSERT INTO competencies (id, name, description, category, active) VALUES
  ('90000000-0000-0000-0000-000000000001', 'Technical Skills',       'Ability to apply domain-specific knowledge',                'technical',    true),
  ('90000000-0000-0000-0000-000000000002', 'Problem Solving',        'Analytical thinking and creative problem resolution',       'technical',    true),
  ('90000000-0000-0000-0000-000000000003', 'Communication',          'Verbal and written clarity, active listening',              'behavioural',  true),
  ('90000000-0000-0000-0000-000000000004', 'Collaboration',          'Teamwork, cross-functional partnership',                   'behavioural',  true),
  ('90000000-0000-0000-0000-000000000005', 'Leadership',             'Guiding and developing others, decision making',           'leadership',   true),
  ('90000000-0000-0000-0000-000000000006', 'Adaptability',           'Flexibility in changing environments',                     'behavioural',  true),
  ('90000000-0000-0000-0000-000000000007', 'Domain Knowledge',       'Understanding of industry-specific concepts',              'technical',    true),
  ('90000000-0000-0000-0000-000000000008', 'Customer Orientation',   'Focus on user needs and customer outcomes',                'behavioural',  true);


-- -------------------------------------------------------
-- DEMO USERS
-- -------------------------------------------------------
-- These correspond to auth.users entries that must be created via Supabase Auth.
-- Use the setup script (scripts/setup-demo.ts) or the Supabase dashboard to
-- create auth entries first. The UUIDs here MUST match the auth.users IDs.
--
-- Demo credentials (all share password: Demo123!):
--   admin@recruitment-hub.dev       — Admin
--   rec.admin@recruitment-hub.dev   — Recruitment Admin
--   sarah.recruiter@recruitment-hub.dev — Recruiter
--   james.recruiter@recruitment-hub.dev — Recruiter
--   helen.manager@recruitment-hub.dev   — Hiring Manager
--   david.manager@recruitment-hub.dev   — Hiring Manager
--   emily.interviewer@recruitment-hub.dev — Interviewer
--   claire.reward@recruitment-hub.dev    — HR Reward
-- -------------------------------------------------------

INSERT INTO users (id, email, first_name, last_name, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@recruitment-hub.dev',            'System', 'Admin',     'active'),
  ('a0000000-0000-0000-0000-000000000002', 'rec.admin@recruitment-hub.dev',        'Rachel', 'Thompson',  'active'),
  ('a0000000-0000-0000-0000-000000000003', 'sarah.recruiter@recruitment-hub.dev',  'Sarah',  'Mitchell',  'active'),
  ('a0000000-0000-0000-0000-000000000004', 'james.recruiter@recruitment-hub.dev',  'James',  'Wilson',    'active'),
  ('a0000000-0000-0000-0000-000000000005', 'helen.manager@recruitment-hub.dev',    'Helen',  'Carter',    'active'),
  ('a0000000-0000-0000-0000-000000000006', 'david.manager@recruitment-hub.dev',    'David',  'Okoro',     'active'),
  ('a0000000-0000-0000-0000-000000000007', 'emily.interviewer@recruitment-hub.dev','Emily',  'Zhao',      'active'),
  ('a0000000-0000-0000-0000-000000000008', 'claire.reward@recruitment-hub.dev',    'Claire', 'Morrison',  'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'), -- Admin
  ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'), -- Rec Admin
  ('a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003'), -- Recruiter
  ('a0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003'), -- Recruiter
  ('a0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004'), -- Hiring Manager
  ('a0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004'), -- Hiring Manager
  ('a0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005'), -- also Interviewer
  ('a0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005'), -- Interviewer
  ('a0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000006')  -- HR Reward
ON CONFLICT DO NOTHING;


-- -------------------------------------------------------
-- REQUISITIONS (12)
-- -------------------------------------------------------
INSERT INTO requisitions (id, reference_number, title, description, job_profile_id, department_id, cost_centre_id, location_id, hiring_manager_id, lead_recruiter_id, employment_type, fte, vacancy_count, grade_id, salary_min, salary_max, currency, reason_for_hire, target_start_date, status, opened_date, created_by) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'REQ-2026-001', 'Backend Software Engineer', 'Build and maintain REST APIs and microservices for our core platform.', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'full_time', 1.00, 2, '60000000-0000-0000-0000-000000000003', 55000, 75000, 'GBP', 'Team growth — new product line', '2026-11-01', 'open', '2026-08-15', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000002', 'REQ-2026-002', 'Senior Frontend Engineer', 'Lead frontend development using React 19 and Next.js 15.', '50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000004', 75000, 95000, 'GBP', 'Replacement for departing team member', '2026-10-15', 'open', '2026-08-01', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000003', 'REQ-2026-003', 'Product Manager — Growth', 'Define and execute growth strategy for B2B SaaS product line.', '50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000004', 70000, 90000, 'GBP', 'New role — growth initiative', '2026-12-01', 'open', '2026-09-01', 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000004', 'REQ-2026-004', 'UX Designer', 'Design user experiences for mobile and web applications.', '50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000003', 45000, 60000, 'GBP', 'Team expansion', '2026-11-15', 'open', '2026-08-20', 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000005', 'REQ-2026-005', 'Data Analyst', 'Analyse product usage data and create actionable insights.', '50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000002', 40000, 55000, 'GBP', 'New headcount', '2026-12-01', 'approved', NULL, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000006', 'REQ-2026-006', 'Engineering Manager — Platform', 'Lead the platform engineering team of 8 engineers.', '50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000007', 90000, 120000, 'GBP', 'Replacement — internal promotion', '2026-10-01', 'open', '2026-07-20', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000007', 'REQ-2026-007', 'Marketing Specialist — Digital', 'Execute digital marketing campaigns across SEO, SEM and social channels.', '50000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000002', 35000, 45000, 'GBP', 'New headcount', '2026-11-01', 'open', '2026-09-05', 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000008', 'REQ-2026-008', 'Sales Development Representative', 'Generate and qualify outbound leads for the enterprise sales team.', '50000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'full_time', 1.00, 3, '60000000-0000-0000-0000-000000000001', 28000, 35000, 'GBP', 'Scaling outbound team', '2026-10-15', 'open', '2026-08-25', 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000009', 'REQ-2026-009', 'Contract DevOps Engineer', 'Support cloud infrastructure migration project (6-month contract).', '50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'contract', 1.00, 1, '60000000-0000-0000-0000-000000000004', 500, 650, 'GBP', 'Project-based need', '2026-10-01', 'open', '2026-09-01', 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000010', 'REQ-2026-010', 'HR Business Partner', 'Partner with engineering leadership on people strategy.', NULL, '20000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000004', 60000, 80000, 'GBP', 'Replacement', '2026-11-01', 'draft', NULL, 'a0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000011', 'REQ-2026-011', 'Finance Analyst', 'Support monthly close and FP&A reporting.', NULL, '20000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', NULL, 'full_time', 1.00, 1, '60000000-0000-0000-0000-000000000003', 40000, 55000, 'GBP', 'New headcount', '2026-12-01', 'pending_approval', NULL, 'a0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000012', 'REQ-2026-012', 'Intern — Software Engineering', 'Summer internship programme for penultimate-year students.', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'intern', 1.00, 4, '60000000-0000-0000-0000-000000000001', 22000, 25000, 'GBP', 'Annual internship programme', '2027-06-01', 'closed', '2026-03-01', 'a0000000-0000-0000-0000-000000000005');

-- -------------------------------------------------------
-- CANDIDATES (55)
-- -------------------------------------------------------
INSERT INTO candidates (id, candidate_number, first_name, last_name, email, phone, location, current_employer, current_job_title, source_id, notice_period, salary_expectation, currency, consent_given, consent_date) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'CAND-0001', 'Alex',      'Chen',         'alex.chen@example.com',          '+44 7700 100001', 'London, UK',       'TechCorp',      'Software Engineer',        '70000000-0000-0000-0000-000000000001', '1 month',  65000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000002', 'CAND-0002', 'Priya',     'Sharma',       'priya.sharma@example.com',       '+44 7700 100002', 'London, UK',       'DataFlow Ltd',  'Senior Developer',         '70000000-0000-0000-0000-000000000001', '3 months', 85000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000003', 'CAND-0003', 'Michael',   'O''Brien',     'michael.obrien@example.com',     '+44 7700 100003', 'Manchester, UK',   'CloudBase',     'Frontend Developer',       '70000000-0000-0000-0000-000000000003', '1 month',  60000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000004', 'CAND-0004', 'Sofia',     'Martinez',     'sofia.martinez@example.com',     '+44 7700 100004', 'Edinburgh, UK',    'DesignHub',     'UX Designer',              '70000000-0000-0000-0000-000000000004', '2 months', 55000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000005', 'CAND-0005', 'James',     'Okafor',       'james.okafor@example.com',       '+44 7700 100005', 'London, UK',       'Analytix',      'Data Analyst',             '70000000-0000-0000-0000-000000000002', '1 month',  48000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000006', 'CAND-0006', 'Emma',      'Williams',     'emma.williams@example.com',      '+44 7700 100006', 'Bristol, UK',      'MediaWorks',    'Marketing Manager',        '70000000-0000-0000-0000-000000000001', '3 months', 50000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000007', 'CAND-0007', 'Liam',      'Johnson',      'liam.johnson@example.com',       '+44 7700 100007', 'Manchester, UK',   'SalesPro',      'Sales Executive',          '70000000-0000-0000-0000-000000000002', '1 month',  32000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000008', 'CAND-0008', 'Yuki',      'Tanaka',       'yuki.tanaka@example.com',        '+44 7700 100008', 'London, UK',       'InfraCloud',    'DevOps Engineer',          '70000000-0000-0000-0000-000000000005', '2 months', 80000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000009', 'CAND-0009', 'Olivia',    'Brown',        'olivia.brown@example.com',       '+44 7700 100009', 'London, UK',       'PeopleFirst',   'HR Advisor',               '70000000-0000-0000-0000-000000000004', '1 month',  55000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000010', 'CAND-0010', 'Hassan',    'Al-Rashid',    'hassan.alrashid@example.com',    '+44 7700 100010', 'Birmingham, UK',   'FinanceHub',    'Financial Analyst',        '70000000-0000-0000-0000-000000000002', '1 month',  45000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000011', 'CAND-0011', 'Rachel',    'Green',        'rachel.green@example.com',       '+44 7700 100011', 'London, UK',       'StartupXYZ',    'Full Stack Developer',     '70000000-0000-0000-0000-000000000001', '2 weeks',  70000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000012', 'CAND-0012', 'Daniel',    'Kim',          'daniel.kim@example.com',         '+44 7700 100012', 'London, UK',       'BigTech Inc',   'Engineering Manager',      '70000000-0000-0000-0000-000000000005', '3 months', 110000,'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000013', 'CAND-0013', 'Fatima',    'Hassan',       'fatima.hassan@example.com',      '+44 7700 100013', 'Leeds, UK',        'CreativeFlow',  'Product Designer',         '70000000-0000-0000-0000-000000000003', '1 month',  52000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000014', 'CAND-0014', 'Tom',       'Anderson',     'tom.anderson@example.com',       '+44 7700 100014', 'London, UK',       'ScaleUp Ltd',   'Product Manager',          '70000000-0000-0000-0000-000000000001', '2 months', 80000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000015', 'CAND-0015', 'Aisha',     'Patel',        'aisha.patel@example.com',        '+44 7700 100015', 'London, UK',       'AdAgency',      'Digital Marketing Lead',   '70000000-0000-0000-0000-000000000004', '1 month',  42000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000016', 'CAND-0016', 'Marcus',    'Johansson',    'marcus.johansson@example.com',   '+44 7700 100016', 'Remote',           'Freelance',     'Contract Developer',       '70000000-0000-0000-0000-000000000001', 'Immediate',600,   'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000017', 'CAND-0017', 'Chloe',     'Dubois',       'chloe.dubois@example.com',       '+44 7700 100017', 'London, UK',       'BrandCo',       'Brand Manager',            '70000000-0000-0000-0000-000000000002', '1 month',  48000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000018', 'CAND-0018', 'Ryan',      'Murphy',       'ryan.murphy@example.com',        '+44 7700 100018', 'Dublin, IE',       'SaaS Corp',     'SDR',                      '70000000-0000-0000-0000-000000000001', '2 weeks',  30000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000019', 'CAND-0019', 'Nina',      'Petrov',       'nina.petrov@example.com',        '+44 7700 100019', 'London, UK',       'QuantumLabs',   'ML Engineer',              '70000000-0000-0000-0000-000000000005', '2 months', 90000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000020', 'CAND-0020', 'Oscar',     'Davies',       'oscar.davies@example.com',       '+44 7700 100020', 'Cardiff, UK',      'FinTech Co',    'Backend Developer',        '70000000-0000-0000-0000-000000000004', '1 month',  62000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000021', 'CAND-0021', 'Lucy',      'Taylor',       'lucy.taylor@example.com',        '+44 7700 100021', 'London, UK',       NULL,            'Graduate',                 '70000000-0000-0000-0000-000000000006', NULL,       25000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000022', 'CAND-0022', 'Arjun',     'Kapoor',       'arjun.kapoor@example.com',       '+44 7700 100022', 'London, UK',       'WebDev Ltd',    'React Developer',          '70000000-0000-0000-0000-000000000003', '1 month',  58000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000023', 'CAND-0023', 'Mia',       'Rodriguez',    'mia.rodriguez@example.com',      '+44 7700 100023', 'Manchester, UK',   'Retail Corp',   'Sales Rep',                '70000000-0000-0000-0000-000000000002', '2 weeks',  28000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000024', 'CAND-0024', 'Noah',      'Fletcher',     'noah.fletcher@example.com',      '+44 7700 100024', 'London, UK',       'CloudOps',      'SRE',                      '70000000-0000-0000-0000-000000000001', '3 months', 85000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000025', 'CAND-0025', 'Zara',      'Hussain',      'zara.hussain@example.com',       '+44 7700 100025', 'Birmingham, UK',   'DesignStudio',  'Visual Designer',          '70000000-0000-0000-0000-000000000004', '1 month',  42000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000026', 'CAND-0026', 'Ethan',     'Clarke',       'ethan.clarke@example.com',       '+44 7700 100026', 'Edinburgh, UK',    'DataCo',        'Data Engineer',            '70000000-0000-0000-0000-000000000005', '2 months', 72000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000027', 'CAND-0027', 'Isla',      'Wright',       'isla.wright@example.com',        '+44 7700 100027', 'Glasgow, UK',      NULL,            'Penultimate Year Student', '70000000-0000-0000-0000-000000000006', NULL,       23000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000028', 'CAND-0028', 'Leo',       'Nguyen',       'leo.nguyen@example.com',         '+44 7700 100028', 'London, UK',       'AppWorks',      'iOS Developer',            '70000000-0000-0000-0000-000000000001', '1 month',  68000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000029', 'CAND-0029', 'Hannah',    'Baker',        'hannah.baker@example.com',       '+44 7700 100029', 'Manchester, UK',   'ConsultCo',     'Business Analyst',         '70000000-0000-0000-0000-000000000003', '1 month',  45000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000030', 'CAND-0030', 'Oliver',    'Scott',        'oliver.scott@example.com',       '+44 7700 100030', 'London, UK',       'MarketingPro',  'Content Strategist',       '70000000-0000-0000-0000-000000000002', '1 month',  40000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000031', 'CAND-0031', 'Amara',     'Osei',         'amara.osei@example.com',         '+44 7700 100031', 'London, UK',       'TechStart',     'Junior Developer',         '70000000-0000-0000-0000-000000000004', '2 weeks',  35000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000032', 'CAND-0032', 'Jack',      'Harris',       'jack.harris@example.com',        '+44 7700 100032', 'Bristol, UK',      'DigitalCo',     'Product Owner',            '70000000-0000-0000-0000-000000000001', '2 months', 75000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000033', 'CAND-0033', 'Leah',      'Cooper',       'leah.cooper@example.com',        '+44 7700 100033', 'London, UK',       'PeopleOps',     'HR Coordinator',           '70000000-0000-0000-0000-000000000003', '1 month',  38000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000034', 'CAND-0034', 'George',    'Reed',         'george.reed@example.com',        '+44 7700 100034', 'London, UK',       'GrowthCo',      'Growth Marketer',          '70000000-0000-0000-0000-000000000002', '1 month',  44000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000035', 'CAND-0035', 'Sophia',    'Evans',        'sophia.evans@example.com',       '+44 7700 100035', 'Remote',           'Freelance',     'UX Researcher',            '70000000-0000-0000-0000-000000000007', '1 week',   50000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000036', 'CAND-0036', 'William',   'Turner',       'william.turner@example.com',     '+44 7700 100036', 'London, UK',       'EnterpriseInc', 'Account Executive',        '70000000-0000-0000-0000-000000000001', '3 months', 55000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000037', 'CAND-0037', 'Grace',     'Lee',          'grace.lee@example.com',          '+44 7700 100037', 'London, UK',       'PayTech',       'Finance Manager',          '70000000-0000-0000-0000-000000000005', '2 months', 65000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000038', 'CAND-0038', 'Charlie',   'White',        'charlie.white@example.com',      '+44 7700 100038', 'Manchester, UK',   NULL,            'Final Year Student',       '70000000-0000-0000-0000-000000000006', NULL,       24000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000039', 'CAND-0039', 'Ruby',      'King',         'ruby.king@example.com',          '+44 7700 100039', 'London, UK',       'DesignAgency',  'UI Designer',              '70000000-0000-0000-0000-000000000003', '1 month',  48000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000040', 'CAND-0040', 'Sam',       'Reeves',       'sam.reeves@example.com',         '+44 7700 100040', 'London, UK',       'DataViz Ltd',   'Data Scientist',           '70000000-0000-0000-0000-000000000001', '2 months', 75000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000041', 'CAND-0041', 'Jasmine',   'Begum',        'jasmine.begum@example.com',      '+44 7700 100041', 'Leeds, UK',        'SalesForceX',   'BDR',                      '70000000-0000-0000-0000-000000000002', '2 weeks',  29000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000042', 'CAND-0042', 'Finn',      'O''Connor',    'finn.oconnor@example.com',       '+44 7700 100042', 'Dublin, IE',       'CloudNative',   'Platform Engineer',        '70000000-0000-0000-0000-000000000001', '1 month',  78000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000043', 'CAND-0043', 'Ava',       'Mitchell',     'ava.mitchell@example.com',       '+44 7700 100043', 'Edinburgh, UK',    'HRTech',        'HRBP',                     '70000000-0000-0000-0000-000000000004', '2 months', 58000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000044', 'CAND-0044', 'Max',       'Hoffman',      'max.hoffman@example.com',        '+49 170 100044',  'Berlin, DE',       'TechBerlin',    'Backend Engineer',         '70000000-0000-0000-0000-000000000005', '3 months', 70000, 'EUR', true, now()),
  ('c0000000-0000-0000-0000-000000000045', 'CAND-0045', 'Ellie',     'Foster',       'ellie.foster@example.com',       '+44 7700 100045', 'London, UK',       'RecruitPro',    'Talent Acquisition Spec',  '70000000-0000-0000-0000-000000000003', '1 month',  42000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000046', 'CAND-0046', 'Ben',       'Phillips',     'ben.phillips@example.com',       '+44 7700 100046', 'London, UK',       'WebShop',       'Frontend Engineer',        '70000000-0000-0000-0000-000000000001', '1 month',  62000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000047', 'CAND-0047', 'Lily',      'Adams',        'lily.adams@example.com',         '+44 7700 100047', 'Manchester, UK',   'ContentInc',    'Copywriter',               '70000000-0000-0000-0000-000000000002', '2 weeks',  34000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000048', 'CAND-0048', 'Henry',     'Campbell',     'henry.campbell@example.com',     '+44 7700 100048', 'London, UK',       'FinCo',         'Accountant',               '70000000-0000-0000-0000-000000000004', '1 month',  48000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000049', 'CAND-0049', 'Poppy',     'Bennett',      'poppy.bennett@example.com',      '+44 7700 100049', 'London, UK',       'AnalyticsPro',  'BI Analyst',               '70000000-0000-0000-0000-000000000001', '1 month',  52000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000050', 'CAND-0050', 'Theo',      'Collins',      'theo.collins@example.com',       '+44 7700 100050', 'London, UK',       'DevHouse',      'Go Developer',             '70000000-0000-0000-0000-000000000005', '2 months', 72000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000051', 'CAND-0051', 'Freya',     'Morris',       'freya.morris@example.com',       '+44 7700 100051', 'Bristol, UK',      'MediaGroup',    'Social Media Manager',     '70000000-0000-0000-0000-000000000007', '1 month',  36000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000052', 'CAND-0052', 'Caleb',     'Young',        'caleb.young@example.com',        '+44 7700 100052', 'London, UK',       NULL,            'Final Year Student',       '70000000-0000-0000-0000-000000000006', NULL,       23000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000053', 'CAND-0053', 'Imogen',    'Price',        'imogen.price@example.com',       '+44 7700 100053', 'Edinburgh, UK',    'CloudInfra',    'Cloud Architect',          '70000000-0000-0000-0000-000000000001', '3 months', 95000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000054', 'CAND-0054', 'Arthur',    'Ward',         'arthur.ward@example.com',        '+44 7700 100054', 'London, UK',       'MobileDev',     'Android Developer',        '70000000-0000-0000-0000-000000000003', '1 month',  60000, 'GBP', true, now()),
  ('c0000000-0000-0000-0000-000000000055', 'CAND-0055', 'Evie',      'Cox',          'evie.cox@example.com',           '+44 7700 100055', 'Manchester, UK',   'B2BSaaS',       'Customer Success Manager', '70000000-0000-0000-0000-000000000002', '1 month',  38000, 'GBP', true, now());


-- -------------------------------------------------------
-- APPLICATIONS (42) — spread across pipeline stages
-- -------------------------------------------------------
INSERT INTO applications (id, candidate_id, requisition_id, current_stage_id, application_status, application_date, assigned_recruiter_id, source_id) VALUES
  -- Backend Software Engineer (REQ-001): 6 applications
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000005', 'active',   '2026-08-20', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000004', 'active',   '2026-08-22', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000003', 'active',   '2026-08-25', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000031', 'b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000010', 'rejected', '2026-08-18', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000050', 'b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', 'active',   '2026-09-05', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000044', 'b0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-12', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),

  -- Senior Frontend Engineer (REQ-002): 5 applications
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000007', 'active',   '2026-08-05', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000006', 'active',   '2026-08-10', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000046', 'b0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000005', 'active',   '2026-08-12', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000003', 'active',   '2026-08-15', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000028', 'b0000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000010', 'rejected', '2026-08-08', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002'),

  -- Product Manager — Growth (REQ-003): 4 applications
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000008', 'active',   '2026-09-05', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000032', 'b0000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000005', 'active',   '2026-09-08', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000029', 'b0000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000004', 'active',   '2026-09-10', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000049', 'b0000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', 'active',   '2026-09-12', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004'),

  -- UX Designer (REQ-004): 5 applications
  ('d0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000006', 'active',   '2026-08-25', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000005', 'active',   '2026-08-28', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000003', 'active',   '2026-09-01', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000035', 'b0000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000002', 'active',   '2026-09-05', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000039', 'b0000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-10', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003'),

  -- Data Analyst (REQ-005): 3 applications
  ('d0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000004', 'active',   '2026-09-10', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000040', 'b0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000003', 'active',   '2026-09-12', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000026', 'b0000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-14', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000005'),

  -- Engineering Manager (REQ-006): 3 applications
  ('d0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000007', 'active',   '2026-07-25', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000005', 'active',   '2026-08-01', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000053', 'b0000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000004', 'active',   '2026-08-05', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),

  -- Marketing Specialist (REQ-007): 4 applications
  ('d0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000005', 'active',   '2026-09-08', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000003', 'active',   '2026-09-10', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000034', 'b0000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000002', 'active',   '2026-09-12', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000051', 'b0000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-14', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000007'),

  -- SDR (REQ-008): 5 applications
  ('d0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000005', 'active',   '2026-09-01', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000004', 'active',   '2026-09-03', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000033', 'c0000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000003', 'active',   '2026-09-05', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000034', 'c0000000-0000-0000-0000-000000000041', 'b0000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000002', 'active',   '2026-09-08', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000035', 'c0000000-0000-0000-0000-000000000055', 'b0000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-12', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004'),

  -- DevOps Contract (REQ-009): 3 applications
  ('d0000000-0000-0000-0000-000000000036', 'c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000006', 'active',   '2026-09-05', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000037', 'c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000005', 'active',   '2026-09-06', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000038', 'c0000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000003', 'active',   '2026-09-08', 'a0000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001'),

  -- HR Business Partner (REQ-010): 2 applications (draft req — manager prepping)
  ('d0000000-0000-0000-0000-000000000039', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000010', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-10', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000040', 'c0000000-0000-0000-0000-000000000043', 'b0000000-0000-0000-0000-000000000010', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-11', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001'),

  -- Finance Analyst (REQ-011): 2 applications
  ('d0000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000011', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-13', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000048', 'b0000000-0000-0000-0000-000000000011', '80000000-0000-0000-0000-000000000001', 'active',   '2026-09-14', 'a0000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000004');


-- -------------------------------------------------------
-- INTERVIEWS
-- -------------------------------------------------------
INSERT INTO interviews (id, application_id, interview_type, scheduled_start, scheduled_end, location_type, meeting_url, notes, status, created_by) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'recruiter_interview',        '2026-09-18 10:00:00+00', '2026-09-18 10:45:00+00', 'remote', 'https://meet.example.com/int-001', 'Initial screening', 'scheduled', 'a0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000007', 'final_interview',            '2026-09-20 14:00:00+00', '2026-09-20 15:30:00+00', 'in_person', NULL, 'Final round with CTO', 'scheduled', 'a0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000008', 'technical_interview',        '2026-09-19 11:00:00+00', '2026-09-19 12:00:00+00', 'remote', 'https://meet.example.com/int-003', 'React live coding', 'scheduled', 'a0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000009', 'hiring_manager_interview',   '2026-09-17 09:00:00+00', '2026-09-17 09:45:00+00', 'remote', 'https://meet.example.com/int-004', NULL, 'completed', 'a0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000012', 'hiring_manager_interview',   '2026-09-22 15:00:00+00', '2026-09-22 16:00:00+00', 'in_person', NULL, 'Final discussion — offer stage', 'scheduled', 'a0000000-0000-0000-0000-000000000004'),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000016', 'technical_interview',        '2026-09-21 10:00:00+00', '2026-09-21 11:30:00+00', 'remote', 'https://meet.example.com/int-006', 'Design exercise + portfolio review', 'scheduled', 'a0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000024', 'panel_interview',            '2026-09-19 14:00:00+00', '2026-09-19 15:30:00+00', 'in_person', NULL, 'Leadership panel', 'scheduled', 'a0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000036', 'technical_interview',        '2026-09-18 14:00:00+00', '2026-09-18 15:00:00+00', 'remote', 'https://meet.example.com/int-008', 'Infrastructure / Kubernetes deep-dive', 'scheduled', 'a0000000-0000-0000-0000-000000000003');

INSERT INTO interviewers (interview_id, user_id) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007'),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006'),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007'),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005'),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000006'),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007'),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000007');

-- Completed interview scorecard
INSERT INTO interview_scorecards (id, interview_id, reviewer_id, overall_recommendation, overall_score, strengths, concerns, submitted_at, status) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'yes', 4, 'Strong React experience, excellent communication, good system design approach', 'Limited backend experience — may need ramp-up time on Node/Go', now() - interval '1 day', 'submitted');

INSERT INTO interview_feedback (scorecard_id, competency_id, score, comments) VALUES
  ('f0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 4, 'Solid React and TypeScript knowledge'),
  ('f0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', 5, 'Excellent problem decomposition'),
  ('f0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000003', 4, 'Articulate and clear'),
  ('f0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000004', 3, 'Limited cross-team experience mentioned');


-- -------------------------------------------------------
-- OFFERS
-- -------------------------------------------------------
INSERT INTO offers (id, application_id, salary, currency, grade_id, job_title, location_id, employment_type, fte, proposed_start_date, bonus, status, created_by) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000012', 82000, 'GBP', '60000000-0000-0000-0000-000000000004', 'Product Manager — Growth', '30000000-0000-0000-0000-000000000001', 'full_time', 1.00, '2027-01-06', '10% annual target bonus', 'pending_approval', 'a0000000-0000-0000-0000-000000000004');


-- -------------------------------------------------------
-- RECRUITER NOTES
-- -------------------------------------------------------
INSERT INTO recruiter_notes (application_id, created_by, note) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Strong candidate. 3 years experience in Python and Go. Good cultural fit from initial call.'),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'Senior profile — previously at DataFlow leading a team of 4. Salary expectations within range. Moving to final round.'),
  ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000004', 'Tom has excellent product sense. Former PM at ScaleUp with 2x ARR growth. HM very keen — fast-tracking to offer.'),
  ('d0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000003', 'Daniel brings 8 years of EM experience including scaling a platform team from 3 to 15. Panel interview scheduled.'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Rejected — only 6 months experience, below minimum requirement for the role.');


-- -------------------------------------------------------
-- STAGE HISTORY (sample entries)
-- -------------------------------------------------------
INSERT INTO application_stage_history (application_id, from_stage_id, to_stage_id, changed_by, notes) VALUES
  ('d0000000-0000-0000-0000-000000000001', NULL, '80000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Application submitted'),
  ('d0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'CV looks strong'),
  ('d0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Passed CV review'),
  ('d0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Screening call went well'),
  ('d0000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Approved for first interview'),
  ('d0000000-0000-0000-0000-000000000007', NULL, '80000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Application submitted'),
  ('d0000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Fast-tracked — strong senior profile'),
  ('d0000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'Passed Interview 1'),
  ('d0000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'Excellent technical performance — moving to final'),
  ('d0000000-0000-0000-0000-000000000012', NULL, '80000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Application submitted'),
  ('d0000000-0000-0000-0000-000000000012', '80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'Fast-tracked — excellent background'),
  ('d0000000-0000-0000-0000-000000000012', '80000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', 'Moving to offer');


-- -------------------------------------------------------
-- AUDIT LOG (sample entries)
-- -------------------------------------------------------
INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_values) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'requisition.created', 'requisition', 'b0000000-0000-0000-0000-000000000001', '{"title": "Backend Software Engineer"}'),
  ('a0000000-0000-0000-0000-000000000005', 'requisition.status_changed', 'requisition', 'b0000000-0000-0000-0000-000000000001', '{"from": "draft", "to": "open"}'),
  ('a0000000-0000-0000-0000-000000000003', 'application.created', 'application', 'd0000000-0000-0000-0000-000000000001', '{"candidate": "Alex Chen", "requisition": "Backend Software Engineer"}'),
  ('a0000000-0000-0000-0000-000000000003', 'application.stage_changed', 'application', 'd0000000-0000-0000-0000-000000000001', '{"from": "Applied", "to": "CV Review"}'),
  ('a0000000-0000-0000-0000-000000000003', 'application.stage_changed', 'application', 'd0000000-0000-0000-0000-000000000001', '{"from": "CV Review", "to": "Recruiter Screening"}'),
  ('a0000000-0000-0000-0000-000000000004', 'application.created', 'application', 'd0000000-0000-0000-0000-000000000012', '{"candidate": "Tom Anderson", "requisition": "Product Manager — Growth"}'),
  ('a0000000-0000-0000-0000-000000000004', 'offer.created', 'offer', 'f1000000-0000-0000-0000-000000000001', '{"candidate": "Tom Anderson", "salary": 82000}'),
  ('a0000000-0000-0000-0000-000000000003', 'interview.created', 'interview', 'e0000000-0000-0000-0000-000000000001', '{"type": "recruiter_interview", "candidate": "Alex Chen"}');


-- -------------------------------------------------------
-- NOTIFICATIONS
-- -------------------------------------------------------
INSERT INTO notifications (user_id, type, title, message, object_type, object_id) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'interview_scheduled',  'Interview Scheduled',            'Recruiter interview with Alex Chen scheduled for 18 Sep 2026', 'interview', 'e0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000005', 'offer_pending',        'Offer Pending Approval',         'An offer for Tom Anderson (Product Manager — Growth) is awaiting your approval', 'offer', 'f1000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000007', 'feedback_required',    'Feedback Required',              'Please submit your feedback for the interview with Ben Phillips on 17 Sep 2026', 'interview', 'e0000000-0000-0000-0000-000000000004'),
  ('a0000000-0000-0000-0000-000000000003', 'candidate_review',     'New Application',                'Ruby King has applied for the UX Designer position', 'application', 'd0000000-0000-0000-0000-000000000020'),
  ('a0000000-0000-0000-0000-000000000006', 'requisition_update',   'Requisition Approved',           'Your requisition for Data Analyst has been approved', 'requisition', 'b0000000-0000-0000-0000-000000000005'),
  ('a0000000-0000-0000-0000-000000000004', 'stage_change',         'Candidate Progressed',           'Daniel Kim has been moved to Final Interview for Engineering Manager', 'application', 'd0000000-0000-0000-0000-000000000024'),
  ('a0000000-0000-0000-0000-000000000008', 'offer_pending',        'Offer Ready for Review',         'Please review the compensation package for Tom Anderson — Product Manager offer', 'offer', 'f1000000-0000-0000-0000-000000000001');

END $$;
