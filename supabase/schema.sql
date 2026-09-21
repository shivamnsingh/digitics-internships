create table if not exists public.applications (
  id text primary key,
  year integer not null,
  seq integer not null,
  email text not null,
  role text not null,
  created timestamptz not null default now(),
  data jsonb not null,
  admin jsonb not null,
  excel text not null default 'pending',
  unique (year, seq)
);
create unique index if not exists applications_email_role_key on public.applications (lower(email), role);
create index if not exists applications_created_idx on public.applications (created desc);
create table if not exists public.settings (k text primary key, v text not null);
alter table public.applications enable row level security;
alter table public.settings enable row level security;
