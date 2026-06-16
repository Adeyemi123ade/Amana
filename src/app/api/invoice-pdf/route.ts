import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const invoiceId = searchParams.get('id')
  if (!invoiceId) return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })

  const supabase = getSupabase()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, customers(*), workspaces(*)')
    .eq('id', invoiceId)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const ws = invoice.workspaces
  const customer = invoice.customers
  const currency = ws?.currency || 'NGN'

  const fmt = (n: number) => new Intl.NumberFormat('en-NG', {
    style: 'currency', currency, minimumFractionDigits: 2
  }).format(n)

  const items = Array.isArray(invoice.items) ? invoice.items : []
  const issueDate = new Date(invoice.issue_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
  const dueDate   = new Date(invoice.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
  const paidDate  = invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  const statusColor = invoice.status === 'PAID' ? '#22C55E' : invoice.status === 'OVERDUE' ? '#EF4444' : '#F59E0B'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'
  const paymentLink = `${appUrl}/invoice/${invoiceId}`

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice ${invoice.invoice_number}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color:#111827; background:white; padding:48px; font-size:14px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
  .logo { display:flex; align-items:center; gap:10px; }
  .logo-box { width:40px; height:40px; background:#7C3AED; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .logo-name { font-size:22px; font-weight:800; color:#111827; }
  .invoice-badge { font-size:28px; font-weight:900; color:#7C3AED; }
  .meta { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:32px; }
  .meta-block p { color:#6B7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; font-weight:600; }
  .meta-block h3 { font-size:15px; font-weight:600; color:#111827; }
  .meta-block small { font-size:13px; color:#6B7280; }
  .status-badge { display:inline-block; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; color:${statusColor}; background:${statusColor}18; border:1px solid ${statusColor}44; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  th { text-align:left; padding:10px 14px; background:#F9FAFB; font-size:11px; font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #F3F4F6; }
  td { padding:12px 14px; border-bottom:1px solid #F3F4F6; font-size:13px; }
  .total-row td { font-weight:800; font-size:16px; color:#111827; border-top:2px solid #111827; border-bottom:none; padding-top:14px; }
  .link-box { background:#F5F3FF; border:1px solid #DDD6FE; border-radius:10px; padding:14px 16px; margin-bottom:24px; }
  .link-box p { font-size:11px; color:#7C3AED; font-weight:600; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px; }
  .link-box a { font-size:12px; color:#7C3AED; word-break:break-all; }
  .footer { text-align:center; padding-top:24px; border-top:1px solid #F3F4F6; color:#9CA3AF; font-size:12px; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
      </div>
      <span class="logo-name">Amana</span>
    </div>
    <div style="text-align:right">
      <div class="invoice-badge">${invoice.invoice_number}</div>
      <div style="margin-top:6px"><span class="status-badge">${invoice.status}</span></div>
    </div>
  </div>

  <div class="meta">
    <div>
      <div class="meta-block">
        <p>From</p>
        <h3>${ws?.name || 'Business'}</h3>
        ${ws?.business_email ? `<small>${ws.business_email}</small>` : ''}
        ${ws?.business_address ? `<small style="display:block">${ws.business_address}</small>` : ''}
      </div>
    </div>
    <div>
      <div class="meta-block">
        <p>Bill To</p>
        <h3>${customer?.name || ''}</h3>
        ${customer?.email ? `<small>${customer.email}</small>` : ''}
        ${customer?.phone ? `<small style="display:block">${customer.phone}</small>` : ''}
      </div>
    </div>
    <div>
      <div class="meta-block">
        <p>Issue Date</p>
        <h3>${issueDate}</h3>
      </div>
    </div>
    <div>
      <div class="meta-block">
        <p>${paidDate ? 'Paid On' : 'Due Date'}</p>
        <h3 style="color:${paidDate ? '#22C55E' : invoice.status === 'OVERDUE' ? '#EF4444' : '#111827'}">${paidDate || dueDate}</h3>
      </div>
    </div>
  </div>

  <table>
    <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      ${items.length > 0
        ? items.map((item: any) => `<tr><td>${item.description || ''}</td><td style="text-align:right">${fmt(Number(item.amount || 0))}</td></tr>`).join('')
        : `<tr><td colspan="2" style="color:#6B7280">No line items</td></tr>`}
      <tr class="total-row">
        <td>Total</td>
        <td style="text-align:right">${fmt(Number(invoice.total_amount))}</td>
      </tr>
    </tbody>
  </table>

  ${invoice.status !== 'PAID' ? `
  <div class="link-box">
    <p>Payment Link</p>
    <a href="${paymentLink}">${paymentLink}</a>
  </div>` : ''}

  ${invoice.notes ? `<p style="font-size:13px;color:#6B7280;font-style:italic;margin-bottom:24px">${invoice.notes}</p>` : ''}

  <div class="footer">
    <p>Generated by Amana · amana-two.vercel.app</p>
    ${invoice.paystack_ref ? `<p style="margin-top:4px">Payment Reference: ${invoice.paystack_ref}</p>` : ''}
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="invoice-${invoice.invoice_number}.html"`,
    }
  })
}
