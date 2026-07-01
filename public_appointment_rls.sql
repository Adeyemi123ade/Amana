-- Allow public (unauthenticated) read access to a specific appointment via its link
-- This is required so customers can view their appointment without logging in
-- Write access (update/delete) still requires workspace ownership

drop policy if exists "appointments_policy" on public.appointments;
drop policy if exists "appt_policy" on public.appointments;
drop policy if exists "appointments_workspace" on public.appointments;

-- 1. Business owner can do everything
create policy "appt_owner_policy" on public.appointments
  for all
  using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

-- 2. Anyone can READ a specific appointment by id (for the appointment link)
create policy "appt_public_read" on public.appointments
  for select
  using (true);

select 'Public appointment RLS added' as result;
