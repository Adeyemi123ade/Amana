-- ============================================================
-- ROS — Revenue Operating System
-- Supabase Database Migration
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ───────────────────────────────────────────────
-- 1. USERS (extends Supabase auth.users)
-- ───────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  supabase_id   uuid unique not null references auth.users(id) on delete cascade,
  email         text unique not null,
  full_name     text not null,
  phone         text,
  country       text,
  kyc_status    text not null default 'PENDING' check (kyc_status in ('PENDING','APPROVED','REJECTED')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- 2. KYC SUBMISSIONS
-- ───────────────────────────────────────────────
create table if not exists public.kyc_submissions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique not null references public.users(id) on delete cascade,
  document_type   text not null check (document_type in ('NIN','PASSPORT','DRIVER_LICENSE')),
  front_image_url text not null,
  back_image_url  text,
  selfie_url      text not null,
  status          text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- 3. WORKSPACES
-- ───────────────────────────────────────────────
create table if not exists public.workspaces (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text unique not null,
  business_type     text,
  business_email    text,
  business_address  text,
  country           text not null default 'Nigeria',
  currency          text not null default 'NGN',
  business_size     text,
  website           text,
  instagram         text,
  whatsapp_number   text,
  logo_url          text,
  paystack_enabled  boolean not null default false,
  created_by        uuid not null references auth.users(id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- 4. WORKSPACE MEMBERS
-- ───────────────────────────────────────────────
create table if not exists public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'MEMBER' check (role in ('OWNER','ADMIN','MEMBER')),
  created_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- ───────────────────────────────────────────────
-- 5. CUSTOMERS
-- ───────────────────────────────────────────────
create table if not exists public.customers (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  name              text not null,
  email             text,
  phone             text,
  tags              text[] default '{}',
  total_spent       numeric(12,2) not null default 0,
  last_interaction  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_customers_workspace on public.customers(workspace_id);

-- ───────────────────────────────────────────────
-- 6. CUSTOMER NOTES
-- ───────────────────────────────────────────────
create table if not exists public.customer_notes (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  content      text not null,
  created_at   timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- 7. INVOICES
-- ───────────────────────────────────────────────
create table if not exists public.invoices (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  customer_id       uuid not null references public.customers(id) on delete restrict,
  invoice_number    text not null,
  status            text not null default 'DRAFT' check (status in ('DRAFT','UNPAID','PAID','OVERDUE','CANCELLED')),
  issue_date        date not null,
  due_date          date not null,
  items             jsonb not null default '[]',
  notes             text,
  total_amount      numeric(12,2) not null default 0,
  payment_method    text,
  paystack_ref      text,
  payment_link_url  text,
  last_reminded_at  timestamptz,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(workspace_id, invoice_number)
);
create index if not exists idx_invoices_workspace on public.invoices(workspace_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_customer on public.invoices(customer_id);

-- ───────────────────────────────────────────────
-- 8. APPOINTMENTS
-- ───────────────────────────────────────────────
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  customer_id      uuid not null references public.customers(id) on delete restrict,
  title            text not null,
  service          text,
  start_time       timestamptz not null,
  end_time         timestamptz,
  location         text,
  location_type    text not null default 'ONLINE' check (location_type in ('ONLINE','PHYSICAL')),
  notes            text,
  status           text not null default 'PENDING' check (status in ('PENDING','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW')),
  last_reminded_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_appointments_workspace on public.appointments(workspace_id);
create index if not exists idx_appointments_start on public.appointments(start_time);

-- ───────────────────────────────────────────────
-- 9. PAYMENTS
-- ───────────────────────────────────────────────
create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces(id) on delete cascade,
  invoice_id     uuid references public.invoices(id) on delete set null,
  amount         numeric(12,2) not null,
  currency       text not null default 'NGN',
  method         text not null,
  paystack_ref   text unique,
  customer_email text,
  status         text not null default 'SUCCESS' check (status in ('SUCCESS','FAILED','REFUNDED')),
  created_at     timestamptz not null default now()
);
create index if not exists idx_payments_workspace on public.payments(workspace_id);

-- ───────────────────────────────────────────────
-- 10. AUTOMATION RULES
-- ───────────────────────────────────────────────
create table if not exists public.automation_rules (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  type          text not null check (type in ('INVOICE_REMINDER','APPOINTMENT_REMINDER','FOLLOW_UP_REMINDER','WEEKLY_SUMMARY')),
  trigger_days  int,
  channel       text not null default 'EMAIL' check (channel in ('EMAIL','WHATSAPP','IN_APP','PUSH')),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- 11. REMINDER LOGS
-- ───────────────────────────────────────────────
create table if not exists public.reminder_logs (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid references public.invoices(id) on delete set null,
  appointment_id  uuid references public.appointments(id) on delete set null,
  channel         text not null,
  status          text not null,
  sent_at         timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- 12. ACTIVITY LOGS
-- ───────────────────────────────────────────────
create table if not exists public.activity_logs (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  action       text not null,
  entity_type  text,
  entity_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists idx_activity_workspace on public.activity_logs(workspace_id);

-- ───────────────────────────────────────────────
-- 13. UPDATED_AT TRIGGER FUNCTION
-- ───────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
create trigger trg_users_updated_at before update on public.users for each row execute function handle_updated_at();
create trigger trg_kyc_updated_at before update on public.kyc_submissions for each row execute function handle_updated_at();
create trigger trg_workspaces_updated_at before update on public.workspaces for each row execute function handle_updated_at();
create trigger trg_customers_updated_at before update on public.customers for each row execute function handle_updated_at();
create trigger trg_invoices_updated_at before update on public.invoices for each row execute function handle_updated_at();
create trigger trg_appointments_updated_at before update on public.appointments for each row execute function handle_updated_at();

-- ───────────────────────────────────────────────
-- 14. AUTO-CREATE USER PROFILE ON SIGNUP
-- ───────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (supabase_id, email, full_name, phone, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country'
  )
  on conflict (supabase_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────────────────────────
-- 15. ROW LEVEL SECURITY — Enable on all tables
-- ───────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.customers enable row level security;
alter table public.customer_notes enable row level security;
alter table public.invoices enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.automation_rules enable row level security;
alter table public.reminder_logs enable row level security;
alter table public.activity_logs enable row level security;

-- ───────────────────────────────────────────────
-- 16. RLS POLICIES
-- ───────────────────────────────────────────────

-- USERS: users can only read/update their own profile
create policy "users_own_profile" on public.users
  for all using (supabase_id = auth.uid());

-- KYC: users manage their own submission
create policy "kyc_own" on public.kyc_submissions
  for all using (user_id = (select id from public.users where supabase_id = auth.uid()));

-- WORKSPACES: owner or member can access
create policy "workspace_access" on public.workspaces
  for all using (
    created_by = auth.uid()
    or id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

-- WORKSPACE MEMBERS: members of a workspace
create policy "workspace_members_access" on public.workspace_members
  for all using (
    workspace_id in (
      select id from public.workspaces where created_by = auth.uid()
    )
    or user_id = auth.uid()
  );

-- Helper function: get all workspace IDs for current user
create or replace function public.my_workspace_ids()
returns setof uuid language sql stable security definer as $$
  select id from public.workspaces where created_by = auth.uid()
  union
  select workspace_id from public.workspace_members where user_id = auth.uid()
$$;

-- CUSTOMERS
create policy "customers_workspace" on public.customers
  for all using (workspace_id in (select public.my_workspace_ids()));

-- CUSTOMER NOTES
create policy "customer_notes_workspace" on public.customer_notes
  for all using (
    customer_id in (
      select id from public.customers
      where workspace_id in (select public.my_workspace_ids())
    )
  );

-- INVOICES
create policy "invoices_workspace" on public.invoices
  for all using (workspace_id in (select public.my_workspace_ids()));

-- APPOINTMENTS
create policy "appointments_workspace" on public.appointments
  for all using (workspace_id in (select public.my_workspace_ids()));

-- PAYMENTS
create policy "payments_workspace" on public.payments
  for all using (workspace_id in (select public.my_workspace_ids()));

-- AUTOMATION RULES
create policy "automation_workspace" on public.automation_rules
  for all using (workspace_id in (select public.my_workspace_ids()));

-- ACTIVITY LOGS
create policy "activity_workspace" on public.activity_logs
  for all using (workspace_id in (select public.my_workspace_ids()));

-- ───────────────────────────────────────────────
-- 17. STORAGE BUCKET FOR KYC DOCUMENTS
-- ───────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "kyc_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "kyc_read_own" on storage.objects
  for select using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ───────────────────────────────────────────────
-- DONE — All tables, triggers, RLS policies
-- and storage buckets are ready.
-- ───────────────────────────────────────────────
