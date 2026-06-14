'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const field: React.CSSProperties = {width:'100%',height:44,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:14,color:'#111827',outline:'none',boxSizing:'border-box',background:'white'}
const lbl: React.CSSProperties = {display:'block',fontSize:13,fontWeight:500,color:'#374151',marginBottom:6}

export default function CreateInvoicePage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([{ description: '', amount: '' }])
  const [form, setForm] = useState({ customerId:'', dueDate:'', notes:'', paymentMethod:'Paystack' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('*').eq('created_by', user?.id).single()
      setWorkspace(ws)
      if (ws) {
        const { data: custs } = await supabase.from('customers').select('id,name').eq('workspace_id', ws.id)
        setCustomers(custs || [])
      }
    }
    load()
  }, [])

  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const currencySymbol = workspace?.currency === 'USD' ? '$' : workspace?.currency === 'GBP' ? '£' : '₦'

  const handleSubmit = async (status: 'DRAFT' | 'UNPAID') => {
    if (!form.customerId) { setError('Please select a customer first'); return }
    if (!form.dueDate) { setError('Please set a due date for this invoice'); return }
    if (items.every(i => !i.description)) { setError('Please add at least one item or service'); return }
    if (!workspace) { setError('Your workspace is still loading. Please wait a moment and try again.'); return }
    setIsLoading(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: lastInv } = await supabase.from('invoices').select('invoice_number').eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(1).single()
      const lastNum = lastInv ? parseInt(lastInv.invoice_number.replace('INV-','')) : 1000
      const invoiceNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`
      const { data: inv, error: invErr } = await supabase.from('invoices').insert({
        workspace_id: workspace.id,
        customer_id: form.customerId,
        invoice_number: invoiceNumber,
        status,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: form.dueDate,
        items: items.filter(i => i.description),
        notes: form.notes || null,
        total_amount: total,
        payment_method: form.paymentMethod,
      }).select().single()
      if (invErr) throw invErr
      router.push(`/dashboard/invoices/${inv.id}`)
    } catch (e: any) {
      setError('We could not create this invoice. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{maxWidth:640,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <Link href="/dashboard/invoices" style={{color:'#6B7280',textDecoration:'none',display:'flex',alignItems:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <h1 style={{fontSize:20,fontWeight:700,color:'#111827'}}>Create Invoice</h1>
      </div>

      {error && <div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#DC2626',marginBottom:16}}>{error}</div>}

      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',padding:'24px'}}>
        {/* Customer */}
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <label style={lbl}>Customer</label>
            <Link href="/dashboard/customers" style={{fontSize:12,color:'#7C3AED',textDecoration:'none',fontWeight:500}}>+ New Customer</Link>
          </div>
          <select value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} style={field}>
            <option value="">Select customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Dates */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          <div>
            <label style={lbl}>Invoice Number</label>
            <input style={{...field, background:'#F9FAFB', color:'#6B7280'}} value="Auto-generated" readOnly />
          </div>
          <div>
            <label style={lbl}>Issue Date</label>
            <input type="date" style={field} defaultValue={new Date().toISOString().split('T')[0]} readOnly />
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={lbl}>Due Date</label>
          <input type="date" style={field} value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
        </div>

        {/* Items */}
        <div style={{marginBottom:20}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 120px 32px',gap:8,marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:500,color:'#6B7280'}}>Item / Description</span>
            <span style={{fontSize:12,fontWeight:500,color:'#6B7280'}}>Amount ({workspace?.currency || 'NGN'})</span>
            <span/>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 120px 32px',gap:8,marginBottom:8}}>
              <input style={field} placeholder="Website Design Services" value={item.description} onChange={e => { const n=[...items]; n[i].description=e.target.value; setItems(n) }} />
              <input type="number" style={field} placeholder="150,000" value={item.amount} onChange={e => { const n=[...items]; n[i].amount=e.target.value; setItems(n) }} />
              <button onClick={() => setItems(items.filter((_,j) => j!==i))} style={{height:44,width:32,background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',fontSize:18}}>×</button>
            </div>
          ))}
          <button onClick={() => setItems([...items, {description:'', amount:''}])} style={{background:'none',border:'none',cursor:'pointer',color:'#7C3AED',fontSize:13,fontWeight:500,padding:0,display:'flex',alignItems:'center',gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Item
          </button>
        </div>

        {/* Notes */}
        <div style={{marginBottom:20}}>
          <label style={lbl}>Notes (Optional)</label>
          <textarea style={{...field, height:80, paddingTop:10, resize:'none'}} placeholder="Thank you for your business!" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
        </div>

        {/* Payment method */}
        <div style={{marginBottom:24}}>
          <label style={lbl}>Payment Method</label>
          {['Paystack','Bank Transfer'].map(m => (
            <label key={m} style={{display:'flex',alignItems:'center',gap:10,padding:'12px',border:`1px solid ${form.paymentMethod===m?'#7C3AED':'#E5E7EB'}`,borderRadius:8,marginBottom:8,cursor:'pointer',background:form.paymentMethod===m?'#F5F3FF':'white'}}>
              <input type="radio" value={m} checked={form.paymentMethod===m} onChange={() => setForm({...form, paymentMethod:m})} style={{accentColor:'#7C3AED'}} />
              <span style={{fontSize:14,color:'#111827',fontWeight:500}}>{m}</span>
            </label>
          ))}
        </div>

        {/* Total */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px',background:'#F9FAFB',borderRadius:10,marginBottom:20}}>
          <span style={{fontSize:14,fontWeight:500,color:'#374151'}}>Total Amount</span>
          <span style={{fontSize:20,fontWeight:700,color:'#111827'}}>{currencySymbol}{total.toLocaleString()}</span>
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:10}}>
          <button onClick={() => handleSubmit('DRAFT')} disabled={isLoading} style={{flex:1,height:44,background:'white',border:'1px solid #E5E7EB',borderRadius:10,fontSize:14,fontWeight:600,color:'#374151',cursor:'pointer'}}>
            Save Draft
          </button>
          <button onClick={() => handleSubmit('UNPAID')} disabled={isLoading} style={{flex:2,height:44,background:'#7C3AED',border:'none',borderRadius:10,fontSize:14,fontWeight:600,color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            {isLoading && <span style={{width:14,height:14,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>}
            Save &amp; Send Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
