'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { BackLink } from '@/components/shared/BackLink'

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
      if (ws) await fetchData(ws.id, 0, '')
    }
    load()
  }, [])

  const fetchData = async (wsId: string, p: number, q: string) => {
    setLoading(true)
    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)
    if (q.trim()) query = query.ilike('customer_email', `%${q.trim()}%`)
    const { data: pays, count } = await query
    const payList = pays || []
    const invoiceIds = [...new Set(payList.map((p: any) => p.invoice_id).filter(Boolean))]
    let invMap: Record<string, any> = {}
    if (invoiceIds.length > 0) {
      const { data: invs } = await supabase.from('invoices').select('id,invoice_number,customer_id').in('id', invoiceIds)
      const custIds = [...new Set((invs || []).map((i: any) => i.customer_id).filter(Boolean))]
      let custMap: Record<string, string> = {}
      if (custIds.length > 0) {
        const { data: custs } = await supabase.from('customers').select('id,name').in('id', custIds)
        ;(custs || []).forEach((c: any) => { custMap[c.id] = c.name })
      }
      ;(invs || []).forEach((inv: any) => {
        invMap[inv.id] = { invoice_number: inv.invoice_number, customers: { name: custMap[inv.customer_id] || null } }
      })
    }
    const merged = payList.map((p: any) => ({ ...p, invoices: p.invoice_id ? invMap[p.invoice_id] || null : null }))
    setPayments(merged)
    setTotal(count || 0)
    setLoading(false)
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    setPage(0)
    if (workspace) fetchData(workspace.id, 0, q)
  }

  const currency = workspace?.currency || 'NGN'
  const totalReceived = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount), 0)

  const statusColor = (s: string) => {
    if (s === 'SUCCESS') return ['#16A34A', '#F0FDF4']
    if (s === 'FAILED') return ['#DC2626', '#FEF2F2']
    return ['#D97706', '#FFFBEB']
  }

  return (
    <div>
      <BackLink href="/dashboard" />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Payment History</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Total received: <strong style={{ color: '#16A34A' }}>{formatCurrency(totalReceived, currency)}</strong>
          </p>
        </div>
        <a href={`/api/export?type=payments`} download
          style={{ height: 40, padding: '0 16px', background: 'var(--card)', border: '1px solid var(--border-light)', borderRadius: 9, fontSize: 13, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export CSV
        </a>
      </div>

      {/* Search */}
      <div style={{ background: 'var(--card)', borderRadius: 10, border: '1px solid var(--border-light)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Search by customer email..."
          style={{ border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', background: 'transparent', flex: 1 }}/>
      </div>

      {/* Payment cards */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : payments.length === 0 ? (
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          No payments found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map(p => {
            const [sc, sb] = statusColor(p.status)
            const inv = p.invoices
            const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
            return (
              <div key={p.id} style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                    {inv?.customers?.name && (
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{inv.customers.name}</p>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.customer_email || '—'}
                    </p>
                    {inv?.invoice_number && (
                      <p style={{ fontSize: 11, color: 'var(--accent, var(--accent))', marginTop: 2 }}>{inv.invoice_number}</p>
                    )}
                    {p.paystack_ref && (
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{p.paystack_ref}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#16A34A', marginBottom: 4 }}>
                      {formatCurrency(Number(p.amount), currency)}
                    </p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sc, background: sb, padding: '3px 10px', borderRadius: 20 }}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(p.created_at)}</p>
                  {p.payment_channel && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p.payment_channel}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          <button disabled={page === 0}
            onClick={() => { const p = page - 1; setPage(p); if (workspace) fetchData(workspace.id, p, search) }}
            style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--card)', color: 'var(--text)', cursor: 'pointer', fontSize: 13, opacity: page === 0 ? 0.4 : 1 }}>
            Previous
          </button>
          <span style={{ height: 36, display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button disabled={(page + 1) * PAGE_SIZE >= total}
            onClick={() => { const p = page + 1; setPage(p); if (workspace) fetchData(workspace.id, p, search) }}
            style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--card)', color: 'var(--text)', cursor: 'pointer', fontSize: 13, opacity: (page + 1) * PAGE_SIZE >= total ? 0.4 : 1 }}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
