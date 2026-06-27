-- ═══════════════════════════════════════════════════════════
-- TENANT BILLING v2 — Delivery tracking columns
-- Run this after tenant_billing_schema.sql
-- ═══════════════════════════════════════════════════════════

-- Add delivery tracking columns to tenant_billing
alter table public.tenant_billing
  add column if not exists sent_at          timestamptz,
  add column if not exists viewed_at        timestamptz,
  add column if not exists delivery_status  text default 'NOT_SENT'
                             check (delivery_status in ('NOT_SENT','SENT','FAILED','BOUNCED','OPENED','VIEWED','PAID')),
  add column if not exists recipient_email  text,
  add column if not exists read_at          timestamptz;

-- Add link column to notifications if not already there
alter table public.notifications
  add column if not exists read_at timestamptz;

select 'tenant_billing v2 migration complete' as result;
