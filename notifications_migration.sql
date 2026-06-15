-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  title text not null,
  description text not null,
  type text not null default 'general',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
create policy "notif_policy" on public.notifications
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

select 'Notifications table created' as result;
