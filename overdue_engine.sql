-- ═══════════════════════════════════════════════════════════════
-- AMANA OVERDUE ENGINE
-- Run this in Supabase SQL editor to create the scheduled function
-- This marks overdue invoices daily and creates notifications
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Create the function that marks overdue invoices
create or replace function public.mark_overdue_invoices()
returns json
language plpgsql
security definer
as $$
declare
  updated_count int := 0;
  rec record;
begin
  -- Find all invoices that are UNPAID and past due date
  for rec in
    select
      i.id,
      i.workspace_id,
      i.invoice_number,
      i.total_amount,
      i.due_date,
      w.currency
    from public.invoices i
    join public.workspaces w on w.id = i.workspace_id
    where i.status = 'UNPAID'
      and i.due_date < current_date
  loop
    -- Mark as OVERDUE
    update public.invoices
    set status = 'OVERDUE', updated_at = now()
    where id = rec.id;

    -- Create notification for business owner
    insert into public.notifications (
      workspace_id, title, description, type, read, link
    ) values (
      rec.workspace_id,
      'Invoice Overdue',
      'Invoice ' || rec.invoice_number || ' is overdue — payment not received by due date.',
      'overdue',
      false,
      '/dashboard/invoices/' || rec.id::text
    );

    updated_count := updated_count + 1;
  end loop;

  return json_build_object(
    'updated', updated_count,
    'ran_at', now()
  );
end;
$$;

-- Step 2: Grant execution permission
grant execute on function public.mark_overdue_invoices() to service_role;

-- Step 3: Test it immediately (safe to run — only marks truly overdue invoices)
select public.mark_overdue_invoices();

-- ═══════════════════════════════════════════════════════════════
-- Step 4: Schedule it to run daily at 1:00 AM WAT (00:00 UTC)
-- Requires pg_cron extension — enable it in Supabase Dashboard:
-- Database → Extensions → search "pg_cron" → Enable
-- ═══════════════════════════════════════════════════════════════

-- After enabling pg_cron, run this:
-- select cron.schedule(
--   'mark-overdue-invoices',
--   '0 0 * * *',
--   $$ select public.mark_overdue_invoices() $$
-- );

-- To verify the cron job was created:
-- select * from cron.job;

-- To manually trigger at any time:
-- select public.mark_overdue_invoices();
