-- Add missing columns to workspaces table for full onboarding
alter table public.workspaces
  add column if not exists business_reg_number text,
  add column if not exists business_title text,
  add column if not exists state text,
  add column if not exists city text,
  add column if not exists linkedin text,
  add column if not exists bank_name text,
  add column if not exists bank_country text,
  add column if not exists account_number text,
  add column if not exists account_name text,
  add column if not exists onboarding_complete boolean not null default false;

select 'Workspace columns added successfully' as result;
