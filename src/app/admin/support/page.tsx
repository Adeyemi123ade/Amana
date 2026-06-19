import { getAdminSupabase } from '@/lib/admin-auth'
import SupportActions from './SupportActions'

export default async function AdminSupportPage() {
  const db = getAdminSupabase()
  const { data: msgs } = await db.from('support_messages').select('*').order('created_at',{ascending:false})
  const sc: Record<string,[string,string]> = { OPEN:['#DC2626','#FEF2F2'], IN_PROGRESS:['#D97706','#FFFBEB'], RESOLVED:['#16A34A','#F0FDF4'], CLOSED:['#6B7280','#F9FAFB'] }

  return (
    <div>
      <h1 style={{ fontSize:20, fontWeight:800, color:'#0F172A', marginBottom:6 }}>Support Inbox</h1>
      <p style={{ fontSize:13, color:'#64748B', marginBottom:24 }}>{(msgs||[]).filter((m:any)=>m.status==='OPEN').length} open messages</p>
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        {(msgs||[]).map((m:any)=>{
          const [c,b]=sc[m.status]||['#6B7280','#F9FAFB']
          return (
            <div key={m.id} style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>{m.name} <span style={{ fontSize:12, fontWeight:400, color:'#94A3B8' }}>· {m.email}</span></p>
                  <p style={{ fontSize:13, color:'#374151', marginTop:2 }}>{m.subject || 'No subject'}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:c, background:b, padding:'3px 8px', borderRadius:20 }}>{m.status}</span>
                  <p style={{ fontSize:11, color:'#94A3B8' }}>{new Date(m.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>
              </div>
              <p style={{ fontSize:13, color:'#64748B', lineHeight:1.6, marginBottom:10 }}>{m.message}</p>
              <SupportActions id={m.id} status={m.status}/>
            </div>
          )
        })}
      </div>
    </div>
  )
}
