import { getAdminSupabase } from '@/lib/admin-auth'

export default async function AdminPaymentsPage() {
  const db = getAdminSupabase()
  const { data: pays } = await db.from('payments').select('*, workspaces(name)').order('created_at',{ascending:false}).limit(200)
  const total = (pays||[]).filter((p:any) => p.status==='SUCCESS').reduce((s:number,p:any) => s+Number(p.amount), 0)

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Payment Monitoring</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>Total collected: <strong style={{ color:'#16A34A' }}>&#x20A6;{total.toLocaleString()}</strong> across {pays?.length||0} transactions</p>
      </div>
      <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 160px 100px 90px 80px', gap:10, padding:'12px 16px', background:'var(--admin-bg)', borderBottom:'2px solid var(--admin-card-border)' }}>
          {['Reference','Business','Customer Email','Amount','Channel','Status'].map(h => (
            <p key={h} style={{ fontSize:11, fontWeight:700, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</p>
          ))}
        </div>
        {(pays||[]).length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>No payments yet</div>}
        {(pays||[]).map((p:any) => (
          <div key={p.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 160px 100px 90px 80px', gap:10, padding:'13px 16px', borderBottom:'1px solid var(--admin-card-border)', alignItems:'center' }}>
            <p style={{ fontSize:12, color:'#7C3AED', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.paystack_ref||'—'}</p>
            <p style={{ fontSize:13, color:'var(--admin-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.workspaces?.name||'—'}</p>
            <p style={{ fontSize:12, color:'var(--admin-text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.customer_email||'—'}</p>
            <p style={{ fontSize:13, fontWeight:700, color:'#16A34A' }}>&#x20A6;{Number(p.amount).toLocaleString()}</p>
            <p style={{ fontSize:12, color:'var(--admin-text-muted)' }}>{p.payment_channel||p.method||'—'}</p>
            <span style={{ fontSize:10, fontWeight:700, color:p.status==='SUCCESS'?'#16A34A':'#DC2626', background:p.status==='SUCCESS'?'#F0FDF4':'#FEF2F2', padding:'3px 8px', borderRadius:20 }}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
