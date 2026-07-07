-- ============================================================================
-- Anant — enterprise schema
-- Sovereign cognitive memory. Every table is workspace-scoped with hard tenant
-- isolation enforced by Row Level Security. Provenance is first-class.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---- Enums -----------------------------------------------------------------

do $$ begin
  create type provenance_class as enum ('stated', 'inferred', 'aggregated');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_role as enum ('admin', 'member', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type connector_status as enum ('connected', 'syncing', 'error', 'available');
exception when duplicate_object then null; end $$;

do $$ begin
  create type memory_scope as enum ('private', 'shared');
exception when duplicate_object then null; end $$;

-- ---- Profiles --------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- ---- Workspaces ------------------------------------------------------------

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Membership test used by every policy. SECURITY DEFINER avoids RLS recursion.
create or replace function public.is_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

-- ---- Connectors ------------------------------------------------------------

create table if not exists public.connectors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  key text not null,                       -- e.g. 'slack', 'gmail'
  name text not null,
  category text not null,
  status connector_status not null default 'available',
  last_sync timestamptz,
  items integer not null default 0,
  items_target integer,
  inbound_only boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---- Memories --------------------------------------------------------------

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  owner_id uuid references auth.users (id) on delete set null,
  scope memory_scope not null default 'private',
  fact text not null,
  detail text,
  subject text not null,
  category text,
  provenance provenance_class not null,
  provenance_note text,
  source_kind text not null default 'chat',
  source_label text not null,
  source_speaker text,
  source_when text,
  confidence real not null default 0.5 check (confidence >= 0 and confidence <= 1),
  superseded_from text,                    -- quiet supersession history
  superseded_to text,
  forgotten boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_ws_idx on public.memories (workspace_id);
create index if not exists memories_subject_idx on public.memories (workspace_id, subject);

-- ---- Insights (consolidation output) ---------------------------------------

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  kind text not null,                      -- connection | pattern | contradiction
  title text not null,
  body text not null,
  provenance provenance_class not null default 'inferred',
  provenance_note text,
  source_kind text,
  source_label text,
  confidence real not null default 0.5 check (confidence >= 0 and confidence <= 1),
  status text not null default 'open',     -- open | kept | dismissed
  created_at timestamptz not null default now()
);

-- ---- Conversations + messages ----------------------------------------------

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  owner_id uuid references auth.users (id) on delete set null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'anant')),
  text text not null default '',
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_idx on public.messages (conversation_id);

-- ---- Audit log -------------------------------------------------------------

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security — hard tenant isolation
-- ============================================================================

alter table public.profiles           enable row level security;
alter table public.workspaces         enable row level security;
alter table public.workspace_members  enable row level security;
alter table public.connectors         enable row level security;
alter table public.memories           enable row level security;
alter table public.insights           enable row level security;
alter table public.conversations      enable row level security;
alter table public.messages           enable row level security;
alter table public.audit_log          enable row level security;

-- Profiles: a user sees and edits only their own.
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  using (id = auth.uid()) with check (id = auth.uid());

-- Workspaces: members can read; the owner manages.
drop policy if exists workspaces_read on public.workspaces;
create policy workspaces_read on public.workspaces
  for select using (public.is_member(id) or owner_id = auth.uid());

drop policy if exists workspaces_insert on public.workspaces;
create policy workspaces_insert on public.workspaces
  for insert with check (owner_id = auth.uid());

drop policy if exists workspaces_manage on public.workspaces;
create policy workspaces_manage on public.workspaces
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Membership: a member can read the roster; users can add themselves (join).
drop policy if exists members_read on public.workspace_members;
create policy members_read on public.workspace_members
  for select using (public.is_member(workspace_id));

drop policy if exists members_self_insert on public.workspace_members;
create policy members_self_insert on public.workspace_members
  for insert with check (user_id = auth.uid());

-- Generic member-scoped policy applied to the content tables.
do $$
declare t text;
begin
  foreach t in array array['connectors','insights','conversations','audit_log']
  loop
    execute format('drop policy if exists %I_member_all on public.%I;', t, t);
    execute format(
      'create policy %I_member_all on public.%I for all
         using (public.is_member(workspace_id))
         with check (public.is_member(workspace_id));', t, t);
  end loop;
end $$;

-- Memories: members may read shared rows and their own private rows;
-- writes are restricted to the row owner within the workspace.
drop policy if exists memories_read on public.memories;
create policy memories_read on public.memories
  for select using (
    public.is_member(workspace_id)
    and (scope = 'shared' or owner_id = auth.uid())
  );

drop policy if exists memories_write on public.memories;
create policy memories_write on public.memories
  for all
  using (public.is_member(workspace_id) and (owner_id = auth.uid() or owner_id is null))
  with check (public.is_member(workspace_id));

-- Messages inherit access from their conversation's workspace.
drop policy if exists messages_member_all on public.messages;
create policy messages_member_all on public.messages
  for all
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and public.is_member(c.workspace_id)
  ))
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and public.is_member(c.workspace_id)
  ));

-- ============================================================================
-- New-user bootstrap: create a profile + a personal workspace on sign-up.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare ws uuid;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;

  insert into public.workspaces (name, owner_id)
  values (coalesce(new.raw_user_meta_data ->> 'name', 'My') || '''s workspace', new.id)
  returning id into ws;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws, new.id, 'admin');

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
