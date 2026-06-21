'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const supabase = createClient()
const PAGE_SIZE = 20

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).maybeSingle()
      setWorkspace(ws)
      if (ws) await fetch_(ws.id, 0, '')
    }
    load()
  }, [])

  const fetch_ = async (wsId: string, p: number, q: string) => {
    setLoading(true)
    let query = supabase
      .from('payments')
      .select('*, invoices(invoice_number, customers(name))', { count: 'exact' })
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)

    if (q.trim()) query = query.ilike('customer_email', `%${q.trim()}%`)

    const { data, count } = await query
    setPayments(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    setPage(0)
    if (workspace) fetch_(workspace.id, 0, q)
  }

  const handlePage = (p: number) => {
    setPage(p)
    if (workspace) fetch_(workspace.id, p, search)
  }

  const currency = workspace?.currency || 'NGN'
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Payment History</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {total > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Total Received</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#22C55E' }}>{formatCurrency(totalRevenue, currency)}</p>
            </div>
          )}
          {workspace && (
            <a href={`/api/export?type=payments&workspace=${workspace.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border-light)', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', background: 'var(--bg-secondary)' }}>
              ↓ Export CSV
            </a>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: 10 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search by customer email..."
              style={{ width: '100%', height: 36, paddingLeft: 34, paddingRight: 12, borderRadius: 8, border: '1px solid var(--border-light)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box', background: 'var(--bg-secondary)' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No payments found</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{search ? 'Try a different search' : 'Payments appear here once received via Paystack'}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              {['Customer / Invoice', 'Amount', 'Date', 'Status'].map(h => (
                <p key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</p>
              ))}
            </div>
            {payments.map((p: any, i: number) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px', gap: 12, padding: '13px 20px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(p.invoices as any)?.customers?.name || p.customer_email || 'Customer'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {(p.invoices as any)?.invoice_number || ''}{p.paystack_ref ? ' · ' + p.paystack_ref.slice(0, 12) + '...' : ''}
                  </p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{formatCurrency(Number(p.amount), currency)}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: p.status === 'SUCCESS' ? '#22C55E' : '#EF4444', background: p.status === 'SUCCESS' ? '#F0FDF4' : '#FEF2F2', padding: '3px 8px', borderRadius: 20, display: 'inline-block' }}>
                  {p.status === 'SUCCESS' ? 'Paid' : p.status}
                </span>
              </div>
            ))}

            {totalPages > 1 && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page {page + 1} of {totalPages} · {total} total</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handlePage(page - 1)} disabled={page === 0}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', fontSize: 12, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, color: 'var(--text-muted)' }}>← Previous</button>
                  <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages - 1}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', fontSize: 12, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1, color: 'var(--text-muted)' }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
