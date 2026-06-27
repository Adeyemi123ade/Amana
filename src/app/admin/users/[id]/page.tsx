import { getAdminSupabase } from '@/lib/admin-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const db = getAdminSupabase()

  let user: any = null
  try {
    const { data } = await db.auth.admin.getUserById(params.id)
    user = data?.user
  } catch {}

  if (!user) notFound()

  const [
    { count: invCount },
    { count: custCount },
    { count: apptCount },
    { data: workspace },
  ] = await Promise.all([
    db.from('invoices').select('*', { count:'exact', head:true }).eq('created_by', user.id),
    db.from('customers').select('*', { count:'exact', head:true }).eq('created_by', user.id),
    db.from('appointments').select('*', { count:'exact', head:true }).eq('created_by', user.id),
    db.from('workspaces').select('*').eq('created_by', user.id).maybeSingle().then(r => r),
  ])

  const ws = (workspace as any)?.data
  const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
  const isActive = !!user.email_confirmed_at
  const joined = new Date(user.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' })
  const initials = name ? name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2) : (user.email?.[0] || 'U').toUpperCase()

  const field = (label: string, value: string | null | undefined) => (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:11, fontWeight:700, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:14, color:'var(--admin-text)', fontWeight:500 }}>{value || '—'}</p>
    </div>
  )

  const statCard = (label: string, value: any, color: string) => (
    <div style={{ background:'var(--admin-card)', borderRadius:10, padding:'14px 18px', border:'1px solid var(--admin-card-border)', textAlign:'center' }}>
      <p style={{ fontSize:11, fontWeight:600, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>{label}</p>
      <p style={{ fontSize:24, fontWeight:800, color }}>{value}</p>
    </div>
  )

  return (
    <div>
      {/* Back nav */}
      <Link href="/admin/users"
        style={{ display:'inline-flex', alignItems:'center', gap:8, color:'var(--admin-accent)', fontSize:14, fontWeight:600, textDecoration:'none', marginBottom:24 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to Users
      </Link>

      {/* Profile header */}
      <div style={{ background:'var(--admin-card)', borderRadius:14, border:'1px solid var(--admin-card-border)', padding:'24px', marginBottom:24, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#7C3AED', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:26, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ fontSize:20, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>{name || 'No name set'}</h1>
          <p style={{ fontSize:13, color:'var(--admin-text-muted)', marginBottom:8 }}>{user.email}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, color:isActive?'#16A34A':'#D97706', background:isActive?'#F0FDF4':'#FFFBEB' }}>
              {isActive ? 'ACTIVE' : 'PENDING EMAIL'}
            </span>
            <span style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:20, color:'var(--admin-text-muted)', background:'var(--admin-bg)' }}>
              Joined {joined}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid" style={{ marginBottom:24 }}>
        {statCard('Invoices', invCount ?? 0, '#7C3AED')}
        {statCard('Customers', custCount ?? 0, '#3B82F6')}
        {statCard('Appointments', apptCount ?? 0, '#EC4899')}
        {statCard('Business', ws ? '1' : '0', '#16A34A')}
      </div>

      <div className="admin-two-col">
        {/* Account details */}
        <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:'20px 24px' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:16 }}>Account Details</p>
          {field('Full Name', name)}
          {field('Email Address', user.email)}
          {field('Phone', user.user_metadata?.phone)}
          {field('Country', user.user_metadata?.country)}
          {field('Email Verified', user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : 'Not verified')}
          {field('Last Sign In', user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : null)}
          {field('User ID', user.id)}
        </div>

        {/* Business details */}
        <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:'20px 24px' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:16 }}>Business Details</p>
          {ws ? (
            <>
              {field('Business Name', ws.name)}
              {field('Business Type', ws.business_type)}
              {field('Business Email', ws.business_email)}
              {field('Country', ws.country)}
              {field('Plan', ws.plan || 'FREE')}
              {field('KYC Status', ws.kyc_status || 'UNVERIFIED')}
              {field('Bank Name', ws.bank_name)}
              {field('Account Number', ws.account_number)}
              <div style={{ marginTop:8 }}>
                <Link href={'/admin/businesses/' + ws.id}
                  style={{ fontSize:13, fontWeight:600, color:'var(--admin-accent)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                  View full business profile →
                </Link>
              </div>
            </>
          ) : (
            <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>No business workspace found for this user.</p>
          )}
        </div>
      </div>
    </div>
  )
}
