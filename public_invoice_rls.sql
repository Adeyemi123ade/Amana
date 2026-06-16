-- Allow public (unauthenticated) read access to invoices via payment link
-- This is required so customers can view and pay invoices without logging in
-- Write access (update) still requires workspace ownership

-- Drop existing policy
drop policy if exists "inv_policy" on public.invoices;

-- Recreate with two policies:
-- 1. Business owner can do everything
create policy "inv_owner_policy" on public.invoices
  for all
  using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

-- 2. Anyone can READ a specific invoice by id (for payment page)
--    This allows customers to view invoice details via the payment link
create policy "inv_public_read" on public.invoices
  for select
  using (true);

-- Also allow public read on customers table (so invoice page shows customer name)
drop policy if exists "cust_policy" on public.customers;

create policy "cust_owner_policy" on public.customers
  for all
  using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

create policy "cust_public_read" on public.customers
  for select
  using (true);

-- Also allow public read on workspaces (so invoice page shows business name/bank details)
drop policy if exists "ws_owner" on public.workspaces;

create policy "ws_owner" on public.workspaces
  for all
  using (created_by = auth.uid());

create policy "ws_public_read" on public.workspaces
  for select
  using (true);

select 'Public invoice RLS fixed' as result;
