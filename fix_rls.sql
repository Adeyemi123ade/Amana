-- Fix infinite recursion in workspaces RLS policy

alter table public.workspaces disable row level security;
alter table public.workspace_members disable row level security;
alter table public.customers disable row level security;
alter table public.invoices disable row level security;
alter table public.appointments disable row level security;
alter table public.payments disable row level security;
alter table public.automation_rules disable row level security;
alter table public.activity_logs disable row level security;
alter table public.customer_notes disable row level security;
alter table public.reminder_logs disable row level security;

drop policy if exists "workspace_access" on public.workspaces;
drop policy if exists "workspace_member_read" on public.workspaces;
drop policy if exists "workspace_owner" on public.workspaces;
drop policy if exists "workspace_members_access" on public.workspace_members;
drop policy if exists "workspace_members_policy" on public.workspace_members;
drop policy if exists "customers_workspace" on public.customers;
drop policy if exists "customers_policy" on public.customers;
drop policy if exists "customer_notes_workspace" on public.customer_notes;
drop policy if exists "customer_notes_policy" on public.customer_notes;
drop policy if exists "invoices_workspace" on public.invoices;
drop policy if exists "invoices_policy" on public.invoices;
drop policy if exists "appointments_workspace" on public.appointments;
drop policy if exists "appointments_policy" on public.appointments;
drop policy if exists "payments_workspace" on public.payments;
drop policy if exists "payments_policy" on public.payments;
drop policy if exists "automation_workspace" on public.automation_rules;
drop policy if exists "automation_policy" on public.automation_rules;
drop policy if exists "activity_workspace" on public.activity_logs;
drop policy if exists "activity_policy" on public.activity_logs;

drop function if exists public.my_workspace_ids();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.automation_rules enable row level security;
alter table public.activity_logs enable row level security;
alter table public.customer_notes enable row level security;

create policy "workspace_owner" on public.workspaces
  for all using (created_by = auth.uid());

create policy "workspace_member_read" on public.workspaces
  for select using (
    id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

create policy "workspace_members_policy" on public.workspace_members
  for all using (
    user_id = auth.uid()
    or workspace_id in (select id from public.workspaces where created_by = auth.uid())
  );

create policy "customers_policy" on public.customers
  for all using (
    workspace_id in (select id from public.workspaces where created_by = auth.uid())
  );

create policy "customer_notes_policy" on public.customer_notes
  for all using (
    customer_id in (
      select id from public.customers
      where workspace_id in (select id from public.workspaces where created_by = auth.uid())
    )
  );

create policy "invoices_policy" on public.invoices
  for all using (
    workspace_id in (select id from public.workspaces where created_by = auth.uid())
  );

create policy "appointments_policy" on public.appointments
  for all using (
    workspace_id in (select id from public.workspaces where created_by = auth.uid())
  );

create policy "payments_policy" on public.payments
  for all using (
    workspace_id in (select id from public.workspaces where created_by = auth.uid())
  );

create policy "automation_policy" on public.automation_rules
  for all using (
    workspace_id in (select id from public.workspaces where created_by = auth.uid())
  );

create policy "activity_policy" on public.activity_logs
  for all using (
    workspace_id in (select id from public.workspaces where created_by = auth.uid())
  );
