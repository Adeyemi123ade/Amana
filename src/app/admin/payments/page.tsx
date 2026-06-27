'use client'
import { useEffect, useState } from 'react'

const STATUS_COLORS: Record<string,[string,string]> = {
  SUCCESS:['#16A34A','#F0FDF4'], FAILED:['#DC2626','#FEF2F2'],
  PENDING:['#D97706','#FFFBEB'], REVERSED:['#6B7280','#F9FAFB'],
}

export default function AdminPaymentsPage() {
  const [pays, setPays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const total = pays.filter(p => p.status==='SUCCESS').reduce((s,p) => s+Number(p.amount), 0)

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(r => r.json())
      .then(d => { setPays(d.payments || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Payment Monitoring</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>
          Total collected: <strong style={{ color:'#16A34A' }}>&#x20A6;{total.toLocaleString()}</strong> across {pays.length} transactions
        </p>
      </div>

      {loading ? (
        <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:40, textAlign:'center', color:'var(--admin-text-muted)' }}>Loading...</div>
      ) : pays.length === 0 ? (
        <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:40, textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>No payments yet</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {pays.map((p:any) => {
            const [c,b] = STATUS_COLORS[p.status] || ['#6B7280','#F9FAFB']
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:'16px 20px', cursor:'pointer', transition:'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow='none')}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ minWidth:0, flex:1, marginRight:12 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--admin-text)', marginBottom:2 }}>{p.workspaces?.name || '—'}</p>
                    <p style={{ fontSize:12, color:'var(--admin-text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.customer_email || '—'}</p>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:c, background:b, padding:'4px 10px', borderRadius:20, flexShrink:0 }}>{p.status}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:11, color:'var(--admin-text-muted)', fontFamily:'monospace' }}>{p.paystack_ref || '—'}</p>
                  <p style={{ fontSize:18, fontWeight:800, color:'#16A34A' }}>&#x20A6;{Number(p.amount).toLocaleString()}</p>
                </div>
                <p style={{ fontSize:11, color:'var(--admin-text-muted)', marginTop:6 }}>
                  {p.payment_channel || p.method || 'card'} · {new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:'var(--admin-card)', borderRadius:16, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--admin-card-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'var(--admin-text)' }}>Payment Details</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:24, cursor:'pointer', color:'var(--admin-text-muted)', lineHeight:1 }}>&times;</button>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
              {[
                ['Reference', selected.paystack_ref],
                ['Status', selected.status],
                ['Amount', '&#x20A6;' + Number(selected.amount).toLocaleString()],
                ['Business', selected.workspaces?.name],
                ['Customer Email', selected.customer_email],
                ['Payment Channel', selected.payment_channel || selected.method],
                ['Date', new Date(selected.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})],
              ].map(([label, value]) => value ? (
                <div key={label as string}>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{label as string}</p>
                  <p style={{ fontSize:14, color:'var(--admin-text)', fontWeight:500 }} dangerouslySetInnerHTML={{ __html: value as string }}/>
                </div>
              ) : null)}
              <button onClick={() => setSelected(null)}
                style={{ height:44, background:'var(--admin-accent,#0E1A6E)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', marginTop:8 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
