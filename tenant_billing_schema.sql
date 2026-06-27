-- ═══════════════════════════════════════════════════════════
-- TENANT BILLING SCHEMA
-- This table tracks Amana's invoices TO businesses (tenants)
-- It is completely separate from the 'invoices' table which
-- businesses use to invoice their own customers.
-- ═══════════════════════════════════════════════════════════

create table if not exists public.tenant_billing (
  id                  uuid primary key default gen_random_uuid(),

  -- Tenant reference
  workspace_id        uuid references public.workspaces(id) on delete set null,
  business_name       text not null,
  business_email      text,
  owner_name          text,
  tenant_id           text, -- human-readable tenant identifier

  -- Invoice details
  invoice_number      text unique not null,
  plan_name           text not null default 'FREE',
  billing_type        text not null default 'MONTHLY'
                        check (billing_type in ('MONTHLY','ANNUAL','USAGE','ONE_TIME')),
  billing_period_start date,
  billing_period_end   date,

  -- Financials
  invoice_amount      numeric(12,2) not null default 0,
  amount_paid         numeric(12,2) not null default 0,
  outstanding_balance numeric(12,2) generated always as (invoice_amount - amount_paid) stored,
  discount_amount     numeric(12,2) not null default 0,
  currency            text not null default 'NGN',

  -- Status
  status              text not null default 'PENDING'
                        check (status in ('DRAFT','SENT','PAID','PENDING','FAILED','OVERDUE','CANCELLED','WAIVED')),
  payment_method      text,
  due_date            date,
  paid_at             timestamptz,
  last_reminder_at    timestamptz,

  -- Admin fields
  admin_notes         text,
  waived_reason       text,
  waived_by           text,

  -- Subscription context
  subscription_status text default 'ACTIVE'
                        check (subscription_status in ('TRIAL','ACTIVE','EXPIRED','SUSPENDED','CANCELLED')),
  trial_ends_at       date,
  next_renewal_date   date,

  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Activity log for all admin actions on tenant billing
create table if not exists public.tenant_billing_logs (
  id              uuid primary key default gen_random_uuid(),
  billing_id      uuid references public.tenant_billing(id) on delete cascade,
  admin_email     text not null,
  action          text not null,
  details         jsonb default '{}',
  created_at      timestamptz not null default now()
);

-- RLS: only service role (admin) can access these tables
alter table public.tenant_billing enable row level security;
alter table public.tenant_billing_logs enable row level security;

-- No policies = only service role key can access (same pattern as platform_admins)

-- Index for common queries
create index if not exists idx_tenant_billing_workspace on public.tenant_billing(workspace_id);
create index if not exists idx_tenant_billing_status on public.tenant_billing(status);
create index if not exists idx_tenant_billing_due_date on public.tenant_billing(due_date);
create index if not exists idx_tenant_billing_logs_billing on public.tenant_billing_logs(billing_id);
