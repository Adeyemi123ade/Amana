'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const supabase = createClient()

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'Every week', MONTHLY: 'Every month',
  QUARTERLY: 'Every 3 months', YEARLY: 'Every year'
}

const field: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:9, border:'1px solid var(--border-light)', fontSize:14, color:'var(--text)', outline:'none', boxSizing:'border-box', background:'var(--bg-secondary)', fontFamily:'inherit' }
const label: React.CSSProperties = { display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.4 }

export default function RecurringPage() {
  const [rules, setRules] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerId: '', title: '', amount: '',
    frequency: 'MONTHLY', nextDue: '', notes: ''
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).single()
      setWorkspace(ws)
      if (!ws) return
      const [{ data: rr }, { data: cc }] = await Promise.all([
        supabase.from('recurring_invoices').select('*').eq('workspace_id', ws.id).order('created_at', { ascending: false }),
        supabase.from('customers').select('id,name,email').eq('workspace_id', ws.id).order('name'),
      ])
      // Merge customer names into rules — Supabase joins unreliable on this schema
      const custMap = Object.fromEntries((cc || []).map((c: any) => [c.id, c]))
      const rulesWithCustomers = (rr || []).map((r: any) => ({
        ...r,
        customers: custMap[r.customer_id] || null,
      }))
      setRules(rulesWithCustomers)
      setCustomers(cc || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!form.customerId) { setError('Please select a customer'); return }
    if (!form.title.trim()) { setError('Please enter a title'); return }
    if (!form.amount || isNaN(Number(form.amount))) { setError('Please enter a valid amount'); return }
    if (!form.nextDue) { setError('Please set the first due date'); return }
    setSaving(true); setError('')
    const { data, error: err } = await supabase.from('recurring_invoices').insert({
      workspace_id: workspace.id,
      customer_id: form.customerId,
      title: form.title.trim(),
      items: [{ description: form.title.trim(), amount: Number(form.amount) }],
      total_amount: Number(form.amount),
      frequency: form.frequency,
      next_due: form.nextDue,
      notes: form.notes.trim() || null,
      active: true,
    }).select('*, customers(name,email)').single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setRules(prev => [data, ...prev])
    setShowModal(false)
    setForm({ customerId:'', title:'', amount:'', frequency:'MONTHLY', nextDue:'', notes:'' })
  }

  const toggleActive = async (rule: any) => {
    const newActive = !rule.active
    await supabase.from('recurring_invoices').update({ active: newActive }).eq('id', rule.id)
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: newActive } : r))
  }

  const currency = workspace?.currency || 'NGN'
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
      <div style={{ width:24, height:24, border:'3px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:2 }}>Recurring Invoices</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Automatically generate invoices on a schedule</p>
        </div>
        <button onClick={() => { setShowModal(true); setError('') }}
          style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'white', padding:'10px 18px', borderRadius:10, fontSize:14, fontWeight:600, border:'none', cursor:'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Recurring Invoice
        </button>
      </div>

      {rules.length === 0 ? (
        <div style={{ background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'60px 20px', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔄</div>
          <p style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:4 }}>No recurring invoices yet</p>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Set up automatic invoices for retainer clients or subscriptions</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {rules.map(rule => (
            <div key={rule.id} style={{ background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                {/* Customer name — shown first and prominently */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--accent)', flexShrink:0 }}>
                    {(rule.customers?.name || '?')[0].toUpperCase()}
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--accent)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {rule.customers?.name || 'Unknown Customer'}
                  </p>
                  <span style={{ fontSize:10, fontWeight:700, color: rule.active ? '#22C55E' : '#9CA3AF', background: rule.active ? '#F0FDF4' : 'var(--bg-secondary)', padding:'2px 7px', borderRadius:10, flexShrink:0 }}>
                    {rule.active ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>
                {/* Service title */}
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 }}>{rule.title}</p>
                <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                  {FREQ_LABELS[rule.frequency]} · Next: {new Date(rule.next_due).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:6 }}>{formatCurrency(Number(rule.total_amount), currency)}</p>
                <button onClick={() => toggleActive(rule)}
                  style={{ fontSize:12, fontWeight:600, color: rule.active ? '#EF4444' : '#22C55E', background:'none', border:`1px solid ${rule.active ? '#FEE2E2' : '#BBF7D0'}`, padding:'4px 10px', borderRadius:8, cursor:'pointer' }}>
                  {rule.active ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:'var(--card)', borderRadius:18, padding:24, width:'100%', maxWidth:440, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <p style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>New Recurring Invoice</p>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:20, lineHeight:1, padding:0 }}>×</button>
            </div>
            {error && <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', marginBottom:14, fontSize:13, color:'#DC2626' }}>{error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={label}>Customer *</label>
                <select style={field} value={form.customerId} onChange={e => setForm({...form, customerId:e.target.value})}>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Invoice Title *</label>
                <input style={field} placeholder="e.g. Monthly Retainer — Social Media" value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
              </div>
              <div>
                <label style={label}>Amount *</label>
                <input type="number" style={field} placeholder="0.00" min="0" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} />
              </div>
              <div>
                <label style={label}>Frequency *</label>
                <select style={field} value={form.frequency} onChange={e => setForm({...form, frequency:e.target.value})}>
                  <option value="WEEKLY">Every week</option>
                  <option value="MONTHLY">Every month</option>
                  <option value="QUARTERLY">Every 3 months</option>
                  <option value="YEARLY">Every year</option>
                </select>
              </div>
              <div>
                <label style={label}>First Invoice Date *</label>
                <input type="date" style={field} min={minDate.toISOString().split('T')[0]} value={form.nextDue} onChange={e => setForm({...form, nextDue:e.target.value})} />
              </div>
              <div>
                <label style={label}>Notes</label>
                <textarea style={{...field, height:68, paddingTop:10, resize:'none'} as any} placeholder="Optional notes for this invoice..." value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setShowModal(false)}
                  style={{ flex:1, height:44, background:'var(--bg-secondary)', border:'1px solid var(--border-light)', borderRadius:10, fontSize:14, fontWeight:600, color:'var(--text-muted)', cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex:2, height:44, background:'var(--accent)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : 'Create Recurring Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
