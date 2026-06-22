import { getAdminSupabase } from '@/lib/admin-auth'

export default async function AdminUsersPage() {
  const db = getAdminSupabase()
  let users: any[] = []
  try {
    const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 100 })
    users = data?.users || []
  } catch {
    // Service role may not be configured — show empty state instead of crashing
  }

  return (
    <div>
      <h1 style={{ fontSize:20, fontWeight:800, color:'#0F172A', marginBottom:6 }}>User Management</h1>
      <p style={{ fontSize:13, color:'#64748B', marginBottom:24 }}>{users?.length||0} registered users</p>
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 110px', gap:12, padding:'10px 20px', background:'#F8FAFC', borderBottom:'2px solid #E2E8F0' }}>
          {['Email','Name','Verified','Joined'].map(h=><p key={h} style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:.5 }}>{h}</p>)}
        </div>
        {(users||[]).map((u:any)=>(
          <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 110px', gap:12, padding:'12px 20px', borderBottom:'1px solid #F8FAFC', alignItems:'center' }}>
            <p style={{ fontSize:13, color:'#1E293B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</p>
            <p style={{ fontSize:12, color:'#64748B' }}>{u.user_metadata?.full_name||'—'}</p>
            <span style={{ fontSize:10, fontWeight:700, color:u.email_confirmed_at?'#16A34A':'#D97706', background:u.email_confirmed_at?'#F0FDF4':'#FFFBEB', padding:'2px 8px', borderRadius:20 }}>
              {u.email_confirmed_at?'Verified':'Pending'}
            </span>
            <p style={{ fontSize:11, color:'#94A3B8' }}>{new Date(u.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
