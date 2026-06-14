-- Fix 1: Add missing columns to customers table
alter table public.customers
  add column if not exists address text,
  add column if not exists notes text;

-- Fix 2: Make customer_id optional in appointments (some appointments have no customer)
alter table public.appointments
  alter column customer_id drop not null;

-- Fix 3: Add missing columns to invoices table
alter table public.invoices
  add column if not exists bank_receipt_url text,
  add column if not exists workspace_id_check text;

-- Fix 4: Add PENDING_VERIFICATION to invoices status check
alter table public.invoices
  drop constraint if exists invoices_status_check;

alter table public.invoices
  add constraint invoices_status_check 
  check (status in ('DRAFT','UNPAID','PAID','OVERDUE','CANCELLED','PENDING_VERIFICATION'));

-- Fix 5: Add missing columns to workspaces that settings page uses
alter table public.workspaces
  add column if not exists bank_name text,
  add column if not exists bank_country text,
  add column if not exists account_number text,
  add column if not exists account_name text,
  add column if not exists business_reg_number text,
  add column if not exists business_title text,
  add column if not exists state text,
  add column if not exists city text,
  add column if not exists linkedin text,
  add column if not exists onboarding_complete boolean default false;

select 'Schema fixed successfully' as result;
