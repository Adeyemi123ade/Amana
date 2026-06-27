import { getAdminSupabase } from '@/lib/admin-auth'

export default async function AdminInvoicesPage() {
  const db = getAdminSupabase()
  const { data: invoices } = await db.from('invoices').select('*, customers(name,email), workspaces(name)').order('created_at',{ascending:false}).limit(200)
  const sc: Record<string,[string,string]> = { PAID:['#16A34A','#F0FDF4'], UNPAID:['#D97706','#FFFBEB'], OVERDUE:['#DC2626','#FEF2F2'], CANCELLED:['#6B7280','#F9FAFB'] }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Invoice Monitoring</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>{invoices?.length || 0} invoices across all businesses</p>
      </div>
      <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 110px 80px 80px', gap:10, padding:'12px 16px', background:'var(--admin-bg)', borderBottom:'2px solid var(--admin-card-border)' }}>
          {['Invoice','Business','Customer','Amount','Due','Status'].map(h => (
            <p key={h} style={{ fontSize:11, fontWeight:700, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</p>
          ))}
        </div>
        {(invoices||[]).length === 0 && <div style={{ padding:40, textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>No invoices yet</div>}
        {(invoices||[]).map((inv:any) => {
          const [c,b] = sc[inv.status] || ['#6B7280','#F9FAFB']
          return (
            <div key={inv.id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 110px 80px 80px', gap:10, padding:'13px 16px', borderBottom:'1px solid var(--admin-card-border)', alignItems:'center' }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#7C3AED' }}>{inv.invoice_number}</p>
              <p style={{ fontSize:13, color:'var(--admin-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.workspaces?.name||'—'}</p>
              <p style={{ fontSize:13, color:'var(--admin-text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.customers?.name||'—'}</p>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--admin-text)' }}>&#x20A6;{Number(inv.total_amount).toLocaleString()}</p>
              <p style={{ fontSize:12, color:'var(--admin-text-muted)' }}>{new Date(inv.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</p>
              <span style={{ fontSize:10, fontWeight:700, color:c, background:b, padding:'3px 8px', borderRadius:20, whiteSpace:'nowrap' }}>{inv.status}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
