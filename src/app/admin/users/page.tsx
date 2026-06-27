import { getAdminSupabase } from '@/lib/admin-auth'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const db = getAdminSupabase()
  let users: any[] = []
  try {
    const { data } = await db.auth.admin.listUsers({ page:1, perPage:200 })
    users = data?.users || []
  } catch {}

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>User Management</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>{users.length} registered users on the platform</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
        {users.map((u:any) => {
          const name = u.user_metadata?.full_name || u.user_metadata?.name || ''
          const isActive = !!u.email_confirmed_at
          const joined = new Date(u.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })
          const initials = name ? name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2) : (u.email?.[0] || 'U').toUpperCase()

          return (
            <Link key={u.id} href={'/admin/users/' + u.id} style={{ textDecoration:'none' }}>
              <div style={{
                background:'var(--admin-card)', borderRadius:14, border:'1px solid var(--admin-card-border)',
                padding:'20px', cursor:'pointer', transition:'box-shadow 0.15s',
                display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:12,
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                {/* Avatar */}
                <div style={{ width:52, height:52, borderRadius:'50%', background:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:18, flexShrink:0 }}>
                  {initials}
                </div>

                {/* Name */}
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:'var(--admin-text)', marginBottom:4 }}>
                    {name || 'No name set'}
                  </p>
                  <p style={{ fontSize:12, color:'var(--admin-text-muted)', wordBreak:'break-all' }}>{u.email}</p>
                </div>

                {/* Status + date */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, width:'100%' }}>
                  <span style={{
                    fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:20,
                    color:isActive?'#16A34A':'#D97706',
                    background:isActive?'#F0FDF4':'#FFFBEB',
                  }}>
                    {isActive ? 'ACTIVE' : 'PENDING'}
                  </span>
                  <p style={{ fontSize:11, color:'var(--admin-text-muted)' }}>Joined {joined}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign:'center', padding:60, color:'var(--admin-text-muted)', fontSize:14 }}>No users found</div>
      )}
    </div>
  )
}
