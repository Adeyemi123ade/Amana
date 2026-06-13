'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [invoice, setInvoice] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).single()
      setWorkspace(ws)
      const { data: inv } = await supabase.from('invoices').select('*, customers(name,phone,email)').eq('id', id).single()
      setInvoice(inv)
      setLoading(false)
    }
    load()
  }, [id])

  const paymentLink = typeof window !== 'undefined' ? `${window.location.origin}/invoice/${id}` : `/invoice/${id}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const markPaid = async () => {
    await supabase.from('invoices').update({ status:'PAID', paid_at: new Date().toISOString() }).eq('id', id)
    setInvoice((prev: any) => ({...prev, status:'PAID'}))
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{width:28,height:28,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  )

  if (!invoice) return (
    <div style={{textAlign:'center',padding:48}}>
      <p style={{color:'var(--text-muted)'}}>Invoice not found</p>
      <Link href="/dashboard/invoices" style={{color:'var(--accent)',textDecoration:'none'}}>Back to invoices</Link>
    </div>
  )

  const currency = workspace?.currency || 'NGN'
  const statusColor: Record<string,[string,string]> = {
    PAID:['#22C55E','#F0FDF4'], UNPAID:['#F59E0B','#FFFBEB'],
    OVERDUE:['#EF4444','#FEF2F2'], DRAFT:['#6B7280','#F9FAFB'],
    PENDING_VERIFICATION:['#7C3AED','#EDE9FE'],
  }
  const [sc, sb] = statusColor[invoice.status] || ['#6B7280','#F9FAFB']

  return (
    <div style={{maxWidth:560, margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <Link href="/dashboard/invoices" style={{color:'var(--text-muted)',textDecoration:'none'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <h1 style={{fontSize:20,fontWeight:700,color:'var(--text)'}}>Invoice Details</h1>
      </div>

      {/* Payment link banner */}
      {invoice.status !== 'PAID' && invoice.status !== 'DRAFT' && (
        <div style={{background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:14,padding:'16px 18px',marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:600,color:'#7C3AED',marginBottom:8}}>📎 Payment Link — Share with customer</p>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{flex:1,background:'white',borderRadius:8,padding:'8px 12px',border:'1px solid #DDD6FE',overflow:'hidden'}}>
              <p style={{fontSize:12,color:'#6B7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{paymentLink}</p>
            </div>
            <button onClick={copyLink}
              style={{height:36,padding:'0 14px',background: copied ? '#22C55E' : '#7C3AED',color:'white',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',flexShrink:0,transition:'background 0.2s'}}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p style={{fontSize:11,color:'#9CA3AF',marginTop:6}}>Customer can pay by card, bank transfer, or upload receipt via this link</p>
        </div>
      )}

      <div style={{background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',padding:'24px'}}>
        {/* Status */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontSize:12,fontWeight:700,color:sc,background:sb,padding:'4px 12px',borderRadius:20}}>{invoice.status.replace('_',' ')}</span>
          {invoice.status === 'UNPAID' && (
            <button onClick={markPaid} style={{fontSize:12,fontWeight:600,color:'#22C55E',background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:8,padding:'5px 10px',cursor:'pointer'}}>
              Mark as Paid
            </button>
          )}
        </div>

        <p style={{fontSize:26,fontWeight:800,color:'var(--text)',marginBottom:4}}>{invoice.invoice_number}</p>
        <p style={{fontSize:15,fontWeight:500,color:'var(--text-secondary)',marginBottom:2}}>{invoice.customers?.name}</p>
        <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>{invoice.customers?.phone || invoice.customers?.email || ''}</p>

        <div style={{borderTop:'1px solid var(--border)',paddingTop:16,marginBottom:16}}>
          <p style={{fontSize:30,fontWeight:900,color:'var(--text)',marginBottom:14}}>{formatCurrency(Number(invoice.total_amount),currency)}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>Issue Date</p>
              <p style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{new Date(invoice.issue_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
            </div>
            <div>
              <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>Due Date</p>
              <p style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{new Date(invoice.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
            </div>
          </div>

          {Array.isArray(invoice.items) && invoice.items.map((item: any, i: number) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <p style={{fontSize:13,color:'var(--text-secondary)'}}>{item.description}</p>
              <p style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{formatCurrency(Number(item.amount),currency)}</p>
            </div>
          ))}
          {invoice.notes && <p style={{fontSize:13,color:'var(--text-muted)',marginTop:12,fontStyle:'italic'}}>{invoice.notes}</p>}
        </div>

        {invoice.payment_method && (
          <div style={{marginBottom:16}}>
            <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>Payment Method</p>
            <p style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{invoice.payment_method}</p>
          </div>
        )}

        {invoice.paid_at && (
          <div style={{marginBottom:16}}>
            <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:2}}>Paid on</p>
            <p style={{fontSize:13,fontWeight:500,color:'#22C55E'}}>{new Date(invoice.paid_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
          </div>
        )}

        {/* Bank receipt preview */}
        {invoice.bank_receipt_url && (
          <div style={{marginBottom:16,padding:'12px',background:'#F9FAFB',borderRadius:10}}>
            <p style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:6}}>Bank Receipt Submitted</p>
            <a href={invoice.bank_receipt_url} target="_blank" rel="noreferrer" style={{fontSize:12,color:'#7C3AED',textDecoration:'none'}}>View receipt →</a>
          </div>
        )}

        {/* Actions */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <a href={paymentLink} target="_blank" rel="noreferrer"
            style={{display:'block',width:'100%',height:48,background:'var(--accent)',color:'white',border:'none',borderRadius:12,fontSize:14,fontWeight:600,cursor:'pointer',textDecoration:'none',lineHeight:'48px',textAlign:'center',boxSizing:'border-box'}}>
            Open Payment Page
          </a>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <button onClick={copyLink}
              style={{height:40,background:'var(--card)',border:'1px solid var(--border-light)',borderRadius:10,fontSize:13,fontWeight:500,color:'var(--text-secondary)',cursor:'pointer'}}>
              {copied ? '✓ Copied' : 'Copy Link'}
            </button>
            <button style={{height:40,background:'var(--card)',border:'1px solid var(--border-light)',borderRadius:10,fontSize:13,fontWeight:500,color:'var(--text-secondary)',cursor:'pointer'}}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
