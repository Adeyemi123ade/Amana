-- ═══════════════════════════════════════════════════════════════
-- PHASE 5 + 7 SCHEMA
-- ═══════════════════════════════════════════════════════════════

-- 1. Add VIEWER role to workspace_members (currently only OWNER/ADMIN/MEMBER)
alter table public.workspace_members
  drop constraint if exists workspace_members_role_check;
alter table public.workspace_members
  add constraint workspace_members_role_check
  check (role in ('OWNER','ADMIN','STAFF','VIEWER'));

-- 2. Add permissions column to workspace_members
alter table public.workspace_members
  add column if not exists permissions jsonb default '{}'::jsonb;

-- 3. Add tax fields to invoices
alter table public.invoices
  add column if not exists tax_rate    numeric(5,2) default 0,
  add column if not exists tax_amount  numeric(12,2) default 0,
  add column if not exists subtotal    numeric(12,2) default 0;

-- 4. Add customer_notes RLS (table already exists)
alter table public.customer_notes enable row level security;

drop policy if exists "notes_owner" on public.customer_notes;
create policy "notes_owner" on public.customer_notes
  for all using (
    customer_id in (
      select id from public.customers
      where workspace_id in (
        select id from public.workspaces where created_by = auth.uid()
      )
    )
  );

-- 5. Recurring invoices
create table if not exists public.recurring_invoices (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  customer_id     uuid not null references public.customers(id) on delete cascade,
  title           text not null,
  items           jsonb not null default '[]',
  total_amount    numeric(12,2) not null default 0,
  tax_rate        numeric(5,2) default 0,
  frequency       text not null check (frequency in ('WEEKLY','MONTHLY','QUARTERLY','YEARLY')),
  next_due        date not null,
  last_generated  date,
  active          boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.recurring_invoices enable row level security;

drop policy if exists "recurring_owner" on public.recurring_invoices;
create policy "recurring_owner" on public.recurring_invoices
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
  );

-- 6. Role-based permissions helper function
create or replace function public.get_user_role(p_workspace_id uuid)
returns text
language sql
security definer
as $$
  select case
    when exists (
      select 1 from public.workspaces
      where id = p_workspace_id and created_by = auth.uid()
    ) then 'OWNER'
    else coalesce(
      (select role from public.workspace_members
       where workspace_id = p_workspace_id and user_id = auth.uid()),
      'NONE'
    )
  end;
$$;

grant execute on function public.get_user_role(uuid) to authenticated;

select 'Phase 5+7 schema complete' as result;
