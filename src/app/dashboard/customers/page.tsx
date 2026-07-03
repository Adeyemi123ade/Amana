'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const supabase = createClient()

const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid var(--border-light)', fontSize:14, color:'var(--text)', outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'var(--text-secondary)', marginBottom:6 }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', notes:'' })
  const wsRef = useRef<any>(null)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: ws, error: wsErr } = await supabase
      .from('workspaces').select('id,currency').eq('created_by', user.id).maybeSingle()
    if (wsErr || !ws) return
    setWorkspace(ws)
    wsRef.current = ws
    const { data } = await supabase
      .from('customers').select('*').eq('workspace_id', ws.id).order('created_at', { ascending: false })
    setCustomers(data || [])
  }

  useEffect(() => { load() }, [])

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleAdd = async () => {
    if (!form.name.trim()) { setError('Please enter the customer name'); return }
    if (!form.email.trim()) { setError('Please enter the customer email'); return }
    if (!EMAIL_RE.test(form.email.trim())) { setError('Please enter a valid email address'); return }
    const ws = wsRef.current
    if (!ws) { setError('Your workspace is still loading. Please wait a moment and try again.'); return }
    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('customers').insert({
      workspace_id: ws.id,
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      total_spent: 0,
    })

    setSaving(false)

    if (err) {
      // Show the real error message in plain language
      const msg = err.message || ''
      if (msg.includes('address') || msg.includes('column')) {
        setError('Database setup needed. Please contact support and mention: missing customer columns.')
      } else if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('A customer with this name already exists.')
      } else if (msg.includes('violates row-level') || msg.includes('policy')) {
        setError('You do not have permission to add customers. Please sign out and sign back in.')
      } else {
        setError(`Could not save customer: ${msg}`)
      }
      return
    }

    setForm({ name:'', email:'', phone:'', address:'', notes:'' })
    setShowModal(false)
    await load()
  }

  const currency = workspace?.currency || 'NGN'

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
        <h1 style={{fontSize:22, fontWeight:700, color:'var(--text)'}}>Customers</h1>
        <div style={{display:'flex', gap:8}}>
          {workspace && (
            <a href={`/api/export?type=customers&workspace=${workspace.id}`}
              style={{display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:'1px solid var(--border-light)', fontSize:13, fontWeight:600, color:'var(--text-muted)', textDecoration:'none', background:'var(--bg-secondary)'}}>
              ↓ Export CSV
            </a>
          )}
          <button onClick={() => { setShowModal(true); setError('') }}
            style={{display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'white', padding:'10px 18px', borderRadius:10, fontSize:14, fontWeight:600, border:'none', cursor:'pointer'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Customer
          </button>
        </div>
      </div>

      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid var(--border)'}}>
          <div style={{position:'relative'}}>
            <svg style={{position:'absolute', left:10, top:10}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
              style={{width:'100%', height:36, paddingLeft:34, paddingRight:12, borderRadius:8, border:'1px solid var(--border-light)', fontSize:13, outline:'none', boxSizing:'border-box', background:'white'}} />
          </div>
        </div>

        {paginated.length === 0 ? (
          <div style={{padding:'48px 20px', textAlign:'center'}}>
            <div style={{fontSize:40, marginBottom:12}}>👥</div>
            <p style={{fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:4}}>
              {search ? 'No customers found' : 'No customers yet'}
            </p>
            <p style={{fontSize:13, color:'var(--text-muted)'}}>
              {search ? 'Try a different name or number' : 'Click Add Customer above to get started'}
            </p>
          </div>
        ) : paginated.map((c: any) => (
          <Link key={c.id} href={`/dashboard/customers/${c.id}`}
            style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid var(--border)', textDecoration:'none'}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={{width:40, height:40, borderRadius:'50%', background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'var(--accent)', flexShrink:0}}>
                {c.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{fontSize:14, fontWeight:500, color:'var(--text)'}}>{c.name}</p>
                <p style={{fontSize:12, color:'var(--text-muted)'}}>
                  {[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact info'}
                </p>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:11, color:'var(--text-muted)'}}>Total Spent</p>
                <p style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>{formatCurrency(Number(c.total_spent || 0), currency)}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
          <div style={{background:'white', borderRadius:16, padding:'24px', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h2 style={{fontSize:18, fontWeight:700, color:'var(--text)'}}>Add Customer</h2>
              <button onClick={() => setShowModal(false)} style={{background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:24, lineHeight:1}}>×</button>
            </div>
            {error && (
              <div style={{background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#DC2626', marginBottom:14, lineHeight:1.5}}>
                {error}
              </div>
            )}
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div>
                <label style={lbl}>Full Name <span style={{color:'#EF4444'}}>*</span></label>
                <input style={inp} placeholder="e.g. Tunde Oladipo" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Email Address *</label>
                <input type="email" style={inp} placeholder="tunde@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                <p style={{fontSize:11,color:'#F59E0B',marginTop:3}}>Required for invoices and appointment emails</p>
              </div>
              <div>
                <label style={lbl}>Phone Number</label>
                <input type="tel" style={inp} placeholder="+234 812 345 6789" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Address</label>
                <input style={inp} placeholder="Lagos, Nigeria" value={form.address} onChange={e => setForm({...form, address:e.target.value})} />
              </div>
              <div>
                <label style={lbl}>Notes</label>
                <textarea style={{...inp, height:80, paddingTop:10, resize:'none'}} placeholder="Any notes about this customer..." value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
              </div>
              <div style={{display:'flex', gap:10}}>
                <button onClick={() => setShowModal(false)}
                  style={{flex:1, height:44, background:'white', border:'1px solid var(--border-light)', borderRadius:10, fontSize:14, color:'var(--text-secondary)', cursor:'pointer'}}>
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={saving}
                  style={{flex:2, height:44, background:'var(--accent)', border:'none', borderRadius:10, fontSize:14, fontWeight:600, color:'white', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                  {saving && <span style={{width:14, height:14, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
                  {saving ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
