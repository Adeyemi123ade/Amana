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
  const wsId   = searchParams.get('workspace')
  const type   = searchParams.get('type') || 'full'
  const format = searchParams.get('format') || 'pdf'

  if (!wsId) return NextResponse.json({ error: 'Missing workspace' }, { status: 400 })

  const supabase = getSupabase()
  const { data: ws }           = await supabase.from('workspaces').select('*').eq('id', wsId).single()
  const { data: invoices }     = await supabase.from('invoices').select('*, customers(name,email)').eq('workspace_id', wsId).order('created_at', { ascending: false })
  const { data: payments }     = await supabase.from('payments').select('*').eq('workspace_id', wsId).order('created_at', { ascending: false })
  const { data: customers }    = await supabase.from('customers').select('*').eq('workspace_id', wsId)
  const { data: appointments } = await supabase.from('appointments').select('*, customers(name)').eq('workspace_id', wsId).order('start_time', { ascending: false })

  const inv  = invoices || []
  const pay  = payments || []
  const cust = customers || []
  const appt = appointments || []
  const currency = ws?.currency || 'NGN'
  const fmt = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)
  const now = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

  const totalRevenue = pay.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount), 0)
  const paidInv      = inv.filter(i => i.status === 'PAID')
  const unpaidInv    = inv.filter(i => i.status === 'UNPAID' || !i.status)
  const overdueInv   = inv.filter(i => i.status === 'OVERDUE')
  const outstanding  = [...unpaidInv, ...overdueInv].reduce((s, i) => s + Number(i.total_amount), 0)

  if (format === 'csv') {
    let csv = ''
    if (type === 'invoices') {
      csv += 'Invoice No,Customer,Customer Email,Status,Amount,Due Date,Created\r\n'
      inv.forEach(i => { csv += `"${i.invoice_number}","${i.customers?.name||''}","${i.customers?.email||''}","${i.status}","${Number(i.total_amount).toFixed(2)}","${i.due_date}","${i.created_at}"\r\n` })
    } else if (type === 'payments') {
      csv += 'Reference,Customer Email,Amount,Channel,Method,Status,Date\r\n'
      pay.forEach(p => { csv += `"${p.paystack_ref||''}","${p.customer_email||''}","${Number(p.amount).toFixed(2)}","${p.payment_channel||''}","${p.method||''}","${p.status}","${p.created_at}"\r\n` })
    } else {
      csv += 'FULL BUSINESS REPORT\r\n\r\nINVOICES\r\nInvoice No,Customer,Status,Amount,Due Date\r\n'
      inv.forEach(i => { csv += `"${i.invoice_number}","${i.customers?.name||''}","${i.status}","${Number(i.total_amount).toFixed(2)}","${i.due_date}"\r\n` })
      csv += '\r\nPAYMENTS\r\nReference,Customer Email,Amount,Status,Date\r\n'
      pay.forEach(p => { csv += `"${p.paystack_ref||''}","${p.customer_email||''}","${Number(p.amount).toFixed(2)}","${p.status}","${p.created_at}"\r\n` })
    }
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="amana-${type}-report.csv"` } })
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Business Report — ${ws?.name||'Business'}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Helvetica Neue',Arial,sans-serif;background:#F3F4F6;color:#111827;font-size:13px}
.page{max-width:850px;margin:32px auto;background:white;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden}
.accent-bar{height:5px;background:linear-gradient(90deg,#7C3AED,#3B82F6)}
.body{padding:36px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
.biz-name{font-size:20px;font-weight:900}.biz-meta{font-size:11px;color:#6B7280;margin-top:3px;line-height:1.8}
.rt h2{font-size:22px;font-weight:900;color:#7C3AED;text-align:right}.rt p{font-size:11px;color:#6B7280;text-align:right;margin-top:3px}
hr{border:none;border-top:1px solid #F3F4F6;margin:20px 0}
h3{font-size:12px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid #F3F4F6}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.stat{background:#F9FAFB;border-radius:10px;padding:14px;border:1px solid #F3F4F6}
.stat .l{font-size:10px;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.stat .v{font-size:17px;font-weight:800;color:#111827}.stat .s{font-size:11px;color:#6B7280;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
th{padding:8px 10px;background:#F9FAFB;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #E5E7EB;text-align:left}
td{padding:9px 10px;border-bottom:1px solid #F9FAFB}
.b{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
.paid{color:#16A34A;background:#F0FDF4}.unpaid{color:#D97706;background:#FFFBEB}.overdue{color:#DC2626;background:#FEF2F2}
.sec{margin-bottom:28px}
.footer{text-align:center;padding:16px;border-top:1px solid #F3F4F6;color:#9CA3AF;font-size:11px;background:#FAFAFA}
@media print{body{background:white}.page{border:none;border-radius:0;margin:0;max-width:100%}}
</style></head><body>
<div class="page">
<div class="accent-bar"></div>
<div class="body">
<div class="header">
  <div>
    <div class="biz-name">${ws?.name||'Business'}</div>
    <div class="biz-meta">${ws?.business_email||''}${ws?.business_email?'<br/>':''}${ws?.phone||''}${ws?.phone?'<br/>':''}${ws?.address||''}</div>
  </div>
  <div class="rt"><h2>BUSINESS REPORT</h2><p>Generated: ${now}</p></div>
</div>
<hr/>
<div class="sec"><h3>Revenue Overview</h3>
<div class="sg">
<div class="stat"><div class="l">Total Revenue</div><div class="v">${fmt(totalRevenue)}</div></div>
<div class="stat"><div class="l">Total Invoiced</div><div class="v">${fmt(inv.reduce((s,i)=>s+Number(i.total_amount),0))}</div></div>
<div class="stat"><div class="l">Outstanding</div><div class="v" style="color:#DC2626">${fmt(outstanding)}</div></div>
<div class="stat"><div class="l">Payments</div><div class="v">${pay.filter(p=>p.status==='SUCCESS').length}</div><div class="s">successful</div></div>
</div></div>
<div class="sec"><h3>Invoice Report (${inv.length} total)</h3>
<div class="sg">
<div class="stat"><div class="l">Paid</div><div class="v" style="color:#16A34A">${paidInv.length}</div><div class="s">${fmt(paidInv.reduce((s,i)=>s+Number(i.total_amount),0))}</div></div>
<div class="stat"><div class="l">Unpaid</div><div class="v" style="color:#D97706">${unpaidInv.length}</div></div>
<div class="stat"><div class="l">Overdue</div><div class="v" style="color:#DC2626">${overdueInv.length}</div></div>
<div class="stat"><div class="l">Cancelled</div><div class="v" style="color:#6B7280">${inv.filter(i=>i.status==='CANCELLED').length}</div></div>
</div>
<table><thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead><tbody>
${inv.slice(0,25).map(i=>`<tr><td><strong>${i.invoice_number}</strong></td><td>${i.customers?.name||'—'}</td><td><strong>${fmt(Number(i.total_amount))}</strong></td><td>${new Date(i.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</td><td><span class="b ${i.status?.toLowerCase()==='paid'?'paid':i.status?.toLowerCase()==='overdue'?'overdue':'unpaid'}">${i.status}</span></td></tr>`).join('')}
</tbody></table></div>
<div class="sec"><h3>Payment Report (${pay.length} total)</h3>
<table><thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Channel</th><th>Date</th><th>Status</th></tr></thead><tbody>
${pay.slice(0,25).map(p=>`<tr><td style="font-size:11px">${p.paystack_ref||'—'}</td><td>${p.customer_email||'—'}</td><td><strong>${fmt(Number(p.amount))}</strong></td><td>${p.payment_channel||p.method||'—'}</td><td>${new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</td><td><span class="b ${p.status==='SUCCESS'?'paid':'overdue'}">${p.status}</span></td></tr>`).join('')}
</tbody></table></div>
<div class="sec"><h3>Customer Report</h3>
<div class="sg">
<div class="stat"><div class="l">Total Customers</div><div class="v">${cust.length}</div></div>
<div class="stat"><div class="l">With Invoices</div><div class="v">${new Set(inv.map(i=>i.customer_id).filter(Boolean)).size}</div></div>
<div class="stat"><div class="l">New This Month</div><div class="v">${cust.filter(c=>{const d=new Date(c.created_at),n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}).length}</div></div>
<div class="stat"><div class="l">Total Appointments</div><div class="v">${appt.length}</div></div>
</div></div>
<div class="sec"><h3>Appointment Report</h3>
<div class="sg">
<div class="stat"><div class="l">Total</div><div class="v">${appt.length}</div></div>
<div class="stat"><div class="l">Completed</div><div class="v" style="color:#16A34A">${appt.filter(a=>a.status==='COMPLETED').length}</div></div>
<div class="stat"><div class="l">Confirmed</div><div class="v" style="color:#3B82F6">${appt.filter(a=>a.status==='CONFIRMED').length}</div></div>
<div class="stat"><div class="l">Cancelled</div><div class="v" style="color:#EF4444">${appt.filter(a=>a.status==='CANCELLED').length}</div></div>
</div></div>
</div>
<div class="footer">Generated by <strong>Amana</strong> &middot; amana-two.vercel.app &middot; ${now}</div>
</div></body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': 'inline; filename="Business-Report.html"' } })
}
