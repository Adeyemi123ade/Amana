import { getAdminSupabase } from '@/lib/admin-auth'

export default async function AdminLogsPage() {
  const db = getAdminSupabase()
  const { data: logs } = await db.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(200)
  const { data: adminLogs } = await db.from('admin_logs').select('*').order('created_at',{ascending:false}).limit(50)

  return (
    <div>
      <h1 style={{ fontSize:20, fontWeight:800, color:'#0F172A', marginBottom:24 }}>Activity Logs</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div>
          <h2 style={{ fontSize:14, fontWeight:700, color:'#374151', marginBottom:12 }}>Platform Activity</h2>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden', maxHeight:600, overflowY:'auto' }}>
            {(logs||[]).map((l:any,i:number)=>(
              <div key={l.id||i} style={{ padding:'10px 16px', borderBottom:'1px solid #F8FAFC' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#1E293B' }}>{l.action?.replace(/_/g,' ')}</p>
                  <p style={{ fontSize:11, color:'#94A3B8' }}>{new Date(l.created_at).toLocaleString('en-NG',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
                {l.entity_type && <p style={{ fontSize:11, color:'#64748B' }}>{l.entity_type}</p>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontSize:14, fontWeight:700, color:'#374151', marginBottom:12 }}>Admin Actions</h2>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden', maxHeight:600, overflowY:'auto' }}>
            {(adminLogs||[]).map((l:any)=>(
              <div key={l.id} style={{ padding:'10px 16px', borderBottom:'1px solid #F8FAFC' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#7C3AED' }}>{l.action?.replace(/_/g,' ')}</p>
                  <p style={{ fontSize:11, color:'#94A3B8' }}>{new Date(l.created_at).toLocaleString('en-NG',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
                <p style={{ fontSize:11, color:'#64748B' }}>{l.admin_email} · {l.target_type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
