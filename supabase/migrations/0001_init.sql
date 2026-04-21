-- Apollo × crust_skillz initial schema
-- Tables: employers, jobs, resumes, applications, verification_reports
-- Plus: private storage bucket "resumes"

-- ──────────────────────────────────────────────────────────────────────────
-- employers (mirrors auth.users)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.employers (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  contact_name text,
  slug text unique not null,
  created_at timestamptz not null default now()
);

alter table public.employers enable row level security;

drop policy if exists "employers self select" on public.employers;
create policy "employers self select" on public.employers
  for select to authenticated using (id = auth.uid());

drop policy if exists "employers self update" on public.employers;
create policy "employers self update" on public.employers
  for update to authenticated using (id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────────
-- jobs
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  slug text not null,
  title text not null,
  category text not null,
  description text not null,
  skills_required jsonb not null,
  created_at timestamptz not null default now(),
  unique (employer_id, slug)
);

create index if not exists jobs_employer_id_idx on public.jobs(employer_id);

alter table public.jobs enable row level security;

drop policy if exists "jobs public select" on public.jobs;
create policy "jobs public select" on public.jobs
  for select to anon, authenticated using (true);

drop policy if exists "jobs owner write" on public.jobs;
create policy "jobs owner write" on public.jobs
  for all to authenticated
  using (employer_id = auth.uid())
  with check (employer_id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────────
-- resumes
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  filename text not null,
  bytes int not null,
  extracted_text text,
  extracted_skills jsonb,
  claims jsonb,
  candidate_name text not null,
  candidate_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists resumes_candidate_email_idx on public.resumes(candidate_email);

alter table public.resumes enable row level security;
-- No public policies — access happens via service-role server routes.

-- ──────────────────────────────────────────────────────────────────────────
-- applications
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','verifying','verified','failed')),
  match_score int,
  match_snapshot jsonb,
  created_at timestamptz not null default now(),
  unique (resume_id, job_id)
);

create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_resume_id_idx on public.applications(resume_id);

alter table public.applications enable row level security;
-- Employer read policy: only applications whose job they own.
drop policy if exists "applications employer read" on public.applications;
create policy "applications employer read" on public.applications
  for select to authenticated
  using (exists (
    select 1 from public.jobs j
    where j.id = applications.job_id and j.employer_id = auth.uid()
  ));

-- Writes happen server-side via service role; no write policy needed.

-- ──────────────────────────────────────────────────────────────────────────
-- verification_reports
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.verification_reports (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete cascade,
  run_id text not null,
  report jsonb not null,
  lane_results jsonb not null,
  claims jsonb not null,
  trust_score int not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.verification_reports enable row level security;
drop policy if exists "reports employer read" on public.verification_reports;
create policy "reports employer read" on public.verification_reports
  for select to authenticated
  using (exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.id = verification_reports.application_id and j.employer_id = auth.uid()
  ));

-- ──────────────────────────────────────────────────────────────────────────
-- Storage bucket for resume PDFs (private)
-- ──────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- No storage policies for anon/authenticated — all reads/writes go through
-- service-role server routes that sign URLs or stream bytes.
