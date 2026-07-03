'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const supabase = createClient()

const field: React.CSSProperties = {width:'100%',height:44,padding:'0 12px',borderRadius:8,border:'1px solid var(--border-light)',fontSize:14,color:'var(--text)',outline:'none',boxSizing:'border-box',background:'var(--card)'}
const lbl: React.CSSProperties = {display:'block',fontSize:13,fontWeight:500,color:'var(--text-secondary)',marginBottom:6}

export default function CreateInvoicePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const wsRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([{ description: '', amount: '' }])
  const [form, setForm] = useState({ customerId:'', dueDate:'', notes:'', paymentMethod:'Paystack' })
  const [taxRate, setTaxRate] = useState(0)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ws } = await supabase.from('workspaces').select('*').eq('created_by', user.id).maybeSingle()
      if (ws) {
        setWorkspace(ws)
        wsRef.current = ws
        const { data: custs } = await supabase.from('customers').select('id,name,email,phone').eq('workspace_id', ws.id)
        setCustomers(custs || [])
        // Pre-select customer if passed in URL (?customer=ID)
        const params = new URLSearchParams(window.location.search)
        const preCustomer = params.get('customer')
        if (preCustomer && custs?.some(c => c.id === preCustomer)) {
          setForm(f => ({ ...f, customerId: preCustomer }))
        }
      }
    }
    load()
  }, [])

  const ws = wsRef.current || workspace
  const currency = (ws?.currency || 'NGN') as string
  const symbolMap: Record<string, string> = { NGN:'₦', USD:'$', GBP:'£', EUR:'€', GHS:'GH₵', KES:'KSh', ZAR:'R', AED:'AED', SAR:'SAR', CAD:'CA$', AUD:'A$', INR:'₹' }
  const currencySymbol = symbolMap[currency] || currency
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const handleSubmit = async (status: 'DRAFT' | 'UNPAID') => {
    if (!form.customerId) { setError('Please select a customer first'); return }
    if (!form.dueDate) { setError('Please set a due date for this invoice'); return }
    const today = new Date(); today.setHours(0,0,0,0)
    if (new Date(form.dueDate) < today) { setError('Due date cannot be in the past. Please select today or a future date.'); return }
    // Warn if selected customer has no email — Paystack will reject payment
    const selCust = customers.find((c: any) => c.id === form.customerId)
    if (!selCust?.email?.trim()) { setError('This customer has no email address. Paystack requires a customer email to process payment. Please add an email to this customer first.'); return }
    if (items.every(i => !i.description.trim())) { setError('Please add at least one item or service name'); return }
    if (items.some(i => i.description.trim() && (!i.amount || parseFloat(i.amount) <= 0))) {
      setError('Please enter an amount greater than 0 for each item'); return
    }
    if (subtotal <= 0) { setError('Invoice total must be greater than 0'); return }
    if (!ws) { setError('Your workspace is still loading. Please wait and try again.'); return }

    setIsLoading(true)
    setError('')

    // Get next invoice number
    const { data: lastInv } = await supabase
      .from('invoices').select('invoice_number').eq('workspace_id', ws.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()

    let nextNum = 1001
    if (lastInv?.invoice_number) {
      const num = parseInt(lastInv.invoice_number.replace(/\D/g, ''))
      if (!isNaN(num)) nextNum = num + 1
    }
    const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`

    const { data: inv, error: invErr } = await supabase.from('invoices').insert({
      workspace_id: ws.id,
      customer_id: form.customerId,
      invoice_number: invoiceNumber,
      status,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: form.dueDate,
      items: items.filter(i => i.description.trim()),
      notes: form.notes.trim() || null,
      total_amount: total,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      subtotal: subtotal,
      payment_method: form.paymentMethod,
    }).select('id').single()

    setIsLoading(false)

    if (invErr) {
      const msg = invErr.message || ''
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('An invoice with this number already exists. Please try again.')
      } else if (msg.includes('violates row-level') || msg.includes('policy')) {
        setError('Permission issue. Please sign out and sign back in.')
      } else if (msg.includes('foreign key') || msg.includes('customer')) {
        setError('The selected customer could not be found. Please try selecting again.')
      } else {
        setError(`Could not create invoice: ${msg}`)
      }
      return
    }

    // Create notification
    await supabase.from('notifications').insert({
      workspace_id: ws.id, read: false, type: 'invoice',
      title: 'Invoice created',
      description: `${invoiceNumber} for ${formatCurrency(total, currency)} — ${status === 'DRAFT' ? 'saved as draft' : 'ready to send'}`,
      link: `/dashboard/invoices/${inv.id}`,
    })
    router.push(`/dashboard/invoices/${inv.id}`)
  }

  return (
    <div style={{maxWidth:640, margin:'0 auto'}}>
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:24}}>
        <Link href="/dashboard/invoices" style={{color:'var(--text-muted)', textDecoration:'none', display:'flex', alignItems:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <h1 style={{fontSize:20, fontWeight:700, color:'var(--text)'}}>Create Invoice</h1>
      </div>

      {error && (
        <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:16, lineHeight:1.5}}>
          {error}
        </div>
      )}

      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'24px'}}>
        {/* Customer */}
        <div style={{marginBottom:18}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
            <label style={lbl}>Customer <span style={{color:'#EF4444'}}>*</span></label>
            <Link href="/dashboard/customers" style={{fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:500}}>+ New Customer</Link>
          </div>
          <select value={form.customerId} onChange={e => setForm({...form, customerId:e.target.value})} style={field}>
            <option value="">Select customer...</option>
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.email ? ' — ' + c.email : ' ⚠️ no email'}</option>)}
          </select>
          {form.customerId && (() => {
            const sc = customers.find((c: any) => c.id === form.customerId)
            return sc ? (
              <div style={{marginTop:8, padding:'8px 12px', background:'#F5F3FF', borderRadius:8, border:'1px solid #DDD6FE', fontSize:12}}>
                <span style={{fontWeight:600, color:'var(--accent)'}}>{sc.name}</span>
                {sc.email
                  ? <span style={{color:'var(--text-muted)'}}> · {sc.email}</span>
                  : <span style={{color:'#EF4444'}}> · ⚠️ No email — add one before payment</span>}
              </div>
            ) : null
          })()}
          {customers.length === 0 && (
            <p style={{fontSize:11, color:'#F59E0B', marginTop:4}}>No customers yet. <Link href="/dashboard/customers" style={{color:'var(--accent)', textDecoration:'none', fontWeight:500}}>Add a customer first</Link>.</p>
          )}
        </div>

        {/* Dates */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18}}>
          <div>
            <label style={lbl}>Invoice Number</label>
            <input style={{...field, background:'var(--bg)', color:'#9CA3AF'}} value="Auto-generated" readOnly />
          </div>
          <div>
            <label style={lbl}>Due Date <span style={{color:'#EF4444'}}>*</span></label>
            <input type="date" style={field} value={form.dueDate} onChange={e => setForm({...form, dueDate:e.target.value})} />
          </div>
        </div>

        {/* Items */}
        <div style={{marginBottom:18}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 120px 32px', gap:8, marginBottom:8}}>
            <span style={{fontSize:12, fontWeight:600, color:'var(--text-muted)'}}>Item / Description</span>
            <span style={{fontSize:12, fontWeight:600, color:'var(--text-muted)'}}>Amount</span>
            <span/>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'1fr 120px 32px', gap:8, marginBottom:8}}>
              <input style={field} placeholder="e.g. Website Design" value={item.description} onChange={e => { const n=[...items]; n[i].description=e.target.value; setItems(n) }} />
              <input type="number" style={field} placeholder="0.00" value={item.amount} onChange={e => { const n=[...items]; n[i].amount=e.target.value; setItems(n) }} />
              <button onClick={() => items.length > 1 && setItems(items.filter((_,j) => j!==i))}
                style={{height:44, width:32, background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:20}}>×</button>
            </div>
          ))}
          <button onClick={() => setItems([...items, {description:'', amount:''}])}
            style={{background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:13, fontWeight:500, padding:0, display:'flex', alignItems:'center', gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Item
          </button>
        </div>

        {/* Notes */}
        <div style={{marginBottom:18}}>
          <label style={lbl}>Notes (Optional)</label>
          <textarea style={{...field, height:70, paddingTop:10, resize:'none'}} placeholder="Thank you for your business!" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
        </div>

        {/* Payment method */}
        <div style={{marginBottom:20}}>
          <label style={lbl}>Payment Method</label>
          {['Paystack','Bank Transfer'].map(m => (
            <label key={m} style={{display:'flex', alignItems:'center', gap:10, padding:'12px', border:`1px solid ${form.paymentMethod===m?'var(--accent)':'var(--border-light)'}`, borderRadius:8, marginBottom:8, cursor:'pointer', background:form.paymentMethod===m?'#F5F3FF':'white'}}>
              <input type="radio" value={m} checked={form.paymentMethod===m} onChange={() => setForm({...form, paymentMethod:m})} style={{accentColor:'var(--accent)'}} />
              <span style={{fontSize:14, color:'var(--text)', fontWeight:500}}>{m}</span>
            </label>
          ))}
        </div>

        {/* Tax / VAT */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, padding:'0 2px'}}>
          <label style={{fontSize:13, fontWeight:500, color:'var(--text-secondary)'}}>Tax / VAT (%)</label>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <input type="number" min="0" max="100" step="0.5" value={taxRate || ''} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
              placeholder="0"
              style={{width:70, height:36, padding:'0 10px', borderRadius:8, border:'1px solid var(--border-light)', fontSize:13, textAlign:'right', outline:'none', color:'var(--text)', background:'var(--card)'}} />
            <span style={{fontSize:13, color:'var(--text-muted)'}}>%</span>
          </div>
        </div>

        {/* Total */}
        <div style={{background:'var(--bg)', borderRadius:10, padding:'12px 16px', marginBottom:20}}>
          {taxRate > 0 && (
            <>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                <span style={{fontSize:13, color:'var(--text-muted)'}}>Subtotal</span>
                <span style={{fontSize:13, color:'var(--text-secondary)'}}>{currencySymbol}{subtotal.toLocaleString()}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                <span style={{fontSize:13, color:'var(--text-muted)'}}>Tax ({taxRate}%)</span>
                <span style={{fontSize:13, color:'var(--text-secondary)'}}>{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
            </>
          )}
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span style={{fontSize:14, fontWeight:700, color:'var(--text)'}}>Total Amount</span>
            <span style={{fontSize:20, fontWeight:800, color:'var(--text)'}}>{currencySymbol}{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{display:'flex', gap:10}}>
          <button onClick={() => handleSubmit('DRAFT')} disabled={isLoading}
            style={{flex:1, height:44, background:'var(--card)', border:'1px solid var(--border-light)', borderRadius:10, fontSize:14, fontWeight:600, color:'var(--text-secondary)', cursor:'pointer', opacity:isLoading?0.7:1}}>
            Save Draft
          </button>
          <button onClick={() => handleSubmit('UNPAID')} disabled={isLoading}
            style={{flex:2, height:44, background:'var(--accent)', border:'none', borderRadius:10, fontSize:14, fontWeight:600, color:'white', cursor:isLoading?'not-allowed':'pointer', opacity:isLoading?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
            {isLoading && <span style={{width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
            {isLoading ? 'Creating...' : 'Save & Send Invoice'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
