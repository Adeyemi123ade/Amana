'use client'
import { useState, useEffect } from 'react'

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter] = useState('PENDING')
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [acting, setActing] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/kyc?status=' + filter)
    const data = await res.json()
    setSubmissions(data.submissions || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const act = async (action: string) => {
    if (action === 'REJECTED' && !reason.trim()) { setMsg('Please provide a rejection reason'); return }
    setActing(true)
    const res = await fetch('/api/admin/kyc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, action, reason, note }) })
    const data = await res.json()
    if (data.success) { setMsg('✓ Done — email sent to user'); setSelected(null); setNote(''); setReason(''); load() }
    else setMsg('Error: ' + data.error)
    setActing(false)
  }

  const sc: Record<string,[string,string]> = {
    PENDING:['#D97706','#FFFBEB'],
    APPROVED:['#16A34A','#F0FDF4'],
    REJECTED:['#DC2626','#FEF2F2'],
    NEEDS_UPDATE:['#7C3AED','#EDE9FE']
  }

  return (
    <div style={{ maxWidth:'100%', overflowX:'hidden' }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#0F172A', whiteSpace:'nowrap' }}>KYC Review Center</h1>
        <p style={{ fontSize:13, color:'#64748B', marginTop:2 }}>Review and action identity verification submissions</p>
      </div>

      {/* Filter buttons — wrap on small screens */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
        {['PENDING','APPROVED','REJECTED','NEEDS_UPDATE'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600,
              cursor:'pointer', whiteSpace:'nowrap',
              border: filter===s ? 'none' : '1px solid #E2E8F0',
              background: filter===s ? '#0E1A6E' : 'white',
              color: filter===s ? 'white' : '#64748B',
              flex: '1 1 auto',
            }}>
            {s.replace('_',' ')}
          </button>
        ))}
      </div>

      {msg && (
        <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:13, color:'#16A34A' }}>
          {msg}
        </div>
      )}

      <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'#94A3B8' }}>Loading...</div>
        ) : submissions.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#94A3B8', fontSize:13 }}>No {filter} submissions</div>
        ) : submissions.map((s:any) => {
          const [c,b] = sc[s.status] || ['#6B7280','#F9FAFB']
          return (
            <div key={s.id} onClick={() => { setSelected(s); setNote(''); setReason(''); setMsg('') }}
              style={{ display:'flex', flexWrap:'wrap', gap:8, padding:'13px 16px', borderBottom:'1px solid #F8FAFC', cursor:'pointer', alignItems:'center' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#F8FAFC')}
              onMouseLeave={e=>(e.currentTarget.style.background='')}>
              <div style={{ flex:'1 1 160px', minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#1E293B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.user_email}</p>
                <p style={{ fontSize:11, color:'#94A3B8' }}>{s.id.slice(0,12)}...</p>
              </div>
              <p style={{ fontSize:13, color:'#374151', flex:'0 0 auto' }}>{s.document_type}</p>
              <p style={{ fontSize:12, color:'#64748B', flex:'0 0 auto' }}>{new Date(s.submitted_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
              <span style={{ fontSize:10, fontWeight:700, color:c, background:b, padding:'3px 8px', borderRadius:20, flex:'0 0 auto' }}>{s.status.replace('_',' ')}</span>
            </div>
          )
        })}
      </div>

      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:620, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>KYC Review — {selected.document_type}</h3>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94A3B8' }}>×</button>
            </div>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ background:'#F8FAFC', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#1E293B', marginBottom:4 }}>{selected.user_email}</p>
                <p style={{ fontSize:12, color:'#64748B' }}>Type: {selected.document_type}</p>
                <p style={{ fontSize:12, color:'#64748B' }}>Number: {selected.document_number ? '••••' + selected.document_number.slice(-4) : '—'}</p>
                <p style={{ fontSize:12, color:'#64748B' }}>Submitted: {new Date(selected.submitted_at).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:12, marginBottom:16 }}>
                {([['Front',selected.front_image_url],['Back',selected.back_image_url],['Selfie',selected.selfie_url]] as [string,string][]).map(([l,u])=>(
                  <div key={l}>
                    <p style={{ fontSize:11, fontWeight:600, color:'#64748B', marginBottom:6 }}>{l}</p>
                    {u ? (
                      <a href={u} target="_blank" rel="noreferrer">
                        <img src={u} alt={l} style={{ width:'100%', height:100, objectFit:'cover', borderRadius:8, border:'1px solid #E2E8F0' }}/>
                      </a>
                    ) : (
                      <div style={{ width:'100%', height:100, borderRadius:8, border:'1px dashed #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', color:'#CBD5E1', fontSize:12 }}>Not provided</div>
                    )}
                  </div>
                ))}
              </div>
              {selected.status === 'PENDING' && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Rejection Reason (required if rejecting)</label>
                  <input value={reason} onChange={e=>setReason(e.target.value)}
                    placeholder="e.g. Document image is blurry, ID appears expired..."
                    style={{ width:'100%', height:38, padding:'0 12px', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                </div>
              )}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Internal Note (optional)</label>
                <textarea value={note} onChange={e=>setNote(e.target.value)}
                  placeholder="Admin note for internal records..."
                  style={{ width:'100%', height:64, padding:'8px 12px', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, outline:'none', resize:'none', boxSizing:'border-box', fontFamily:'inherit' }}/>
              </div>
              {msg && <p style={{ fontSize:13, color:'#16A34A', marginBottom:12 }}>{msg}</p>}
              {selected.status === 'PENDING' ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px, 1fr))', gap:8 }}>
                  <button onClick={()=>setSelected(null)}
                    style={{ height:42, background:'none', border:'1px solid #E2E8F0', borderRadius:10, fontSize:13, color:'#64748B', cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={()=>act('NEEDS_UPDATE')} disabled={acting}
                    style={{ height:42, background:'#EDE9FE', border:'1px solid #DDD6FE', borderRadius:10, fontSize:13, fontWeight:600, color:'#7C3AED', cursor:'pointer' }}>
                    Need Update
                  </button>
                  <button onClick={()=>act('REJECTED')} disabled={acting}
                    style={{ height:42, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, fontSize:13, fontWeight:600, color:'#DC2626', cursor:'pointer' }}>
                    Reject
                  </button>
                  <button onClick={()=>act('APPROVED')} disabled={acting}
                    style={{ height:42, background:'#22C55E', border:'none', borderRadius:10, fontSize:13, fontWeight:700, color:'white', cursor:'pointer' }}>
                    {acting ? '...' : '✓ Approve'}
                  </button>
                </div>
              ) : (
                <div style={{ background:'#F8FAFC', borderRadius:8, padding:'12px 14px', fontSize:13, color:'#64748B' }}>
                  Status: <strong>{selected.status}</strong>
                  {selected.rejection_reason ? ` — ${selected.rejection_reason}` : ''}
                  {selected.reviewed_by ? ` · Reviewed by ${selected.reviewed_by}` : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}