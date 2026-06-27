import { getAdminSupabase } from '@/lib/admin-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BusinessActions from '../BusinessActions'

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getAdminSupabase()
  const { data: b } = await db.from('workspaces').select('*').eq('id', id).maybeSingle()
  if (!b) notFound()

  const [
    { count: invCount },
    { count: custCount },
    { count: apptCount },
    { data: recentInv },
  ] = await Promise.all([
    db.from('invoices').select('*', { count: 'exact', head: true }).eq('workspace_id', id),
    db.from('customers').select('*', { count: 'exact', head: true }).eq('workspace_id', id),
    db.from('appointments').select('*', { count: 'exact', head: true }).eq('workspace_id', id),
    db.from('invoices').select('invoice_number,total_amount,status,created_at').eq('workspace_id', id).order('created_at', { ascending: false }).limit(5),
  ])

  const field = (label: string, value: string | null | undefined) => (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 14, color: 'var(--admin-text)', fontWeight: 500 }}>{value || '—'}</p>
    </div>
  )

  const statCard = (label: string, value: any, color: string) => (
    <div style={{ background: 'var(--admin-card)', borderRadius: 10, padding: '14px 18px', border: '1px solid var(--admin-card-border)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color }}>{value}</p>
    </div>
  )

  const statusColors: Record<string, [string, string]> = {
    PAID: ['#16A34A', '#F0FDF4'], UNPAID: ['#D97706', '#FFFBEB'],
    OVERDUE: ['#DC2626', '#FEF2F2'], CANCELLED: ['#6B7280', '#F9FAFB'],
  }

  return (
    <div>
      <Link href="/admin/businesses"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--admin-accent,#0E1A6E)', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginBottom: 24 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back to Businesses
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>{b.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>{b.business_email || b.created_by}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: b.suspended ? '#DC2626' : '#16A34A', background: b.suspended ? '#FEF2F2' : '#F0FDF4', padding: '6px 14px', borderRadius: 20 }}>
            {b.suspended ? 'SUSPENDED' : 'ACTIVE'}
          </span>
          <BusinessActions id={b.id} suspended={!!b.suspended} name={b.name} />
        </div>
      </div>

      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        {statCard('Total Invoices', invCount ?? 0, '#7C3AED')}
        {statCard('Customers', custCount ?? 0, '#3B82F6')}
        {statCard('Appointments', apptCount ?? 0, '#EC4899')}
        {statCard('KYC Status', b.kyc_status || 'UNVERIFIED', b.kyc_status === 'APPROVED' ? '#16A34A' : '#D97706')}
      </div>

      <div className="admin-two-col" style={{ marginBottom: 24 }}>
        <div style={{ background: 'var(--admin-card)', borderRadius: 12, border: '1px solid var(--admin-card-border)', padding: '20px 24px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 16 }}>Business Information</p>
          {field('Business Name', b.name)}
          {field('Business Type', b.business_type)}
          {field('Email', b.business_email)}
          {field('WhatsApp / Phone', b.whatsapp_number)}
          {field('Address', b.business_address)}
          {field('Website', b.website)}
          {field('Instagram', b.instagram)}
          {field('Country', b.country)}
          {field('Created', b.created_at ? new Date(b.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : null)}
        </div>

        <div style={{ background: 'var(--admin-card)', borderRadius: 12, border: '1px solid var(--admin-card-border)', padding: '20px 24px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 16 }}>Banking Information</p>
          {field('Bank Name', b.bank_name)}
          {field('Account Number', b.account_number)}
          {field('Account Name', b.account_name)}
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', margin: '20px 0 16px' }}>Plan & Settings</p>
          {field('Plan', b.plan || 'FREE')}
          {field('Theme', b.theme)}
          {field('Currency', b.currency || 'NGN')}
          {field('Workspace ID', b.id)}
        </div>
      </div>

      {recentInv && recentInv.length > 0 && (
        <div style={{ background: 'var(--admin-card)', borderRadius: 12, border: '1px solid var(--admin-card-border)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-card-border)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>Recent Invoices</p>
          </div>
          {recentInv.map((inv: any) => {
            const [c, bg] = statusColors[inv.status] || ['#6B7280', '#F9FAFB']
            return (
              <div key={inv.invoice_number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--admin-card-border)' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{inv.invoice_number}</p>
                  <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{new Date(inv.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>&#x20A6;{Number(inv.total_amount).toLocaleString()}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c, background: bg, padding: '3px 8px', borderRadius: 20 }}>{inv.status}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
