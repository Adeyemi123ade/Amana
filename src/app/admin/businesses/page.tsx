import { getAdminSupabase } from '@/lib/admin-auth'
import BusinessActions from './BusinessActions'

export default async function AdminBusinessesPage() {
  const db = getAdminSupabase()
  const { data: businesses } = await db.from('workspaces').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:800, color:'#0F172A' }}>Business Management</h1>
        <p style={{ fontSize:13, color:'#64748B' }}>{businesses?.length || 0} businesses on the platform</p>
      </div>
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 160px 120px 100px 100px', gap:12, padding:'10px 20px', background:'#F8FAFC', borderBottom:'2px solid #E2E8F0' }}>
          {['Business','Type','Country','Status','Actions'].map(h=>(
            <p key={h} style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:.5 }}>{h}</p>
          ))}
        </div>
        {(businesses||[]).map((b:any) => (
          <div key={b.id} style={{ display:'grid', gridTemplateColumns:'1fr 160px 120px 100px 100px', gap:12, padding:'13px 20px', borderBottom:'1px solid #F8FAFC', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{b.name}</p>
              <p style={{ fontSize:11, color:'#94A3B8' }}>{b.business_email || '—'}</p>
            </div>
            <p style={{ fontSize:12, color:'#64748B' }}>{b.business_type || '—'}</p>
            <p style={{ fontSize:12, color:'#64748B' }}>{b.country || '—'}</p>
            <span style={{ fontSize:10, fontWeight:700, color:b.suspended?'#DC2626':'#16A34A', background:b.suspended?'#FEF2F2':'#F0FDF4', padding:'3px 8px', borderRadius:20, display:'inline-block' }}>
              {b.suspended ? 'SUSPENDED' : 'ACTIVE'}
            </span>
            <BusinessActions id={b.id} suspended={!!b.suspended} name={b.name}/>
          </div>
        ))}
      </div>
    </div>
  )
}
