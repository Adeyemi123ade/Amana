-- Add Paystack reference column to invoices
alter table public.invoices
  add column if not exists paystack_reference text;

select 'Paystack column added' as result;
