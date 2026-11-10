-- GCD+ core relational model (PostgreSQL)
create extension if not exists "pgcrypto";

create type user_role as enum ('doctorant', 'directeur', 'ced', 'pole');
create type validation_status as enum ('pending', 'approved', 'rejected', 'changes_requested');
create type candidate_status as enum ('received', 'interview', 'scored', 'accepted', 'rejected');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role user_role not null,
  cne text unique,
  cin text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table laboratories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  ced_name text not null
);

create table research_subjects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  abstract text,
  laboratory_id uuid not null references laboratories(id),
  doctoral_student_id uuid not null references users(id),
  current_step smallint not null default 0 check (current_step between 0 and 2),
  status validation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subject_validations (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references research_subjects(id) on delete cascade,
  step smallint not null check (step between 0 and 2),
  reviewer_id uuid not null references users(id),
  status validation_status not null default 'pending',
  comment text,
  decided_at timestamptz,
  unique(subject_id, step)
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references users(id),
  subject_id uuid references research_subjects(id),
  campaign_year text not null,
  status candidate_status not null default 'received',
  score numeric(5,2),
  interview_at timestamptz,
  created_at timestamptz not null default now()
);

create table re_registration_workflows (
  id uuid primary key default gen_random_uuid(),
  doctoral_student_id uuid not null references users(id),
  academic_year text not null,
  step smallint not null default 1 check (step between 1 and 4),
  report jsonb not null default '{}'::jsonb,
  supervisor_signed_at timestamptz,
  physical_received_at timestamptz,
  receipt_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index research_subjects_search_idx on research_subjects using gin (to_tsvector('french', title || ' ' || coalesce(abstract, '')));
create index users_cne_idx on users(cne);
create index applications_status_idx on applications(status);
