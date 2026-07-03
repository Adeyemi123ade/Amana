'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const supabase = createClient()
const PAGE_SIZE = 20

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    await supabase.from('invoices').delete().eq('id', deleteId)
    setInvoices(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
    setDeleting(false)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).maybeSingle()
      setWorkspace(ws)
      if (ws) await fetchInvoices(ws.id, 0, '', 'All')
    }
    load()
  }, [])

  const fetchInvoices = async (wsId: string, p: number, q: string, status: string) => {
    setLoading(true)
    let query = supabase
      .from('invoices')
      .select('*, customers(name)', { count: 'exact' })
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)

    if (status !== 'All') query = query.eq('status', status.toUpperCase())
    if (q.trim()) query = query.ilike('invoice_number', `%${q.trim()}%`)

    const { data, count } = await query
    setInvoices(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    setPage(0)
    if (workspace) fetchInvoices(workspace.id, 0, q, statusFilter)
  }

  const handleFilter = (s: string) => {
    setStatusFilter(s)
    setPage(0)
    if (workspace) fetchInvoices(workspace.id, 0, search, s)
  }

  const handlePage = (p: number) => {
    setPage(p)
    if (workspace) fetchInvoices(workspace.id, p, search, statusFilter)
  }

  const currency = workspace?.currency || 'NGN'
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const statusColor: Record<string, [string, string]> = {
    PAID:     ['#22C55E', '#F0FDF4'],
    UNPAID:   ['#F59E0B', '#FFFBEB'],
    OVERDUE:  ['#EF4444', '#FEF2F2'],
    DRAFT:    ['var(--text-muted)', 'var(--bg)'],
    CANCELLED:['var(--text-muted)', 'var(--bg)'],
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Invoices</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {workspace && (
            <a href={`/api/export?type=invoices&workspace=${workspace.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border-light)', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', background: 'var(--bg-secondary)' }}>
              ↓ Export CSV
            </a>
          )}
          <Link href="/dashboard/invoices/create" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'white', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Create Invoice
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Search + filter */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: 10 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search by invoice number..."
              style={{ width: '100%', height: 36, paddingLeft: 34, paddingRight: 12, borderRadius: 8, border: '1px solid var(--border-light)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box', background: 'var(--bg-secondary)' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Paid', 'Unpaid', 'Overdue', 'Draft'].map(tab => (
              <button key={tab} onClick={() => handleFilter(tab)}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${statusFilter === tab ? 'var(--accent)' : 'var(--border-light)'}`, background: statusFilter === tab ? 'var(--accent)' : 'var(--bg-secondary)', color: statusFilter === tab ? 'white' : 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <div style={{ padding: '8px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} invoice{total !== 1 ? 's' : ''} found</p>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No invoices found</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{search || statusFilter !== 'All' ? 'Try adjusting your search or filter' : 'Create your first invoice to get started'}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              {['Invoice / Customer', 'Amount', 'Due', 'Status'].map(h => (
                <p key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</p>
              ))}
            </div>
            {invoices.map((inv: any) => {
              const [sc, sb] = statusColor[inv.status] || ['var(--text-muted)', 'var(--bg)']
              return (
                <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '11px 16px', borderTop: '1px solid var(--border)', alignItems: 'center', textDecoration: 'none' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.invoice_number}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.customers?.name || '—'}</p>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatCurrency(Number(inv.total_amount), currency)}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(inv.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, color: sc, background: sb, padding: '3px 7px', borderRadius: 20, display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                  </span>
                </Link>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page {page + 1} of {totalPages}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handlePage(page - 1)} disabled={page === 0}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', fontSize: 12, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, color: 'var(--text-muted)' }}>
                    ← Previous
                  </button>
                  <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages - 1}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', fontSize: 12, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1, color: 'var(--text-muted)' }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {deleteId && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
          <div style={{background:'var(--card)',borderRadius:16,padding:28,width:'100%',maxWidth:400,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
            <h3 style={{fontSize:17,fontWeight:700,color:'var(--text)',marginBottom:8}}>Delete Invoice?</h3>
            <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:24,lineHeight:1.6}}>Are you sure you want to delete this invoice?</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={() => setDeleteId(null)}
                style={{flex:1,height:44,background:'var(--bg-secondary)',border:'1px solid var(--border-light)',borderRadius:10,fontSize:14,fontWeight:500,color:'var(--text-muted)',cursor:'pointer'}}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                style={{flex:1,height:44,background:'#EF4444',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>
                {deleting ? 'Deleting...' : 'Yes, delete invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}