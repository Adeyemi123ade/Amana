-- ═══════════════════════════════════════════════════════════════
-- PHASE 4 SCHEMA MIGRATIONS
-- ═══════════════════════════════════════════════════════════════

-- 1. Activity logs RLS (table already exists)
drop policy if exists "activity_workspace" on public.activity_logs;
create policy "activity_workspace" on public.activity_logs
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

-- 2. Team invites table
create table if not exists public.team_invites (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  invited_by    uuid not null references auth.users(id) on delete cascade,
  email         text not null,
  role          text not null default 'MEMBER' check (role in ('ADMIN','MEMBER')),
  token         text unique not null default encode(gen_random_bytes(32), 'hex'),
  status        text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','DECLINED','EXPIRED')),
  expires_at    timestamptz not null default now() + interval '7 days',
  created_at    timestamptz not null default now()
);

alter table public.team_invites enable row level security;

drop policy if exists "invite_owner" on public.team_invites;
create policy "invite_owner" on public.team_invites
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

-- Public can read invite by token (for the acceptance page)
drop policy if exists "invite_public_read" on public.team_invites;
create policy "invite_public_read" on public.team_invites
  for select using (true);

-- 3. Workspace members RLS (table already exists)
drop policy if exists "wm_policy" on public.workspace_members;
create policy "wm_policy" on public.workspace_members
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
    or user_id = auth.uid()
  );

select 'Phase 4 schema complete' as result;
