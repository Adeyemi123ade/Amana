'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const supabase = createClient()

function fmtDate(d: string, long = false) {
  return new Date(d).toLocaleDateString('en-NG', long
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS: Record<string, [string,string]> = {
  PAID:    ['#16A34A','#F0FDF4'],
  UNPAID:  ['#D97706','#FFFBEB'],
  OVERDUE: ['#DC2626','#FEF2F2'],
  DRAFT:   ['var(--text-muted)','var(--bg)'],
  PENDING_VERIFICATION: ['var(--accent)','var(--accent-light)'],
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [invoice,   setInvoice]   = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [emailSent, setEmailSent] = useState(false)
  const [copied,    setCopied]    = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const [wsRes, invRes] = await Promise.all([
        supabase.from('workspaces').select('*').eq('created_by', user?.id).maybeSingle(),
        supabase.from('invoices').select('*').eq('id', id).maybeSingle(),
      ])
      setWorkspace(wsRes.data)
      const inv = invRes.data
      if (inv?.customer_id) {
        const { data: cust } = await supabase
          .from('customers').select('name,phone,email,address').eq('id', inv.customer_id).maybeSingle()
        inv.customers = cust || null
      }
      setInvoice(inv)
      setLoading(false)
    }
    load()
  }, [id])

  const origin      = typeof window !== 'undefined' ? window.location.origin : ''
  const paymentLink = origin + '/invoice/' + id

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentLink)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const sendEmail = () => {
    if (!invoice?.customers?.email) {
      alert('No email on this customer. Add one in the customer profile first.')
      return
    }
    const cur  = workspace?.currency || 'NGN'
    const amt  = formatCurrency(Number(invoice.total_amount), cur)
    const due  = fmtDate(invoice.due_date, true)
    // Primary service name = first item description OR invoice notes OR generic
    const serviceName = invoice.items?.[0]?.description || invoice.notes || 'Professional Services'
    const biz  = workspace?.name || 'Business'
    const subject = encodeURIComponent(serviceName + ' - Payment Request')
    const body = encodeURIComponent(
      'Hello ' + invoice.customers.name + ',\n\n' +
      biz + ' has issued a payment request for the following service.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'SERVICE DETAILS\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Service:         ' + serviceName + '\n' +
      'Invoice Number:  ' + invoice.invoice_number + '\n' +
      'Amount Due:      ' + amt + '\n' +
      'Due Date:        ' + due + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'To complete payment, use the secure link below:\n' +
      paymentLink + '\n\n' +
      'You can pay by card, bank transfer, or USSD.\n\n' +
      'If payment has already been completed, please disregard this email.\n\n' +
      'Thank you,\n' +
      biz
    )
    window.location.href = 'mailto:' + invoice.customers.email + '?subject=' + subject + '&body=' + body
    setEmailSent(true)
  }

  const resendEmail = () => { setEmailSent(false); setTimeout(sendEmail, 100) }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300 }}>
      <div style={{ width:28, height:28, border:'3px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!invoice) return (
    <div style={{ textAlign:'center', padding:48 }}>
      <p style={{ color:'var(--text-muted)', marginBottom:12 }}>Invoice not found</p>
      <Link href="/dashboard/invoices" style={{ color:'var(--accent)', textDecoration:'none' }}>Back to invoices</Link>
    </div>
  )

  const cur  = workspace?.currency || 'NGN'
  const isPaid = invoice.status === 'PAID'
  const [sc, sb] = STATUS[invoice.status] || ['var(--text-muted)','var(--bg)']
  const items: any[] = Array.isArray(invoice.items) ? invoice.items : []
  const subtotal = Number(invoice.subtotal) || items.reduce((s:number,i:any)=>s+Number(i.amount||0),0)
  const tax      = Number(invoice.tax_amount) || 0
  const total    = Number(invoice.total_amount) || 0
  const serviceName = items[0]?.description || invoice.notes || 'Professional Services'

  const divider: React.CSSProperties = { borderTop:'1px solid var(--border)', margin:'16px 0' }
  const label: React.CSSProperties  = { fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }
  const val: React.CSSProperties    = { fontSize:14, color:'var(--text)', fontWeight:500 }

  return (
    <div style={{ maxWidth:680, margin:'0 auto', paddingBottom:40 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <Link href="/dashboard/invoices"
          style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-muted)', textDecoration:'none', fontSize:14, padding:'8px 14px', border:'1px solid var(--border-light)', borderRadius:9, background:'var(--bg-secondary)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </Link>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:18, fontWeight:700, color:'var(--text)' }}>Invoice {invoice.invoice_number}</h1>
        </div>
        <span style={{ fontSize:11, fontWeight:700, color:sc, background:sb, padding:'4px 12px', borderRadius:20, border:'1px solid ' + sc + '33' }}>
          {invoice.status.replace('_',' ')}
        </span>
      </div>

      {/* ── Invoice document ── */}
      <div style={{ background:'var(--card)', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden', marginBottom:14 }}>

        {/* Top accent bar */}
        <div style={{ height:4, background:'linear-gradient(90deg,var(--accent),#3B82F6)' }}/>

        <div style={{ padding:'28px 28px 0' }}>

          {/* Business + Customer row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }} className="from-to-grid">

            {/* FROM — business */}
            <div>
              <p style={label}>From</p>
              <p style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:4 }}>{workspace?.name || 'Business'}</p>
              {workspace?.business_email && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{workspace.business_email}</p>}
              {workspace?.phone         && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{workspace.phone}</p>}
              {workspace?.address       && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{workspace.address}</p>}
            </div>

            {/* TO — customer */}
            <div>
              <p style={label}>Bill To</p>
              <p style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{invoice.customers?.name || '—'}</p>
              {invoice.customers?.email && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{invoice.customers.email}</p>}
              {invoice.customers?.phone && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{invoice.customers.phone}</p>}
            </div>
          </div>

          <div style={divider}/>

          {/* Invoice meta row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }} className="meta-grid">
            {[
              ['Invoice No.', invoice.invoice_number],
              ['Issue Date', fmtDate(invoice.issue_date)],
              ['Due Date',   fmtDate(invoice.due_date)],
              ['Status',     invoice.status.replace('_',' ')],
            ].map(([l,v]) => (
              <div key={l}>
                <p style={label}>{l}</p>
                <p style={{ ...val, color: l === 'Due Date' && !isPaid ? '#DC2626' : 'var(--text)' }}>{v}</p>
              </div>
            ))}
          </div>

          <div style={divider}/>

          {/* ── SERVICE SECTION — most prominent ── */}
          <div style={{ marginBottom:24 }}>
            <p style={label}>Service Details</p>

            {/* Service table header */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:12, padding:'8px 0', borderBottom:'2px solid var(--border)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 }}>Description</p>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5, textAlign:'right' }}>Qty</p>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5, textAlign:'right', minWidth:90 }}>Amount</p>
            </div>

            {/* Line items */}
            {items.length > 0 ? items.map((item: any, i: number) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{item.description}</p>
                  {item.note && <p style={{ fontSize:12, color:'var(--text-muted)' }}>{item.note}</p>}
                </div>
                <p style={{ fontSize:13, color:'var(--text-muted)', textAlign:'right', paddingTop:2 }}>{item.quantity || 1}</p>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', textAlign:'right', minWidth:90 }}>
                  {formatCurrency(Number(item.amount), cur)}
                </p>
              </div>
            )) : (
              <div style={{ padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{serviceName}</p>
              </div>
            )}

            {/* Payment summary */}
            <div style={{ maxWidth:260, marginLeft:'auto', paddingTop:12 }}>
              {[
                ['Subtotal', formatCurrency(subtotal, cur)],
                tax > 0 ? ['Tax', formatCurrency(tax, cur)] : null,
              ].filter(Boolean).map((row: any) => (
                <div key={row[0]} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                  <p style={{ fontSize:13, color:'var(--text-muted)' }}>{row[0]}</p>
                  <p style={{ fontSize:13, color:'var(--text)' }}>{row[1]}</p>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'2px solid var(--border)', marginTop:6 }}>
                <p style={{ fontSize:15, fontWeight:800, color:'var(--text)' }}>Total Due</p>
                <p style={{ fontSize:18, fontWeight:900, color: isPaid ? '#16A34A' : '#DC2626' }}>
                  {formatCurrency(total, cur)}
                </p>
              </div>
              {isPaid && (
                <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                  <p style={{ fontSize:13, color:'#16A34A', fontWeight:600 }}>Paid</p>
                  <p style={{ fontSize:13, color:'#16A34A', fontWeight:600 }}>
                    {formatCurrency(total, cur)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ background:'var(--bg-secondary)', borderRadius:10, padding:'12px 14px', marginBottom:24 }}>
              <p style={{ ...label, marginBottom:4 }}>Notes</p>
              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{invoice.notes}</p>
            </div>
          )}

          {/* Paid banner */}
          {isPaid && (
            <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'#16A34A' }}>Payment Received</p>
                {invoice.paid_at && <p style={{ fontSize:12, color:'#15803D' }}>Paid on {fmtDate(invoice.paid_at, true)}</p>}
              </div>
            </div>
          )}

          {/* Payment methods */}
          {!isPaid && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16, paddingBottom:24 }}>
              <p style={{ ...label, marginBottom:10 }}>Payment Methods Accepted</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['💳 Card','🏦 Bank Transfer','📱 USSD','💸 OPay'].map(m => (
                  <span key={m} style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', background:'var(--bg-secondary)', border:'1px solid var(--border-light)', borderRadius:8, padding:'5px 10px' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

        {emailSent ? (
          /* ── STATE: Email just sent this session ── */
          <>
            {/* Non-clickable confirmation — email is sent */}
            <div style={{ width:'100%', height:48, background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, fontSize:14, fontWeight:700, color:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              Email Sent — Check Your Inbox
            </div>

            {/* Resend Invoice — opens the email flow again from scratch */}
            <button onClick={resendEmail}
              style={{ width:'100%', height:44, background:'var(--text)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
              </svg>
              Resend Invoice
            </button>

            {/* Copy payment link */}
            <button onClick={copyLink}
              style={{ width:'100%', height:44, background:copied?'#22C55E':'var(--accent)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              {copied ? '✓ Link Copied!' : '🔗 Copy Payment Link'}
            </button>
          </>
        ) : isPaid ? (
          /* ── STATE: Invoice is paid — receipt view ── */
          <>
            <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:'16px 18px', display:'flex', alignItems:'center', gap:12, marginBottom:2 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'#16A34A' }}>Payment Received</p>
                {invoice.paid_at && <p style={{ fontSize:12, color:'#15803D' }}>Paid on {fmtDate(invoice.paid_at, true)}</p>}
              </div>
            </div>
            <a href={'/api/invoice-pdf?id=' + id} target="_blank" rel="noreferrer"
              style={{ display:'block', width:'100%', height:46, background:'var(--text)', color:'white', borderRadius:12, fontSize:14, fontWeight:600, textDecoration:'none', lineHeight:'46px', textAlign:'center' }}>
              ⬇ Download Invoice PDF
            </a>
            <button onClick={copyLink}
              style={{ width:'100%', height:40, background:copied?'#22C55E':'var(--bg-secondary)', border:'1px solid var(--border-light)', borderRadius:10, fontSize:13, fontWeight:500, color:copied?'white':'var(--text-muted)', cursor:'pointer' }}>
              {copied ? '✓ Link Copied!' : '🔗 Copy Payment Link'}
            </button>
          </>
        ) : (
          /* ── STATE: Existing unpaid invoice from list ── */
          <>
            {/* Send invoice email */}
            {invoice.customers?.email ? (
              <button onClick={sendEmail}
                style={{ width:'100%', height:48, background:'var(--text)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
                </svg>
                Send Invoice to {invoice.customers.email}
              </button>
            ) : (
              <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#92400E' }}>
                ⚠️ No email on this customer. Add one to their profile to send the invoice.
              </div>
            )}

            {/* Copy payment link */}
            <div style={{ background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:12, padding:'14px 16px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--accent)', marginBottom:8 }}>Customer Payment Link</p>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ flex:1, background:'white', borderRadius:8, padding:'8px 12px', border:'1px solid #DDD6FE', overflow:'hidden' }}>
                  <p style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{paymentLink}</p>
                </div>
                <button onClick={copyLink}
                  style={{ height:36, padding:'0 14px', background:copied?'#22C55E':'var(--accent)', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize:11, color:'#9CA3AF', marginTop:6 }}>Customer pays by card, bank transfer, or USSD</p>
            </div>

            {/* Download PDF */}
            <a href={'/api/invoice-pdf?id=' + id} target="_blank" rel="noreferrer"
              style={{ display:'block', width:'100%', height:42, background:'var(--bg-secondary)', border:'1px solid var(--border-light)', borderRadius:10, fontSize:13, fontWeight:500, color:'var(--text-muted)', textDecoration:'none', lineHeight:'42px', textAlign:'center' }}>
              ⬇ Download PDF
            </a>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){
          .from-to-grid{grid-template-columns:1fr !important;}
          .meta-grid{grid-template-columns:1fr 1fr !important;}
        }
      `}</style>
    </div>
  )
}
