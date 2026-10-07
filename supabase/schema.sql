-- =============================================================================
-- Project Tracker — database schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to run more than once (all statements are idempotent).
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto (enabled by default on Supabase).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'todo'
                 check (status in ('todo', 'in_progress', 'done')),
  priority     text not null default 'medium'
                 check (priority in ('low', 'medium', 'high')),
  due_date     date,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_status_idx on public.tasks (status);

-- -----------------------------------------------------------------------------
-- Row Level Security
--
-- !!! DEMO ONLY !!!
-- The app has no authentication yet, so we allow the public "anon" role full
-- read/write access to these two tables. ANYONE with your anon key (which is
-- shipped to the browser) can read and modify all rows.
--
-- When you add authentication later, delete these two policies and replace them
-- with owner-scoped ones, for example:
--   using (auth.uid() = owner_id)
-- -----------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "demo full access - projects" on public.projects;
create policy "demo full access - projects"
  on public.projects for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "demo full access - tasks" on public.tasks;
create policy "demo full access - tasks"
  on public.tasks for all
  to anon, authenticated
  using (true)
  with check (true);

-- Table-level privileges (Supabase normally grants these by default).
grant usage on schema public to anon, authenticated;
grant all on public.projects to anon, authenticated;
grant all on public.tasks to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Realtime
-- Adds the two tables to the realtime publication so every open browser tab
-- receives live inserts/updates/deletes.
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'projects'
  ) then
    alter publication supabase_realtime add table public.projects;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end
$$;
