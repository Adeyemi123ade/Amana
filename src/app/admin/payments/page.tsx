import { getAdminSupabase } from '@/lib/admin-auth'

export default async function AdminPaymentsPage() {
  const db = getAdminSupabase()

  // Separate queries — no Supabase joins (unreliable across this schema)
  const [{ data: pays }, { data: workspaces }] = await Promise.all([
    db.from('payments').select('*').order('created_at', { ascending: false }).limit(100).catch(() => ({ data: [] })),
    db.from('workspaces').select('id, name').catch(() => ({ data: [] })),
  ])

  // Build workspace lookup map
  const wsMap: Record<string, string> = {}
  for (const ws of (workspaces || [])) {
    wsMap[ws.id] = ws.name
  }

  const total = (pays || []).filter((p: any) => p.status === 'SUCCESS').reduce((s: number, p: any) => s + Number(p.amount), 0)

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Payment Monitoring</h1>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>Total collected: ₦{total.toLocaleString()} across {pays?.length || 0} transactions</p>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 90px 90px 90px', gap: 10, padding: '10px 16px', background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
          {['Reference', 'Business', 'Customer Email', 'Amount', 'Channel', 'Status'].map(h => (
            <p key={h} style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: .5 }}>{h}</p>
          ))}
        </div>
        {(pays || []).length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No payments yet</div>
        ) : (pays || []).map((p: any) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 90px 90px 90px', gap: 10, padding: '11px 16px', borderBottom: '1px solid #F8FAFC', alignItems: 'center' }}>
            <p style={{ fontSize: 11, color: '#7C3AED', fontFamily: 'monospace' }}>{p.paystack_ref || '—'}</p>
            <p style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wsMap[p.workspace_id] || '—'}</p>
            <p style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.customer_email || '—'}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>₦{Number(p.amount).toLocaleString()}</p>
            <p style={{ fontSize: 11, color: '#64748B' }}>{p.payment_channel || p.method || '—'}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: p.status === 'SUCCESS' ? '#16A34A' : '#DC2626', background: p.status === 'SUCCESS' ? '#F0FDF4' : '#FEF2F2', padding: '2px 7px', borderRadius: 20 }}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
