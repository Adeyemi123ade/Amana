import { getAdminSupabase } from '@/lib/admin-auth'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const db = getAdminSupabase()

  const safeCount = async (query: any) => {
    try {
      const { count } = await query
      return count ?? 0
    } catch { return 0 }
  }

  const safeData = async (query: any) => {
    try {
      const { data } = await query
      return data ?? []
    } catch { return [] }
  }

  const [
    totalBiz,
    pendingKyc,
    totalInv,
    totalPay,
    totalAppt,
    totalUsers,
    totalSupport,
    recentActivity,
    recentKyc,
    paidPayments,
  ] = await Promise.all([
    safeCount(db.from('workspaces').select('*', { count: 'exact', head: true })),
    safeCount(db.from('kyc_submissions').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')),
    safeCount(db.from('invoices').select('*', { count: 'exact', head: true })),
    safeCount(db.from('payments').select('*', { count: 'exact', head: true })),
    safeCount(db.from('appointments').select('*', { count: 'exact', head: true })),
    safeCount(db.from('customers').select('*', { count: 'exact', head: true })),
    safeCount(db.from('support_messages').select('*', { count: 'exact', head: true }).eq('status', 'OPEN')),
    safeData(db.from('activity_logs').select('action,entity_type,created_at').order('created_at', { ascending: false }).limit(10)),
    safeData(db.from('kyc_submissions').select('id,document_type,status,submitted_at').eq('status', 'PENDING').order('submitted_at', { ascending: false }).limit(5)),
    safeData(db.from('payments').select('amount').eq('status', 'SUCCESS')),
  ])

  const totalRevenue = paidPayments.reduce((s: number, p: any) => s + Number(p.amount), 0)

  const stats = [
    { label: 'Total Businesses', value: totalBiz,    color: '#3B82F6', link: '/admin/businesses' },
    { label: 'Pending KYC',      value: pendingKyc,  color: '#F59E0B', link: '/admin/kyc' },
    { label: 'Total Invoices',   value: totalInv,    color: '#7C3AED', link: '/admin/invoices' },
    { label: 'Total Payments',   value: totalPay,    color: '#22C55E', link: '/admin/payments' },
    { label: 'Appointments',     value: totalAppt,   color: '#EC4899', link: '/admin/businesses' },
    { label: 'Open Support',     value: totalSupport,color: '#EF4444', link: '/admin/support' },
    { label: 'Total Revenue',    value: '₦' + totalRevenue.toLocaleString(), color: '#16A34A', link: '/admin/payments' },
    { label: 'Total Customers',  value: totalUsers,  color: '#0EA5E9', link: '/admin/users' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text, #0F172A)', marginBottom: 4 }}>Platform Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--admin-text-muted, #64748B)' }}>Real-time view of all activity across the Amana platform</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.link} style={{ textDecoration: 'none', background: 'var(--admin-card, white)', borderRadius: 12, padding: '18px 20px', border: '1px solid var(--admin-card-border, #E2E8F0)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'block' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--admin-card, white)', borderRadius: 12, border: '1px solid var(--admin-card-border, #E2E8F0)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text, #0F172A)' }}>Pending KYC Reviews</p>
            <Link href="/admin/kyc" style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {recentKyc.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No pending submissions</div>
          ) : recentKyc.map((k: any) => (
            <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F8FAFC' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{k.document_type}</p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(k.submitted_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#D97706', background: '#FFFBEB', padding: '3px 8px', borderRadius: 20 }}>PENDING</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--admin-card, white)', borderRadius: 12, border: '1px solid var(--admin-card-border, #E2E8F0)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text, #0F172A)' }}>Recent Activity</p>
            <Link href="/admin/logs" style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No recent activity</div>
          ) : recentActivity.map((a: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #F8FAFC' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{a.action?.replace(/_/g, ' ')}</p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>{a.entity_type}</p>
              </div>
              <p style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(a.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
