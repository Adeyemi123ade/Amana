'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import { formatCurrency } from '@/lib/utils'

export default function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [invoice, setInvoice] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paid, setPaid] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: inv } = await supabase
        .from('invoices')
        .select('*, customers(*)')
        .eq('id', id)
        .single()
      if (!inv) { setLoading(false); return }
      setInvoice(inv)
      if (inv.status === 'PAID') setPaid(true)
      const { data: ws } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', inv.workspace_id)
        .single()
      setWorkspace(ws)
      setLoading(false)

      // ── AUTO-VERIFY on return from Paystack ──────────────
      const urlParams = new URLSearchParams(window.location.search)
      // Clean any URL params immediately — DB is the only source of truth for PAID status
      if (urlParams.toString()) {
        window.history.replaceState({}, '', `/invoice/${id}`)
      }
      const verifyRef = urlParams.get('verify') || urlParams.get('reference') || urlParams.get('trxref')
      if (verifyRef && inv.status !== 'PAID') {
        setVerifying(true)
        try {
          const res = await fetch('/api/paystack-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: verifyRef, invoiceId: id }),
          })
          const data = await res.json()
          if (data.success) {
            setPaid(true)
          } else {
            // Check if payment was abandoned (customer clicked back) vs a real failure
            const msg = (data.message || data.error || '').toLowerCase()
            const isAbandoned = msg.includes('abandon') || msg.includes('cancel') ||
              msg.includes('not success') || msg.includes('verification failed')
            if (isAbandoned) {
              setPayError('Payment was not completed. You have not been charged. Please select a payment method below to try again.')
            } else {
              setPayError(data.message || 'We could not confirm your payment. If you were charged, please contact the business with reference: ' + verifyRef)
            }
          }
        } catch {
          setPayError('Could not verify payment. If you were charged, contact the business with reference: ' + verifyRef)
        } finally {
          setVerifying(false)
          // Clean the URL
          window.history.replaceState({}, '', `/invoice/${id}`)
        }
      }
    }
    load()
  }, [id])

  const handlePay = async () => {
    setPaying(true)
    setPayError('')

    try {
      const res = await fetch('/api/paystack-initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: id }),
      })
      const data = await res.json()

      if (data.success && data.authorization_url) {
        // Redirect to Paystack's hosted payment page
        // Customer picks card / bank transfer / USSD / OPay there
        window.location.href = data.authorization_url
      } else {
        setPayError(data.error || 'Could not start payment. Please try again.')
        setPaying(false)
      }
    } catch {
      setPayError('Could not connect to payment processor. Please check your internet and try again.')
      setPaying(false)
    }
  }

  // ── Screens ──────────────────────────────────────────────

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F9FAFB' }}>
      <div style={{ width:32, height:32, border:'3px solid #7C3AED', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (verifying) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F9FAFB', padding:24, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:48, height:48, border:'4px solid #7C3AED', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite', marginBottom:20 }} />
      <p style={{ fontSize:17, fontWeight:700, color:'#111827', marginBottom:6 }}>Confirming your payment...</p>
      <p style={{ fontSize:14, color:'#6B7280' }}>Please wait, do not close this page.</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!invoice) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F9FAFB', padding:24, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
      <p style={{ fontSize:18, fontWeight:700, color:'#111827', marginBottom:8 }}>Invoice not found</p>
      <p style={{ fontSize:14, color:'#6B7280' }}>This payment link may be invalid or expired.</p>
    </div>
  )

  const currency = workspace?.currency || 'NGN'

  if (paid) return (
    <div style={{ minHeight:'100vh', background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:440, background:'white', borderRadius:20, padding:'40px 28px', boxShadow:'0 2px 24px rgba(0,0,0,0.1)', textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'#F0FDF4', border:'3px solid #22C55E', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 style={{ fontSize:24, fontWeight:800, color:'#111827', marginBottom:8 }}>Payment Confirmed!</h2>
        <p style={{ fontSize:14, color:'#6B7280', marginBottom:24 }}>Thank you. Invoice {invoice.invoice_number} has been paid successfully.</p>
        <div style={{ background:'#F9FAFB', borderRadius:14, padding:18, textAlign:'left' }}>
          {[
            ['Business', workspace?.name || ''],
            ['Amount Paid', formatCurrency(Number(invoice.total_amount), currency)],
            ['Invoice', invoice.invoice_number],
          ].map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:13, color:'#6B7280' }}>{l}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'#9CA3AF', marginTop:20 }}>A receipt has been sent to your email.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#F5F5F5', fontFamily:'system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7C3AED,#4C1D95)', padding:'20px 20px 24px' }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:26, height:26, background:'rgba(255,255,255,0.2)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{ color:'white', fontWeight:800, fontSize:15 }}>Amana</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>{workspace?.name} sent you an invoice</p>
        </div>
      </div>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'20px 16px' }}>

        {/* Invoice card */}
        <div style={{ background:'white', borderRadius:18, padding:24, marginBottom:14, boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
          {/* Business + status */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <p style={{ fontSize:11, color:'#9CA3AF', marginBottom:3 }}>From</p>
              <p style={{ fontSize:16, fontWeight:700, color:'#111827' }}>{workspace?.name}</p>
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:'#F59E0B', background:'#FFFBEB', border:'1px solid #FDE68A', padding:'4px 12px', borderRadius:20 }}>
              UNPAID
            </span>
          </div>

          {/* Amount — big and clear */}
          <div style={{ textAlign:'center', padding:'20px 0', borderTop:'1px solid #F3F4F6', borderBottom:'1px solid #F3F4F6', marginBottom:20 }}>
            <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:6 }}>Amount Due</p>
            <p style={{ fontSize:36, fontWeight:900, color:'#111827' }}>{formatCurrency(Number(invoice.total_amount), currency)}</p>
          </div>

          {/* Invoice details */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              ['Invoice Number', invoice.invoice_number],
              ['To', invoice.customers?.name || ''],
              ['Issued', new Date(invoice.issue_date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})],
              ['Due', new Date(invoice.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, color:'#6B7280' }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Line items */}
          {Array.isArray(invoice.items) && invoice.items.length > 0 && (
            <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #F3F4F6' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Items</p>
              {invoice.items.map((item: any, i: number) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:13, color:'#374151' }}>{item.description}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{formatCurrency(Number(item.amount), currency)}</span>
                </div>
              ))}
            </div>
          )}

          {invoice.notes && (
            <p style={{ fontSize:12, color:'#9CA3AF', fontStyle:'italic', marginTop:14, paddingTop:12, borderTop:'1px solid #F3F4F6' }}>{invoice.notes}</p>
          )}
        </div>

        {/* Error message */}
        {payError && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:12, padding:'12px 16px', marginBottom:14, fontSize:13, color:'#DC2626', lineHeight:1.6 }}>
            {payError}
          </div>
        )}

        {/* Pay button — single CTA */}
        <div style={{ background:'white', borderRadius:18, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.07)', marginBottom:14 }}>
          <p style={{ fontSize:13, color:'#6B7280', marginBottom:6, textAlign:'center' }}>
            Pay securely via card, bank transfer, USSD, or OPay
          </p>
          <p style={{ fontSize:11, color:'#9CA3AF', marginBottom:20, textAlign:'center' }}>
            Select your preferred payment method after clicking below
          </p>

          <button
            onClick={handlePay}
            disabled={paying}
            style={{
              width:'100%', height:56, background: paying ? '#6D28D9cc' : 'linear-gradient(135deg,#7C3AED,#6D28D9)',
              color:'white', border:'none', borderRadius:14, fontSize:16, fontWeight:800,
              cursor: paying ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              boxShadow:'0 4px 20px rgba(124,58,237,0.4)',
              transition:'opacity 0.2s',
            }}
          >
            {paying ? (
              <><span style={{ width:20, height:20, border:'2.5px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }} />Redirecting to payment...</>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Pay {formatCurrency(Number(invoice.total_amount), currency)}
              </>
            )}
          </button>

          {/* What Paystack offers */}
          <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:14, flexWrap:'wrap' }}>
            {['💳 Card', '🏦 Bank Transfer', '📱 USSD', '📲 OPay & More'].map(m => (
              <span key={m} style={{ fontSize:11, color:'#9CA3AF' }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:11, color:'#9CA3AF' }}>
            🔒 Secured by <strong style={{ color:'#7C3AED' }}>Paystack</strong> · 256-bit SSL encryption
          </p>
          <p style={{ fontSize:11, color:'#D1D5DB', marginTop:4 }}>
            Powered by <strong style={{ color:'#7C3AED' }}>Amana</strong>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
