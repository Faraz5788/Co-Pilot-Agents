-- ============================================================================
-- Recruitment Hub — Demo Data
-- ============================================================================
-- Run AFTER creating demo users via the setup script. Replace USER_ID
-- placeholders with actual user IDs.
--
-- This file assumes:
--   1. `supabase/seed/seed.sql` has already been run (roles, departments,
--      locations, cost centres, job profiles, positions, grades, sources,
--      rejection reasons, pipeline stages and competencies all exist).
--   2. The demo users below already exist in `auth.users` AND `public.users`
--      with roles assigned. Run `npx tsx scripts/setup-demo.ts` first (see
--      that script for the full list of demo accounts/passwords) — it
--      prints each account's user id when it finishes.
--
-- Replace the UUID literals below with the real ids `setup-demo.ts` prints
-- before running this file (e.g. via `sed` or a quick find-and-replace):
--
--   ADMIN_USER    = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (Admin User)
--   RECRUITER_1   = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (Sarah Jones)
--   RECRUITER_2   = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (Alex Smith)
--   HM_1          = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (James Wilson - Tech)
--   HM_2          = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (Emma Thompson - HR)
--   HM_3          = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (David Brown - Finance)
--   INTERVIEWER_1 = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (Lisa Chen)
--   HR_REWARD     = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (Rachel Green)
--   REC_ADMIN     = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  (Tom Richards)
--
-- The placeholder values below are deliberately invalid nil UUIDs so the
-- script fails loudly (foreign key violation on `users`) if it is run
-- without first substituting real ids, rather than silently seeding data
-- against the wrong — or a non-existent — user.
-- ============================================================================

do $$
declare
  -- ---------------------------------------------------------------------
  -- Demo user ids — REPLACE THESE with the ids printed by
  -- `npx tsx scripts/setup-demo.ts`.
  -- ---------------------------------------------------------------------
  admin_user    uuid := '00000000-0000-0000-0000-000000000001'; -- Admin User
  recruiter_1   uuid := '00000000-0000-0000-0000-000000000002'; -- Sarah Jones
  recruiter_2   uuid := '00000000-0000-0000-0000-000000000003'; -- Alex Smith
  hm_1          uuid := '00000000-0000-0000-0000-000000000004'; -- James Wilson (Tech)
  hm_2          uuid := '00000000-0000-0000-0000-000000000005'; -- Emma Thompson (HR)
  hm_3          uuid := '00000000-0000-0000-0000-000000000006'; -- David Brown (Finance)
  interviewer_1 uuid := '00000000-0000-0000-0000-000000000007'; -- Lisa Chen
  hr_reward     uuid := '00000000-0000-0000-0000-000000000008'; -- Rachel Green
  rec_admin     uuid := '00000000-0000-0000-0000-000000000009'; -- Tom Richards

  -- ---------------------------------------------------------------------
  -- Name / text pools used to generate realistic, British-focused data
  -- ---------------------------------------------------------------------
  first_names text[] := array[
    'James','Oliver','George','Harry','Jack','Jacob','Noah','Charlie','Thomas','Oscar',
    'William','Alfie','Henry','Leo','Freddie','Archie','Joshua','Ethan','Joseph','Edward',
    'Amelia','Olivia','Isla','Ava','Emily','Sophia','Grace','Lily','Freya','Poppy',
    'Ella','Charlotte','Mia','Evie','Sophie','Ruby','Isabella','Chloe','Daisy','Florence',
    'Alice','Phoebe','Millie','Elsie','Rosie','Jessica','Lucy','Molly','Emma','Hannah'
  ];
  last_names text[] := array[
    'Smith','Jones','Taylor','Brown','Williams','Wilson','Johnson','Davies','Robinson','Wright',
    'Thompson','Evans','Walker','White','Roberts','Green','Hall','Wood','Jackson','Clarke',
    'Patel','Kelly','Baker','Hughes','Turner','Cooper','Ward','Morris','Moore','Cook',
    'Bell','Bailey','Harris','Price','Foster','Griffiths','Powell','Reid','Palmer','Hunt',
    'Watson','Murphy','Knight','Marshall','Chapman','Fisher','Stevens','Fletcher','Reynolds','Barnes'
  ];
  companies text[] := array[
    'Barclays','HSBC','BT Group','Tesco','Vodafone','Rolls-Royce','GSK','Unilever','BAE Systems',
    'AstraZeneca','National Grid','Aviva','Lloyds Banking Group','BP','Shell','Diageo','Reckitt',
    'Centrica','Sainsburys','Marks & Spencer'
  ];
  job_titles text[] := array[
    'Software Engineer','Data Analyst','Product Manager','Marketing Executive','Financial Analyst',
    'Operations Coordinator','HR Advisor','Sales Executive','Business Analyst','Project Manager',
    'Customer Success Manager','UX Designer','Data Scientist','Recruitment Consultant','Finance Manager'
  ];
  cand_locations text[] := array[
    'London','Manchester','Birmingham','Edinburgh','Leeds','Bristol','Glasgow','Liverpool','Dublin',
    'Cardiff','Newcastle','Sheffield','Belfast','Nottingham','Southampton'
  ];
  notice_periods text[] := array['Immediate','2 weeks','1 month','2 months','3 months'];

  -- ---------------------------------------------------------------------
  -- Id lookups / accumulators populated as the script runs
  -- ---------------------------------------------------------------------
  source_ids uuid[];
  rejection_reason_ids uuid[];

  stage_applied uuid;
  stage_cv_review uuid;
  stage_rec_screen uuid;
  stage_hm_review uuid;
  stage_interview1 uuid;
  stage_interview2 uuid;
  stage_final_review uuid;
  stage_offer_approval uuid;
  stage_offer uuid;
  stage_hired uuid;
  stage_rejected uuid;
  stage_withdrawn uuid;

  req_ids uuid[];
  cand_ids uuid[];
  app_ids uuid[];
  interview_ids uuid[];
  offer_ids uuid[];
begin

  -- =========================================================================
  -- Lookups
  -- =========================================================================

  select array_agg(id order by name) into source_ids from sources;
  select array_agg(id order by name) into rejection_reason_ids from rejection_reasons;

  select id into stage_applied        from pipeline_stages where name = 'Applied';
  select id into stage_cv_review      from pipeline_stages where name = 'CV Review';
  select id into stage_rec_screen     from pipeline_stages where name = 'Recruiter Screening';
  select id into stage_hm_review      from pipeline_stages where name = 'Hiring Manager Review';
  select id into stage_interview1     from pipeline_stages where name = 'Interview 1';
  select id into stage_interview2     from pipeline_stages where name = 'Interview 2';
  select id into stage_final_review   from pipeline_stages where name = 'Final Review';
  select id into stage_offer_approval from pipeline_stages where name = 'Offer Approval';
  select id into stage_offer          from pipeline_stages where name = 'Offer';
  select id into stage_hired          from pipeline_stages where name = 'Hired';
  select id into stage_rejected       from pipeline_stages where name = 'Rejected';
  select id into stage_withdrawn      from pipeline_stages where name = 'Withdrawn';

  if stage_applied is null then
    raise exception 'Pipeline stages not found — run supabase/seed/seed.sql first.';
  end if;

  -- =========================================================================
  -- Requisitions (10) — 3 open, 2 draft, 1 pending_approval, 1 approved,
  -- 2 closed, 1 on_hold
  -- =========================================================================

  with ins as (
    insert into requisitions (
      reference_number, title, description, job_profile_id, position_id, department_id,
      cost_centre_id, location_id, hiring_manager_id, lead_recruiter_id, employment_type,
      vacancy_count, grade_id, salary_min, salary_max, currency, reason_for_hire,
      target_start_date, requested_date, opened_date, closed_date, status, created_by
    )
    values
      ('REQ-000001', 'Senior Software Engineer',
        'We are looking for an experienced engineer to join our platform team, working on high-scale distributed systems.',
        (select id from job_profiles where code = 'JP-004'), (select id from positions where position_number = 'P-004'),
        (select id from departments where code = 'ENG'), (select id from cost_centres where code = 'CC-TECH-003'),
        (select id from locations where name = 'London'), hm_1, recruiter_1, 'full_time',
        1, (select id from grades where name = 'Grade 5'), 65000, 85000, 'GBP', 'Team growth',
        current_date + interval '60 days', current_date - interval '35 days', current_date - interval '30 days', null,
        'open', hm_1),
      ('REQ-000002', 'Software Engineer',
        'A great opportunity for a mid-level engineer to work across our core product platform.',
        (select id from job_profiles where code = 'JP-003'), (select id from positions where position_number = 'P-003'),
        (select id from departments where code = 'ENG'), (select id from cost_centres where code = 'CC-TECH-003'),
        (select id from locations where name = 'Manchester'), hm_1, recruiter_2, 'full_time',
        2, (select id from grades where name = 'Grade 3'), 45000, 60000, 'GBP', 'Team growth',
        current_date + interval '45 days', current_date - interval '25 days', current_date - interval '20 days', null,
        'open', hm_1),
      ('REQ-000003', 'Data Analyst',
        'Support the Data & Analytics team with reporting, dashboards and ad-hoc analysis for the business.',
        (select id from job_profiles where code = 'JP-005'), (select id from positions where position_number = 'P-005'),
        (select id from departments where code = 'DATA'), (select id from cost_centres where code = 'CC-TECH-003'),
        (select id from locations where name = 'London'), hm_1, recruiter_1, 'full_time',
        1, (select id from grades where name = 'Grade 2'), 40000, 55000, 'GBP', 'Backfill',
        current_date + interval '30 days', current_date - interval '18 days', current_date - interval '15 days', null,
        'open', hm_1),
      ('REQ-000004', 'BI Developer',
        'Build and maintain BI dashboards and data pipelines for stakeholders across the business.',
        (select id from job_profiles where code = 'JP-006'), (select id from positions where position_number = 'P-006'),
        (select id from departments where code = 'DATA'), (select id from cost_centres where code = 'CC-TECH-003'),
        (select id from locations where name = 'Edinburgh'), hm_1, recruiter_2, 'full_time',
        1, (select id from grades where name = 'Grade 3'), 42000, 58000, 'GBP', 'New headcount',
        current_date + interval '75 days', current_date - interval '5 days', null, null,
        'draft', hm_1),
      ('REQ-000005', 'HR Business Partner',
        'Partner with senior stakeholders across the business on all people matters.',
        (select id from job_profiles where code = 'JP-002'), (select id from positions where position_number = 'P-002'),
        (select id from departments where code = 'HR'), (select id from cost_centres where code = 'CC-HR-001'),
        (select id from locations where name = 'London'), hm_2, recruiter_1, 'full_time',
        1, (select id from grades where name = 'Grade 4'), 55000, 70000, 'GBP', 'New headcount',
        current_date + interval '90 days', current_date - interval '3 days', null, null,
        'draft', hm_2),
      ('REQ-000006', 'HR Analyst',
        'Support the HR team with day-to-day operations, reporting and employee queries.',
        (select id from job_profiles where code = 'JP-001'), (select id from positions where position_number = 'P-001'),
        (select id from departments where code = 'HR'), (select id from cost_centres where code = 'CC-HR-001'),
        (select id from locations where name = 'Birmingham'), hm_2, recruiter_2, 'full_time',
        1, (select id from grades where name = 'Grade 1'), 28000, 36000, 'GBP', 'Backfill',
        current_date + interval '45 days', current_date - interval '4 days', null, null,
        'pending_approval', hm_2),
      ('REQ-000007', 'Marketing Manager',
        'Lead campaign strategy and execution across our brand and demand generation channels.',
        (select id from job_profiles where code = 'JP-008'), (select id from positions where position_number = 'P-008'),
        (select id from departments where code = 'MKT'), (select id from cost_centres where code = 'CC-MKT-004'),
        (select id from locations where name = 'London'), hm_2, recruiter_1, 'full_time',
        1, (select id from grades where name = 'Grade 4'), 50000, 65000, 'GBP', 'New headcount',
        current_date + interval '60 days', current_date - interval '14 days', null, null,
        'approved', hm_2),
      ('REQ-000008', 'Finance Analyst',
        'Support monthly reporting, forecasting and budget analysis for the Finance function.',
        (select id from job_profiles where code = 'JP-009'), (select id from positions where position_number = 'P-009'),
        (select id from departments where code = 'FIN'), (select id from cost_centres where code = 'CC-FIN-002'),
        (select id from locations where name = 'London'), hm_3, recruiter_2, 'full_time',
        1, (select id from grades where name = 'Grade 2'), 35000, 48000, 'GBP', 'Backfill',
        current_date - interval '10 days', current_date - interval '90 days', current_date - interval '85 days',
        current_date - interval '10 days', 'closed', hm_3),
      ('REQ-000009', 'Operations Manager',
        'Own operational excellence initiatives across our fulfilment and logistics functions.',
        (select id from job_profiles where code = 'JP-010'), (select id from positions where position_number = 'P-010'),
        (select id from departments where code = 'OPS'), (select id from cost_centres where code = 'CC-OPS-005'),
        (select id from locations where name = 'Manchester'), hm_3, recruiter_1, 'full_time',
        1, (select id from grades where name = 'Grade 4'), 48000, 62000, 'GBP', 'New headcount',
        current_date - interval '5 days', current_date - interval '70 days', current_date - interval '65 days',
        current_date - interval '5 days', 'closed', hm_3),
      ('REQ-000010', 'Sales Executive',
        'Drive new business growth across our EMEA customer base.',
        (select id from job_profiles where code = 'JP-011'), null,
        (select id from departments where code = 'SALES'), (select id from cost_centres where code = 'CC-SALES-006'),
        (select id from locations where name = 'Dublin'), hm_3, recruiter_2, 'full_time',
        2, (select id from grades where name = 'Grade 2'), 30000, 45000, 'GBP', 'Team growth',
        current_date + interval '40 days', current_date - interval '20 days', current_date - interval '18 days', null,
        'on_hold', hm_3)
    returning id, reference_number
  )
  select array_agg(id order by reference_number) into req_ids from ins;

  -- =========================================================================
  -- Candidates (50)
  -- =========================================================================

  with ins as (
    insert into candidates (
      candidate_number, first_name, last_name, email, phone, location, linkedin_url,
      source_id, current_employer, current_job_title, notice_period, salary_expectation,
      currency, right_to_work_status, consent_given, consent_date, gdpr_retention_date
    )
    select
      'CND-' || lpad(i::text, 6, '0'),
      first_names[i],
      last_names[i],
      lower(first_names[i]) || '.' || lower(last_names[i]) || i || '@example.co.uk',
      '+44 7' || lpad(((100000000 + i * 137) % 1000000000)::text, 9, '0'),
      cand_locations[1 + mod(i - 1, array_length(cand_locations, 1))],
      'https://linkedin.com/in/' || lower(first_names[i]) || lower(last_names[i]) || i,
      source_ids[1 + mod(i - 1, array_length(source_ids, 1))],
      companies[1 + mod(i - 1, array_length(companies, 1))],
      job_titles[1 + mod(i - 1, array_length(job_titles, 1))],
      notice_periods[1 + mod(i - 1, array_length(notice_periods, 1))],
      (28000 + mod(i * 977, 60000))::numeric,
      'GBP',
      case when mod(i, 9) = 0 then 'Requires Sponsorship' else 'UK/EU Citizen' end,
      true,
      now() - ((i * 3) || ' days')::interval,
      current_date + interval '3 years'
    from generate_series(1, 50) as i
    returning id, candidate_number
  )
  select array_agg(id order by candidate_number) into cand_ids from ins;

  -- =========================================================================
  -- Applications (80) — 48 active, 16 rejected, 8 hired, 8 withdrawn
  -- =========================================================================

  with base as (
    select
      gs as ord,
      case when gs <= 50 then cand_ids[gs] else cand_ids[gs - 50] end as candidate_id,
      case
        when gs <= 50 then req_ids[1 + mod(gs - 1, 10)]
        else req_ids[1 + mod((gs - 50 - 1) + 4, 10)]
      end as requisition_id
    from generate_series(1, 80) as gs
  ),
  staged as (
    select
      base.*,
      case mod(ord, 10)
        when 6 then stage_rejected
        when 7 then stage_rejected
        when 8 then stage_hired
        when 9 then stage_withdrawn
        else (array[stage_cv_review, stage_rec_screen, stage_hm_review, stage_interview1, stage_interview2, stage_offer])[1 + mod(ord, 6)]
      end as current_stage_id,
      case mod(ord, 10)
        when 6 then 'rejected'::application_status
        when 7 then 'rejected'::application_status
        when 8 then 'hired'::application_status
        when 9 then 'withdrawn'::application_status
        else 'active'::application_status
      end as application_status,
      case
        when mod(ord, 10) in (6, 7) then rejection_reason_ids[1 + mod(ord, array_length(rejection_reason_ids, 1))]
        else null
      end as rejection_reason_id
    from base
  ),
  ins as (
    insert into applications (
      candidate_id, requisition_id, current_stage_id, application_status, application_date,
      assigned_recruiter_id, source_id, salary_expectation, notice_period, rejection_reason_id, created_at
    )
    select
      candidate_id, requisition_id, current_stage_id, application_status,
      (current_date - ((ord * 2) || ' days')::interval)::date,
      case when mod(ord, 2) = 0 then recruiter_1 else recruiter_2 end,
      source_ids[1 + mod(ord - 1, array_length(source_ids, 1))],
      (30000 + mod(ord * 911, 55000))::numeric,
      notice_periods[1 + mod(ord - 1, array_length(notice_periods, 1))],
      rejection_reason_id,
      now() - ((ord * 2) || ' days')::interval
    from staged
    returning id, application_date
  )
  -- `application_date` is `current_date - (ord * 2 days)`, so it decreases
  -- strictly as `ord` increases with no ties — ordering by it descending
  -- reconstructs ascending `ord` order (app_ids[1] is ord=1, ..., app_ids[80]
  -- is ord=80) without needing to return the non-column `ord` value itself.
  select array_agg(id order by application_date desc) into app_ids from ins;

  -- =========================================================================
  -- Application stage history — two hops per application: Applied, then the
  -- application's current stage.
  -- =========================================================================

  insert into application_stage_history (application_id, from_stage_id, to_stage_id, changed_by, changed_at, notes)
  select a.id, null, stage_applied, a.assigned_recruiter_id, a.created_at, 'Application received'
  from applications a
  where a.id = any (app_ids)
  union all
  select
    a.id, stage_applied, a.current_stage_id, a.assigned_recruiter_id, a.created_at + interval '3 days',
    case a.application_status
      when 'rejected' then 'Candidate rejected'
      when 'hired' then 'Candidate hired'
      when 'withdrawn' then 'Candidate withdrew application'
      else 'Progressed to next stage'
    end
  from applications a
  where a.id = any (app_ids);

  -- =========================================================================
  -- Offers (5) — draft, pending_approval, approved, accepted, declined
  -- =========================================================================

  update applications set current_stage_id = stage_offer, application_status = 'active'
    where id = app_ids[1];
  update applications set current_stage_id = stage_offer_approval, application_status = 'active'
    where id = app_ids[2];
  update applications set current_stage_id = stage_offer, application_status = 'active'
    where id = app_ids[3];
  update applications set current_stage_id = stage_hired, application_status = 'hired'
    where id = app_ids[4];
  update applications set current_stage_id = stage_rejected, application_status = 'rejected',
    rejection_reason_id = (select id from rejection_reasons where name = 'Salary expectations too high')
    where id = app_ids[5];

  insert into application_stage_history (application_id, from_stage_id, to_stage_id, changed_by, changed_at, notes)
  values
    (app_ids[1], stage_hm_review, stage_offer, recruiter_1, now() - interval '5 days', 'Offer stage reached'),
    (app_ids[2], stage_offer, stage_offer_approval, recruiter_2, now() - interval '4 days', 'Awaiting offer approval'),
    (app_ids[3], stage_hm_review, stage_offer, recruiter_1, now() - interval '6 days', 'Offer stage reached'),
    (app_ids[4], stage_offer, stage_hired, recruiter_2, now() - interval '2 days', 'Candidate accepted offer'),
    (app_ids[5], stage_offer, stage_rejected, recruiter_1, now() - interval '1 days', 'Candidate declined offer — salary expectations');

  with targets as (
    select app_id, ord from unnest(app_ids[1:5]) with ordinality as t(app_id, ord)
  ),
  ins as (
    insert into offers (
      application_id, salary, currency, grade_id, job_title, location_id, employment_type,
      proposed_start_date, bonus, status, created_by
    )
    select
      t.app_id,
      (array[78000, 52000, 47000, 50000, 60000])[t.ord],
      'GBP',
      r.grade_id,
      r.title,
      r.location_id,
      r.employment_type,
      current_date + interval '30 days',
      case when t.ord = 4 then '5% signing bonus' else null end,
      (array['draft', 'pending_approval', 'approved', 'accepted', 'declined'])[t.ord]::offer_status,
      case when mod(t.ord, 2) = 1 then recruiter_1 else recruiter_2 end
    from targets t
    join applications a on a.id = t.app_id
    join requisitions r on r.id = a.requisition_id
    returning id, application_id
  )
  select array_agg(ins.id order by t.ord)
  into offer_ids
  from ins
  join targets t on t.app_id = ins.application_id;

  -- =========================================================================
  -- Approvals (3)
  -- =========================================================================

  insert into approvals (object_type, object_id, approval_type, approver_id, status, requested_at, responded_at, comments)
  values
    ('requisition', req_ids[6], 'requisition_approval', rec_admin, 'pending', now() - interval '3 days', null, null),
    ('requisition', req_ids[7], 'requisition_approval', rec_admin, 'approved', now() - interval '12 days',
      now() - interval '11 days', 'Approved — headcount confirmed for this financial year'),
    ('offer', offer_ids[2], 'offer_approval', hr_reward, 'pending', now() - interval '1 days', null, null);

  -- =========================================================================
  -- Interviews (15) — 8 completed, 4 confirmed, 3 scheduled
  -- =========================================================================

  update applications a
  set current_stage_id = case when mod(t.ord, 2) = 0 then stage_interview2 else stage_interview1 end,
      application_status = 'active'
  from unnest(app_ids[6:20]) with ordinality as t(app_id, ord)
  where a.id = t.app_id;

  with targets as (
    select app_id, ord from unnest(app_ids[6:20]) with ordinality as t(app_id, ord)
  ),
  ins as (
    insert into interviews (
      application_id, interview_type, scheduled_start, scheduled_end, location_type, location,
      meeting_url, status, created_by
    )
    select
      t.app_id,
      (array['telephone_screen','recruiter_interview','hiring_manager_interview','technical_interview','panel_interview','final_interview']::interview_type[])[1 + mod(t.ord - 1, 6)],
      case
        when t.ord <= 8 then now() - ((9 - t.ord) || ' days')::interval
        when t.ord <= 12 then now() + ((t.ord - 8) || ' days')::interval
        else now() + (((t.ord - 12) * 2) || ' days')::interval
      end,
      case
        when t.ord <= 8 then now() - ((9 - t.ord) || ' days')::interval + interval '45 minutes'
        when t.ord <= 12 then now() + ((t.ord - 8) || ' days')::interval + interval '45 minutes'
        else now() + (((t.ord - 12) * 2) || ' days')::interval + interval '45 minutes'
      end,
      (array['remote','remote','in_person','hybrid']::location_type[])[1 + mod(t.ord - 1, 4)],
      case when mod(t.ord, 4) = 2 then 'Head Office, London' else null end,
      case when mod(t.ord, 4) <> 2 then 'https://meet.example.com/interview-' || t.ord else null end,
      (case when t.ord <= 8 then 'completed' when t.ord <= 12 then 'confirmed' else 'scheduled' end)::interview_status,
      case when mod(t.ord, 2) = 0 then recruiter_1 else recruiter_2 end
    from targets t
    returning id, application_id
  )
  select array_agg(ins.id order by t.ord)
  into interview_ids
  from ins
  join targets t on t.app_id = ins.application_id;

  -- =========================================================================
  -- Interviewer assignments
  -- =========================================================================

  with targets as (
    select interview_id, ord from unnest(interview_ids) with ordinality as t(interview_id, ord)
  ),
  primaries as (
    select interview_id, (array[interviewer_1, hm_1, hm_2, hm_3])[1 + mod(ord - 1, 4)] as user_id
    from targets
  )
  insert into interviewers (interview_id, user_id)
  select interview_id, user_id from primaries
  union
  select t.interview_id, interviewer_1
  from targets t
  where mod(t.ord, 2) = 1 and (array[interviewer_1, hm_1, hm_2, hm_3])[1 + mod(t.ord - 1, 4)] <> interviewer_1;

  -- =========================================================================
  -- Interview scorecards (8, for the completed interviews)
  -- =========================================================================

  with targets as (
    select interview_id, ord from unnest(interview_ids[1:8]) with ordinality as t(interview_id, ord)
  )
  insert into interview_scorecards (interview_id, reviewer_id, overall_recommendation, overall_score, strengths, concerns, submitted_at, status)
  select
    t.interview_id,
    (array[interviewer_1, hm_1, hm_2, hm_3])[1 + mod(t.ord - 1, 4)],
    (array['strong_yes','yes','yes','mixed','yes','strong_yes','mixed','no']::recommendation_type[])[t.ord],
    (array[5, 4, 4, 3, 4, 5, 3, 2])[t.ord],
    (array[
      'Strong technical depth and clear communication throughout.',
      'Solid experience, answered questions confidently.',
      'Good cultural fit, asked thoughtful questions.',
      'Reasonable answers but lacked some depth on system design.',
      'Very personable, handled scenario questions well.',
      'Excellent problem-solving approach, would hire immediately.',
      'Adequate but not standout; met the bar.',
      'Struggled with core technical questions.'
    ])[t.ord],
    (array[
      null,
      'Limited exposure to our specific tech stack.',
      null,
      'Would benefit from more structured problem-solving.',
      null,
      null,
      'Slightly light on leadership experience.',
      'Communication was unclear at times.'
    ])[t.ord],
    now() - ((9 - t.ord) || ' days')::interval,
    'submitted'
  from targets t;

  -- =========================================================================
  -- Recruiter notes (20)
  -- =========================================================================

  with targets as (
    select app_id, ord from unnest(app_ids[1:20]) with ordinality as t(app_id, ord)
  ),
  note_templates as (
    select note, ord from unnest(array[
      'Strong CV, moving forward to screening call.',
      'Spoke with candidate — enthusiastic and available to start within a month.',
      'Candidate has relevant industry experience, worth fast-tracking.',
      'Referred by an internal employee, good initial impression.',
      'Salary expectations are within budget range.',
      'Candidate requested to reschedule the screening call.',
      'Great cultural fit based on initial conversation.',
      'Some concerns about notice period length.',
      'Candidate is also interviewing elsewhere — keep pace high.',
      'Left a voicemail, awaiting call back.',
      'Confirmed right to work in the UK.',
      'Candidate very engaged, asked great questions about the team.',
      'Hiring manager keen to move quickly on this one.',
      'Candidate available for interview next week.',
      'Follow-up email sent regarding outstanding documents.',
      'Candidate mentioned a competing offer with a tight deadline.',
      'Positive feedback from initial phone screen.',
      'Candidate would prefer a hybrid working arrangement.',
      'Checked references — all positive.',
      'Candidate confirmed interest in proceeding to next stage.'
    ]) with ordinality as n(note, ord)
  )
  insert into recruiter_notes (application_id, created_by, note, created_at)
  select
    t.app_id,
    case when mod(t.ord, 2) = 0 then recruiter_1 else recruiter_2 end,
    n.note,
    now() - (t.ord || ' days')::interval
  from targets t
  join note_templates n on n.ord = t.ord;

  -- =========================================================================
  -- Notifications (30)
  -- =========================================================================

  insert into notifications (user_id, type, title, message, object_type, object_id, read_at, created_at)
  select
    (array[recruiter_1, recruiter_2, hm_1, hm_2, hm_3, interviewer_1, hr_reward, admin_user])[1 + mod(i - 1, 8)],
    (array['candidate_review','interview_scheduled','feedback_required','offer_pending','stage_change','requisition_update','general']::notification_type[])[1 + mod(i - 1, 7)],
    (array[
      'New candidate to review',
      'Interview scheduled',
      'Feedback required',
      'Offer awaiting approval',
      'Application moved stage',
      'Requisition updated',
      'System notification'
    ])[1 + mod(i - 1, 7)],
    (array[
      'A new candidate has entered your review queue.',
      'An interview has been scheduled on your calendar.',
      'Please submit your interview feedback.',
      'An offer is awaiting your approval.',
      'An application has moved to a new pipeline stage.',
      'A requisition you follow has been updated.',
      'You have a new notification from Recruitment Hub.'
    ])[1 + mod(i - 1, 7)],
    case mod(i - 1, 3) when 0 then 'application' when 1 then 'interview' else 'offer' end,
    case mod(i - 1, 3)
      when 0 then app_ids[1 + mod(i - 1, array_length(app_ids, 1))]
      when 1 then interview_ids[1 + mod(i - 1, array_length(interview_ids, 1))]
      else offer_ids[1 + mod(i - 1, array_length(offer_ids, 1))]
    end,
    case when mod(i, 2) = 0 then now() - (i || ' hours')::interval else null end,
    now() - ((i * 4) || ' hours')::interval
  from generate_series(1, 30) as i;

  -- =========================================================================
  -- Audit log (50)
  -- =========================================================================

  insert into audit_log (user_id, action, entity_type, entity_id, old_values, new_values, created_at)
  select
    (array[admin_user, recruiter_1, recruiter_2, hm_1, hm_2, hm_3, rec_admin])[1 + mod(i - 1, 7)],
    (array[
      'requisition.created','requisition.updated','requisition.approved',
      'candidate.created','application.created','application.stage_changed',
      'interview.scheduled','interview.completed','offer.created','offer.sent',
      'user_role.assigned','pipeline_stage.updated','source.created','rejection_reason.created'
    ])[1 + mod(i - 1, 14)],
    (array[
      'requisition','requisition','requisition',
      'candidate','application','application',
      'interview','interview','offer','offer',
      'user','pipeline_stage','source','rejection_reason'
    ])[1 + mod(i - 1, 14)],
    case mod(i - 1, 14)
      when 0 then req_ids[1 + mod(i, 10)]
      when 1 then req_ids[1 + mod(i, 10)]
      when 2 then req_ids[1 + mod(i, 10)]
      when 3 then cand_ids[1 + mod(i, 50)]
      when 4 then app_ids[1 + mod(i, 80)]
      when 5 then app_ids[1 + mod(i, 80)]
      when 6 then interview_ids[1 + mod(i, 15)]
      when 7 then interview_ids[1 + mod(i, 15)]
      when 8 then offer_ids[1 + mod(i, 5)]
      when 9 then offer_ids[1 + mod(i, 5)]
      else null
    end,
    case when mod(i, 3) = 0 then jsonb_build_object('status', 'draft') else null end,
    jsonb_build_object('updated_at', (now() - (i || ' hours')::interval)::text),
    now() - ((i * 6) || ' hours')::interval
  from generate_series(1, 50) as i;

  -- =========================================================================
  -- Workday mapping (10) — one row per department, showing how a future
  -- Workday sync would map internal records to Workday IDs
  -- =========================================================================

  insert into workday_mapping (object_type, internal_id, workday_id, workday_descriptor, last_synced_at)
  select
    'department',
    id,
    'WD-DEPT-' || lpad((row_number() over (order by name))::text, 4, '0'),
    name || ' (Workday Supervisory Organization)',
    now() - interval '1 day'
  from departments;

  raise notice 'Demo data seeded: % requisitions, % candidates, % applications, % interviews, % offers',
    array_length(req_ids, 1), array_length(cand_ids, 1), array_length(app_ids, 1),
    array_length(interview_ids, 1), array_length(offer_ids, 1);

end $$ language plpgsql;

-- ============================================================================
-- End of demo data
-- ============================================================================
