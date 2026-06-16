-- ═══════════════════════════════════════════════════════════════
-- PHASE 2 + 3 SCHEMA MIGRATIONS
-- Run in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Add workspace_id to reminder_logs (needed for RLS and queries)
alter table public.reminder_logs
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists recipient_email text,
  add column if not exists error_message text;

-- 2. Add RLS to reminder_logs
create policy if not exists "reminder_logs_workspace" on public.reminder_logs
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

-- 3. Seed default automation rules for all existing workspaces
-- (new workspaces will get these via the app)
insert into public.automation_rules (workspace_id, type, trigger_days, channel, active)
select
  w.id,
  rules.type,
  rules.trigger_days,
  'EMAIL',
  true
from public.workspaces w
cross join (
  values
    ('INVOICE_REMINDER'::text,    2),
    ('INVOICE_REMINDER'::text,    7),
    ('APPOINTMENT_REMINDER'::text, 1),
    ('FOLLOW_UP_REMINDER'::text,  30)
) as rules(type, trigger_days)
where not exists (
  select 1 from public.automation_rules ar
  where ar.workspace_id = w.id and ar.type = rules.type and ar.trigger_days = rules.trigger_days
);

-- 4. Public booking page - workspaces need slug (should already exist)
-- Ensure slug exists and is set
update public.workspaces
set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(id::text, 1, 6)
where slug is null or slug = '';

-- 5. Booking requests table for public booking page
create table if not exists public.booking_requests (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  service         text,
  preferred_date  date not null,
  preferred_time  text not null,
  notes           text,
  status          text not null default 'PENDING' check (status in ('PENDING','APPROVED','DECLINED','CONVERTED')),
  appointment_id  uuid references public.appointments(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.booking_requests enable row level security;

-- Owner can manage all booking requests
create policy "booking_owner" on public.booking_requests
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

-- Public can INSERT booking requests (for the public booking page)
create policy "booking_public_insert" on public.booking_requests
  for insert with check (true);

-- 6. Allow public read on workspaces for booking page
-- (already done in public_invoice_rls.sql but ensure it exists)
create policy if not exists "ws_public_read" on public.workspaces
  for select using (true);

select 'Phase 2+3 schema complete' as result;
