-- Drop ALL existing workspace policies to clear recursion
drop policy if exists "workspace_owner" on public.workspaces;
drop policy if exists "workspace_member_read" on public.workspaces;
drop policy if exists "workspace_access" on public.workspaces;
drop policy if exists "workspace_members_policy" on public.workspace_members;
drop policy if exists "workspace_members_access" on public.workspace_members;
drop policy if exists "customers_policy" on public.customers;
drop policy if exists "customers_workspace" on public.customers;
drop policy if exists "customer_notes_policy" on public.customer_notes;
drop policy if exists "invoices_policy" on public.invoices;
drop policy if exists "invoices_workspace" on public.invoices;
drop policy if exists "appointments_policy" on public.appointments;
drop policy if exists "appointments_workspace" on public.appointments;
drop policy if exists "payments_policy" on public.payments;
drop policy if exists "payments_workspace" on public.payments;
drop policy if exists "automation_policy" on public.automation_rules;
drop policy if exists "activity_policy" on public.activity_logs;

-- Drop recursive function if it exists
drop function if exists public.my_workspace_ids();

-- Disable RLS, recreate clean policies, re-enable
alter table public.workspaces disable row level security;
alter table public.workspace_members disable row level security;
alter table public.customers disable row level security;
alter table public.invoices disable row level security;
alter table public.appointments disable row level security;
alter table public.payments disable row level security;

-- Simple non-recursive policies
alter table public.workspaces enable row level security;
create policy "ws_owner" on public.workspaces
  for all using (created_by = auth.uid());

alter table public.workspace_members enable row level security;
create policy "wm_policy" on public.workspace_members
  for all using (user_id = auth.uid());

alter table public.customers enable row level security;
create policy "cust_policy" on public.customers
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

alter table public.invoices enable row level security;
create policy "inv_policy" on public.invoices
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

alter table public.appointments enable row level security;
create policy "appt_policy" on public.appointments
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

alter table public.payments enable row level security;
create policy "pay_policy" on public.payments
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

select 'RLS fixed successfully' as result;
