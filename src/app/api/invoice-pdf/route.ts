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
  const { data: invoice } = await supabase.from('invoices').select('*, customers(*)').eq('id', invoiceId).single()
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const { data: ws } = await supabase.from('workspaces').select('*').eq('id', invoice.workspace_id).single()

  const customer = invoice.customers
  const currency = ws?.currency || 'NGN'
  const fmt = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)
  const items = Array.isArray(invoice.items) ? invoice.items : []
  const subtotal = Number(invoice.subtotal) || items.reduce((s: number, i: any) => s + Number(i.amount || 0), 0)
  const tax = Number(invoice.tax_amount) || 0
  const total = Number(invoice.total_amount) || 0
  const isPaid = invoice.status === 'PAID'

  const issueDate = new Date(invoice.issue_date || invoice.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
  const dueDate = new Date(invoice.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
  const paidDate = invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const statusColor = isPaid ? '#16A34A' : invoice.status === 'OVERDUE' ? '#DC2626' : '#D97706'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://amana-two.vercel.app'

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice ${invoice.invoice_number} — ${ws?.name || 'Business'}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; background:#F3F4F6; color:#111827; font-size:14px; }
  .page { max-width:850px; margin:32px auto; background:white; border-radius:12px; border:1px solid #E5E7EB; overflow:hidden; }
  .accent-bar { height:5px; background:linear-gradient(90deg,#7C3AED,#3B82F6); }
  .body { padding:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; }
  .biz-logo { display:flex; align-items:center; gap:10px; }
  .logo-box { width:44px; height:44px; background:#7C3AED; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .biz-info { }
  .biz-name { font-size:20px; font-weight:900; color:#111827; }
  .biz-meta { font-size:12px; color:#6B7280; line-height:1.7; margin-top:2px; }
  .inv-title { text-align:right; }
  .inv-title h2 { font-size:28px; font-weight:900; color:#7C3AED; margin-bottom:4px; }
  .inv-title .inv-num { font-size:13px; color:#6B7280; }
  .status-badge { display:inline-block; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; color:${statusColor}; background:${statusColor}18; border:1px solid ${statusColor}44; margin-top:6px; }
  .divider { border:none; border-top:1px solid #F3F4F6; margin:24px 0; }
  .from-to { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:24px; }
  .section-label { font-size:10px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; }
  .contact-name { font-size:15px; font-weight:700; color:#111827; margin-bottom:3px; }
  .contact-detail { font-size:12px; color:#6B7280; line-height:1.7; }
  .meta-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .meta-item .label { font-size:10px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:4px; }
  .meta-item .value { font-size:13px; font-weight:600; color:#111827; }
  .meta-item .value.red { color:#DC2626; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead th { padding:10px 12px; background:#F9FAFB; font-size:10px; font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #E5E7EB; text-align:left; }
  thead th:last-child { text-align:right; }
  tbody td { padding:12px; border-bottom:1px solid #F9FAFB; font-size:13px; color:#374151; }
  tbody td:last-child { text-align:right; font-weight:600; }
  .summary { max-width:260px; margin-left:auto; padding-top:12px; border-top:2px solid #E5E7EB; }
  .summary-row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; }
  .summary-total { display:flex; justify-content:space-between; padding:10px 0; border-top:2px solid #111827; margin-top:6px; }
  .summary-total .t-label { font-size:15px; font-weight:800; }
  .summary-total .t-value { font-size:18px; font-weight:900; color:${isPaid ? '#16A34A' : '#DC2626'}; }
  .paid-stamp { background:#F0FDF4; border:1px solid #BBF7D0; border-radius:10px; padding:14px 16px; margin:20px 0; display:flex; align-items:center; gap:12px; }
  .notes-box { background:#F9FAFB; border-radius:8px; padding:12px 14px; margin:16px 0; }
  .notes-box .label { font-size:10px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:4px; }
  .link-box { background:#F5F3FF; border:1px solid #DDD6FE; border-radius:10px; padding:12px 14px; margin:16px 0; }
  .link-box .label { font-size:10px; color:#7C3AED; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
  .link-box a { font-size:12px; color:#7C3AED; word-break:break-all; }
  .footer { text-align:center; padding:20px; border-top:1px solid #F3F4F6; color:#9CA3AF; font-size:11px; background:#FAFAFA; }
  @media print {
    body { background:white; }
    .page { border:none; border-radius:0; margin:0; max-width:100%; box-shadow:none; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="accent-bar"></div>
    <div class="body">

      <!-- HEADER: Business branding PRIMARY -->
      <div class="header">
        <div class="biz-logo">
          <div class="logo-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <div class="biz-info">
            <div class="biz-name">${ws?.name || 'Business'}</div>
            <div class="biz-meta">
              ${ws?.business_email ? ws.business_email + '<br/>' : ''}
              ${ws?.phone ? ws.phone + '<br/>' : ''}
              ${ws?.address ? ws.address : ''}
            </div>
          </div>
        </div>
        <div class="inv-title">
          <h2>INVOICE</h2>
          <div class="inv-num">${invoice.invoice_number}</div>
          <div class="status-badge">${invoice.status}</div>
        </div>
      </div>

      <hr class="divider"/>

      <!-- FROM / BILL TO -->
      <div class="from-to">
        <div>
          <div class="section-label">From</div>
          <div class="contact-name">${ws?.name || 'Business'}</div>
          <div class="contact-detail">
            ${ws?.business_email || ''}${ws?.business_email ? '<br/>' : ''}
            ${ws?.phone || ''}${ws?.phone ? '<br/>' : ''}
            ${ws?.address || ''}
          </div>
        </div>
        <div>
          <div class="section-label">Bill To</div>
          <div class="contact-name">${customer?.name || '—'}</div>
          <div class="contact-detail">
            ${customer?.email ? customer.email + '<br/>' : ''}
            ${customer?.phone || ''}
          </div>
        </div>
      </div>

      <!-- INVOICE META -->
      <div class="meta-row">
        <div class="meta-item"><div class="label">Invoice No.</div><div class="value">${invoice.invoice_number}</div></div>
        <div class="meta-item"><div class="label">Issue Date</div><div class="value">${issueDate}</div></div>
        <div class="meta-item"><div class="label">Due Date</div><div class="value${!isPaid ? ' red' : ''}">${dueDate}</div></div>
        <div class="meta-item"><div class="label">Status</div><div class="value" style="color:${statusColor}">${invoice.status}</div></div>
      </div>

      <hr class="divider"/>

      <!-- SERVICE TABLE -->
      <div class="section-label" style="margin-bottom:10px">Service Details</div>
      <table>
        <thead>
          <tr>
            <th style="width:50%">Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.length > 0 ? items.map((item: any) => `
          <tr>
            <td><strong>${item.description || '—'}</strong>${item.note ? '<br/><small style="color:#9CA3AF">' + item.note + '</small>' : ''}</td>
            <td>${item.quantity || 1}</td>
            <td>${fmt(Number(item.unit_price || item.amount || 0) / Number(item.quantity || 1))}</td>
            <td>${fmt(Number(item.amount || 0))}</td>
          </tr>`).join('') : `
          <tr>
            <td><strong>${invoice.notes || 'Professional Services'}</strong></td>
            <td>1</td>
            <td>${fmt(total)}</td>
            <td>${fmt(total)}</td>
          </tr>`}
        </tbody>
      </table>

      <!-- PAYMENT SUMMARY -->
      <div class="summary">
        <div class="summary-row"><span style="color:#6B7280">Subtotal</span><span>${fmt(subtotal || total)}</span></div>
        ${tax > 0 ? `<div class="summary-row"><span style="color:#6B7280">Tax</span><span>${fmt(tax)}</span></div>` : ''}
        <div class="summary-total">
          <span class="t-label">Total Due</span>
          <span class="t-value">${fmt(total)}</span>
        </div>
        ${isPaid ? `<div class="summary-row" style="color:#16A34A;font-weight:700"><span>✓ Paid</span><span>${fmt(total)}</span></div>` : ''}
      </div>

      ${isPaid ? `
      <div class="paid-stamp">
        <span style="font-size:24px">✓</span>
        <div>
          <div style="font-size:14px;font-weight:700;color:#16A34A">Payment Received</div>
          ${paidDate ? `<div style="font-size:12px;color:#15803D">Paid on ${paidDate}</div>` : ''}
          ${invoice.paystack_ref ? `<div style="font-size:11px;color:#6B7280">Ref: ${invoice.paystack_ref}</div>` : ''}
        </div>
      </div>` : `
      <div class="link-box">
        <div class="label">Payment Link</div>
        <a href="${appUrl}/invoice/${invoiceId}">${appUrl}/invoice/${invoiceId}</a>
      </div>`}

      ${invoice.notes && !isPaid ? `
      <div class="notes-box">
        <div class="label">Notes</div>
        <p style="font-size:13px;color:#374151;line-height:1.6">${invoice.notes}</p>
      </div>` : ''}

    </div>
    <div class="footer">
      Generated by <strong>Amana</strong> · amana-two.vercel.app
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="Invoice-${invoice.invoice_number}.html"`,
    },
  })
}
