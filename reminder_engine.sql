-- ═══════════════════════════════════════════════════════════════
-- AMANA REMINDER AUTOMATION ENGINE
-- Run in Supabase SQL editor AFTER phase2_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ── INVOICE REMINDER FUNCTION ─────────────────────────────────
-- Finds invoices whose due date matches trigger_days from now
-- and logs them for the Edge Function to send via Resend

create or replace function public.get_pending_invoice_reminders()
returns table (
  invoice_id      uuid,
  workspace_id    uuid,
  invoice_number  text,
  customer_name   text,
  customer_email  text,
  business_name   text,
  business_email  text,
  total_amount    numeric,
  currency        text,
  due_date        date,
  trigger_days    int
)
language sql
security definer
as $$
  select
    i.id,
    i.workspace_id,
    i.invoice_number,
    c.name,
    c.email,
    w.name,
    coalesce(w.business_email, ''),
    i.total_amount,
    w.currency,
    i.due_date,
    ar.trigger_days
  from public.invoices i
  join public.customers c    on c.id = i.customer_id
  join public.workspaces w   on w.id = i.workspace_id
  join public.automation_rules ar
    on ar.workspace_id = i.workspace_id
    and ar.type = 'INVOICE_REMINDER'
    and ar.active = true
  where i.status in ('UNPAID', 'OVERDUE')
    and c.email is not null
    and (i.due_date - current_date) = ar.trigger_days
    -- Don't remind if already reminded today
    and (
      i.last_reminded_at is null
      or i.last_reminded_at::date < current_date
    )
    -- Don't double-log (check reminder_logs)
    and not exists (
      select 1 from public.reminder_logs rl
      where rl.invoice_id = i.id
        and rl.sent_at::date = current_date
        and rl.status = 'SENT'
    );
$$;

-- ── APPOINTMENT REMINDER FUNCTION ─────────────────────────────
create or replace function public.get_pending_appointment_reminders()
returns table (
  appointment_id  uuid,
  workspace_id    uuid,
  title           text,
  customer_name   text,
  customer_email  text,
  business_name   text,
  start_time      timestamptz,
  location        text,
  notes           text,
  trigger_days    int
)
language sql
security definer
as $$
  select
    a.id,
    a.workspace_id,
    a.title,
    c.name,
    c.email,
    w.name,
    a.start_time,
    a.location,
    a.notes,
    ar.trigger_days
  from public.appointments a
  join public.customers c    on c.id = a.customer_id
  join public.workspaces w   on w.id = a.workspace_id
  join public.automation_rules ar
    on ar.workspace_id = a.workspace_id
    and ar.type = 'APPOINTMENT_REMINDER'
    and ar.active = true
  where a.status in ('PENDING', 'CONFIRMED')
    and c.email is not null
    and (a.start_time::date - current_date) = ar.trigger_days
    and (
      a.last_reminded_at is null
      or a.last_reminded_at::date < current_date
    )
    and not exists (
      select 1 from public.reminder_logs rl
      where rl.appointment_id = a.id
        and rl.sent_at::date = current_date
        and rl.status = 'SENT'
    );
$$;

-- ── LOG REMINDER SENT ─────────────────────────────────────────
create or replace function public.log_reminder_sent(
  p_workspace_id    uuid,
  p_invoice_id      uuid default null,
  p_appointment_id  uuid default null,
  p_channel         text default 'EMAIL',
  p_status          text default 'SENT',
  p_recipient_email text default null,
  p_error           text default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.reminder_logs (
    workspace_id, invoice_id, appointment_id,
    channel, status, recipient_email, error_message, sent_at
  ) values (
    p_workspace_id, p_invoice_id, p_appointment_id,
    p_channel, p_status, p_recipient_email, p_error, now()
  );

  -- Update last_reminded_at on the source record
  if p_invoice_id is not null then
    update public.invoices set last_reminded_at = now() where id = p_invoice_id;
  end if;
  if p_appointment_id is not null then
    update public.appointments set last_reminded_at = now() where id = p_appointment_id;
  end if;
end;
$$;

grant execute on function public.get_pending_invoice_reminders() to service_role;
grant execute on function public.get_pending_appointment_reminders() to service_role;
grant execute on function public.log_reminder_sent(uuid,uuid,uuid,text,text,text,text) to service_role;

-- Test: show what would be sent right now
select * from public.get_pending_invoice_reminders();
select * from public.get_pending_appointment_reminders();

select 'Reminder engine functions created' as result;
