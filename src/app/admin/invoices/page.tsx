import { getAdminSupabase } from '@/lib/admin-auth'

export default async function AdminInvoicesPage() {
  const db = getAdminSupabase()
  const { data: invoices } = await db.from('invoices').select('*, customers(name,email), workspaces(name)').order('created_at',{ascending:false}).limit(100)
  const sc: Record<string,[string,string]> = { PAID:['#16A34A','#F0FDF4'], UNPAID:['#D97706','#FFFBEB'], OVERDUE:['#DC2626','#FEF2F2'], CANCELLED:['#6B7280','#F9FAFB'] }

  return (
    <div>
      <h1 style={{ fontSize:20, fontWeight:800, color:'#0F172A', marginBottom:6 }}>Invoice Monitoring</h1>
      <p style={{ fontSize:13, color:'#64748B', marginBottom:24 }}>{invoices?.length || 0} invoices across all businesses</p>
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'130px 1fr 1fr 100px 90px 90px', gap:10, padding:'10px 16px', background:'#F8FAFC', borderBottom:'2px solid #E2E8F0' }}>
          {['Invoice','Business','Customer','Amount','Due','Status'].map(h=><p key={h} style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:.5 }}>{h}</p>)}
        </div>
        {(invoices||[]).map((inv:any)=>{
          const [c,b]=sc[inv.status]||['#6B7280','#F9FAFB']
          return (
            <div key={inv.id} style={{ display:'grid', gridTemplateColumns:'130px 1fr 1fr 100px 90px 90px', gap:10, padding:'11px 16px', borderBottom:'1px solid #F8FAFC', alignItems:'center' }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#7C3AED' }}>{inv.invoice_number}</p>
              <p style={{ fontSize:12, color:'#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.workspaces?.name||'—'}</p>
              <p style={{ fontSize:12, color:'#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.customers?.name||'—'}</p>
              <p style={{ fontSize:12, fontWeight:600, color:'#1E293B' }}>₦{Number(inv.total_amount).toLocaleString()}</p>
              <p style={{ fontSize:11, color:'#64748B' }}>{new Date(inv.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</p>
              <span style={{ fontSize:10, fontWeight:700, color:c, background:b, padding:'2px 7px', borderRadius:20 }}>{inv.status}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
