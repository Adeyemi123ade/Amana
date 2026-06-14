'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import { formatCurrency } from '@/lib/utils'

export default function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [invoice, setInvoice] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payMethod, setPayMethod] = useState<'paystack'|'bank'|null>(null)
  const [receipt, setReceipt] = useState<File|null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: inv } = await supabase.from('invoices').select('*, customers(*)').eq('id', id).single()
      if (!inv) { setLoading(false); return }
      setInvoice(inv)
      setCustomer(inv.customers)
      if (inv.status === 'PAID') setPaid(true)
      const { data: ws } = await supabase.from('workspaces').select('*').eq('id', inv.workspace_id).single()
      setWorkspace(ws)
      setLoading(false)
    }
    load()
  }, [id])

  const handlePaystack = () => {
    if (!invoice || !workspace) return
    const amount = Math.round(Number(invoice.total_amount) * 100)
    const email = customer?.email || 'customer@email.com'
    const ref = `INV-${invoice.invoice_number}-${Date.now()}`
    const key = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const url = `https://checkout.paystack.com/initialize?key=${key}&email=${encodeURIComponent(email)}&amount=${amount}&ref=${ref}&callback_url=${encodeURIComponent(`${window.location.origin}/invoice/${id}/verify?ref=${ref}`)}`
    window.location.href = url
  }

  const handleBankSubmit = async () => {
    if (!receipt) return
    setUploading(true)
    try {
      const ext = receipt.name.split('.').pop()
      const path = `receipts/${id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('receipts').upload(path, receipt, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('receipts').getPublicUrl(path)
      await supabase.from('invoices').update({
        status: 'PENDING_VERIFICATION',
        bank_receipt_url: data.publicUrl,
      }).eq('id', id)
      setSubmitted(true)
    } catch (e) {

    } finally {
      setUploading(false)
    }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F9FAFB',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <div style={{width:32,height:32,border:'3px solid #7C3AED',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  )

  if (!invoice) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#F9FAFB',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",padding:24}}>
      <div style={{fontSize:48,marginBottom:16}}>🔍</div>
      <p style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:8}}>Invoice not found</p>
      <p style={{fontSize:14,color:'#6B7280'}}>This invoice link may be invalid or expired.</p>
    </div>
  )

  const currency = workspace?.currency || 'NGN'
  const currSymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₦'

  if (paid || invoice.status === 'PAID') return (
    <div style={{minHeight:'100vh',background:'#F9FAFB',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <div style={{width:'100%',maxWidth:480,background:'white',borderRadius:20,padding:'40px 32px',boxShadow:'0 2px 16px rgba(0,0,0,0.08)',textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'#F0FDF4',border:'3px solid #22C55E',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 style={{fontSize:22,fontWeight:800,color:'#111827',marginBottom:8}}>Payment Confirmed!</h2>
        <p style={{fontSize:14,color:'#6B7280',marginBottom:20}}>Invoice {invoice.invoice_number} has been paid successfully.</p>
        <div style={{background:'#F9FAFB',borderRadius:12,padding:'16px',textAlign:'left',marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:13,color:'#6B7280'}}>Amount paid</span>
            <span style={{fontSize:13,fontWeight:700,color:'#111827'}}>{formatCurrency(Number(invoice.total_amount),currency)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:13,color:'#6B7280'}}>Invoice</span>
            <span style={{fontSize:13,fontWeight:500,color:'#111827'}}>{invoice.invoice_number}</span>
          </div>
        </div>
        <p style={{fontSize:12,color:'#9CA3AF'}}>Powered by Amana · {workspace?.name}</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{minHeight:'100vh',background:'#F9FAFB',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <div style={{width:'100%',maxWidth:480,background:'white',borderRadius:20,padding:'40px 32px',boxShadow:'0 2px 16px rgba(0,0,0,0.08)',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>📨</div>
        <h2 style={{fontSize:22,fontWeight:800,color:'#111827',marginBottom:8}}>Receipt Submitted!</h2>
        <p style={{fontSize:14,color:'#6B7280',marginBottom:8}}>Your payment receipt has been sent to {workspace?.name} for verification.</p>
        <p style={{fontSize:13,color:'#9CA3AF'}}>You will be notified once it is confirmed.</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F5F5F5',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      {/* Amana branded header */}
      <div style={{background:'#7C3AED',padding:'20px 24px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:6}}>
          <div style={{width:28,height:28,background:'rgba(255,255,255,0.2)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{color:'white',fontWeight:800,fontSize:16}}>Amana</span>
        </div>
        <p style={{color:'rgba(255,255,255,0.8)',fontSize:13}}>{workspace?.name} sent you an invoice</p>
      </div>

      <div style={{maxWidth:520,margin:'0 auto',padding:'24px 16px'}}>
        {/* Invoice card */}
        <div style={{background:'white',borderRadius:16,padding:'24px',marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
            <div>
              <p style={{fontSize:13,color:'#6B7280',marginBottom:2}}>Invoice from</p>
              <p style={{fontSize:16,fontWeight:700,color:'#111827'}}>{workspace?.name}</p>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:'#F59E0B',background:'#FFFBEB',padding:'4px 10px',borderRadius:20}}>UNPAID</span>
          </div>

          <div style={{borderTop:'1px solid #F3F4F6',paddingTop:16,marginBottom:16}}>
            <p style={{fontSize:11,color:'#9CA3AF',marginBottom:4}}>Invoice number</p>
            <p style={{fontSize:14,fontWeight:600,color:'#111827',marginBottom:12}}>{invoice.invoice_number}</p>
            <p style={{fontSize:11,color:'#9CA3AF',marginBottom:4}}>Amount due</p>
            <p style={{fontSize:32,fontWeight:900,color:'#111827',marginBottom:12}}>{formatCurrency(Number(invoice.total_amount),currency)}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <p style={{fontSize:11,color:'#9CA3AF',marginBottom:2}}>Issue Date</p>
                <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{new Date(invoice.issue_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
              </div>
              <div>
                <p style={{fontSize:11,color:'#9CA3AF',marginBottom:2}}>Due Date</p>
                <p style={{fontSize:13,fontWeight:500,color:'#EF4444'}}>{new Date(invoice.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          {Array.isArray(invoice.items) && invoice.items.length > 0 && (
            <div style={{borderTop:'1px solid #F3F4F6',paddingTop:14,marginBottom:14}}>
              <p style={{fontSize:12,fontWeight:600,color:'#6B7280',marginBottom:10,textTransform:'uppercase',letterSpacing:0.4}}>Items</p>
              {invoice.items.map((item: any, i: number) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <p style={{fontSize:13,color:'#374151'}}>{item.description}</p>
                  <p style={{fontSize:13,fontWeight:600,color:'#111827',flexShrink:0,marginLeft:12}}>{formatCurrency(Number(item.amount),currency)}</p>
                </div>
              ))}
              <div style={{borderTop:'1px solid #F3F4F6',paddingTop:10,display:'flex',justifyContent:'space-between'}}>
                <p style={{fontSize:14,fontWeight:700,color:'#111827'}}>Total</p>
                <p style={{fontSize:14,fontWeight:700,color:'#111827'}}>{formatCurrency(Number(invoice.total_amount),currency)}</p>
              </div>
            </div>
          )}

          {invoice.notes && <p style={{fontSize:13,color:'#6B7280',fontStyle:'italic',borderTop:'1px solid #F3F4F6',paddingTop:12}}>{invoice.notes}</p>}
        </div>

        {/* Payment method selection */}
        {!payMethod ? (
          <div style={{background:'white',borderRadius:16,padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <p style={{fontSize:14,fontWeight:700,color:'#111827',marginBottom:16}}>How would you like to pay?</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <button onClick={() => setPayMethod('paystack')}
                style={{display:'flex',alignItems:'center',gap:14,padding:'16px',border:'2px solid #E5E7EB',borderRadius:12,background:'white',cursor:'pointer',textAlign:'left',transition:'border-color 0.15s'}}>
                <div style={{width:40,height:40,borderRadius:10,background:'#E8F5E9',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                </div>
                <div>
                  <p style={{fontSize:14,fontWeight:600,color:'#111827',marginBottom:2}}>Pay with Paystack</p>
                  <p style={{fontSize:12,color:'#6B7280'}}>Card, Bank Transfer, USSD — instant confirmation</p>
                </div>
              </button>
              <button onClick={() => setPayMethod('bank')}
                style={{display:'flex',alignItems:'center',gap:14,padding:'16px',border:'2px solid #E5E7EB',borderRadius:12,background:'white',cursor:'pointer',textAlign:'left'}}>
                <div style={{width:40,height:40,borderRadius:10,background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                </div>
                <div>
                  <p style={{fontSize:14,fontWeight:600,color:'#111827',marginBottom:2}}>Bank Transfer</p>
                  <p style={{fontSize:12,color:'#6B7280'}}>Transfer to account and upload receipt</p>
                </div>
              </button>
            </div>
          </div>
        ) : payMethod === 'paystack' ? (
          <div style={{background:'white',borderRadius:16,padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <button onClick={() => setPayMethod(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#6B7280',padding:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </button>
              <p style={{fontSize:14,fontWeight:700,color:'#111827'}}>Pay with Paystack</p>
            </div>
            <div style={{background:'#F9FAFB',borderRadius:10,padding:'14px',marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,color:'#6B7280'}}>Amount</span>
                <span style={{fontSize:13,fontWeight:700,color:'#111827'}}>{formatCurrency(Number(invoice.total_amount),currency)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:13,color:'#6B7280'}}>Invoice</span>
                <span style={{fontSize:13,color:'#111827'}}>{invoice.invoice_number}</span>
              </div>
            </div>
            <button onClick={handlePaystack}
              style={{width:'100%',height:50,background:'#16A34A',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              Pay {formatCurrency(Number(invoice.total_amount),currency)} Now
            </button>
            <p style={{fontSize:11,color:'#9CA3AF',textAlign:'center',marginTop:10}}>Secured by Paystack · Your payment info is encrypted</p>
          </div>
        ) : (
          <div style={{background:'white',borderRadius:16,padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <button onClick={() => setPayMethod(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#6B7280',padding:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </button>
              <p style={{fontSize:14,fontWeight:700,color:'#111827'}}>Bank Transfer Details</p>
            </div>
            <div style={{background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:12,padding:'16px',marginBottom:16}}>
              <p style={{fontSize:12,fontWeight:700,color:'#7C3AED',marginBottom:10,textTransform:'uppercase',letterSpacing:0.4}}>Transfer to this account</p>
              {workspace?.bank_name && <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:13,color:'#6B7280'}}>Bank</span><span style={{fontSize:13,fontWeight:600,color:'#111827'}}>{workspace.bank_name}</span></div>}
              {workspace?.account_number && <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:13,color:'#6B7280'}}>Account Number</span><span style={{fontSize:14,fontWeight:700,color:'#111827',letterSpacing:1}}>{workspace.account_number}</span></div>}
              {workspace?.account_name && <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:13,color:'#6B7280'}}>Account Name</span><span style={{fontSize:13,fontWeight:600,color:'#111827'}}>{workspace.account_name}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid #DDD6FE'}}>
                <span style={{fontSize:13,color:'#6B7280'}}>Amount</span>
                <span style={{fontSize:14,fontWeight:800,color:'#7C3AED'}}>{formatCurrency(Number(invoice.total_amount),currency)}</span>
              </div>
              {(!workspace?.bank_name && !workspace?.account_number) && (
                <p style={{fontSize:12,color:'#9CA3AF',textAlign:'center',marginTop:8}}>Bank details not set up yet. Contact {workspace?.name} directly.</p>
              )}
            </div>
            <div style={{marginBottom:16}}>
              <p style={{fontSize:13,fontWeight:600,color:'#111827',marginBottom:8}}>Upload payment receipt</p>
              <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'2px dashed #E5E7EB',borderRadius:10,padding:'20px',cursor:'pointer',background: receipt ? '#F0FDF4' : 'white',borderColor: receipt ? '#22C55E' : '#E5E7EB'}}>
                <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e => setReceipt(e.target.files?.[0]||null)} />
                {receipt ? (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    <p style={{fontSize:13,color:'#16A34A',fontWeight:600,marginTop:6}}>{receipt.name}</p>
                    <p style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Tap to change</p>
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    <p style={{fontSize:13,color:'#9CA3AF',marginTop:6}}>Tap to upload receipt</p>
                    <p style={{fontSize:11,color:'#D1D5DB',marginTop:2}}>JPG, PNG or PDF</p>
                  </>
                )}
              </label>
            </div>
            <button onClick={handleBankSubmit} disabled={!receipt||uploading}
              style={{width:'100%',height:50,background:'#7C3AED',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',opacity:!receipt?0.5:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {uploading && <span style={{width:16,height:16,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>}
              Submit Payment Receipt
            </button>
          </div>
        )}

        <p style={{textAlign:'center',fontSize:11,color:'#9CA3AF',marginTop:16}}>
          Powered by <strong style={{color:'#7C3AED'}}>Amana</strong> · Secure Business Payments
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
