'use client'
import { useEffect, useState, useCallback } from 'react'

const STATUS_COLORS: Record<string, [string, string]> = {
  DRAFT:     ['#6B7280', '#F9FAFB'],
  SENT:      ['#3B82F6', '#EFF6FF'],
  PAID:      ['#16A34A', '#F0FDF4'],
  PENDING:   ['#D97706', '#FFFBEB'],
  FAILED:    ['#DC2626', '#FEF2F2'],
  OVERDUE:   ['#DC2626', '#FEF2F2'],
  CANCELLED: ['#6B7280', '#F1F5F9'],
  WAIVED:    ['#7C3AED', '#EDE9FE'],
}

const SUB_COLORS: Record<string, [string, string]> = {
  ACTIVE:    ['#16A34A', '#F0FDF4'],
  TRIAL:     ['#3B82F6', '#EFF6FF'],
  EXPIRED:   ['#DC2626', '#FEF2F2'],
  SUSPENDED: ['#D97706', '#FFFBEB'],
  CANCELLED: ['#6B7280', '#F9FAFB'],
}

const PLANS = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']
const BILLING_TYPES = ['MONTHLY', 'ANNUAL', 'USAGE', 'ONE_TIME']
const STATUSES = ['ALL', 'DRAFT', 'SENT', 'PENDING', 'PAID', 'OVERDUE', 'FAILED', 'WAIVED', 'CANCELLED']

type Invoice = {
  id: string; invoice_number: string; business_name: string; business_email: string;
  owner_name: string; plan_name: string; billing_type: string; invoice_amount: number;
  amount_paid: number; outstanding_balance: number; status: string; due_date: string;
  paid_at: string; created_at: string; last_reminder_at: string; admin_notes: string;
  subscription_status: string; next_renewal_date: string; trial_ends_at: string;
  billing_period_start: string; billing_period_end: string; currency: string;
  payment_method: string; waived_reason: string; waived_by: string; workspace_id: string;
}

type Stats = {
  total: number; paid: number; pending: number; overdue: number; failed: number;
  cancelled: number; waived: number; totalExpected: number; totalCollected: number;
  totalOutstanding: number; activeSubscriptions: number; trialAccounts: number;
}

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [acting, setActing] = useState(false)
  const [actMsg, setActMsg] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [waiveReason, setWaiveReason] = useState('')
  const [showWaive, setShowWaive] = useState(false)
  const [showNote, setShowNote] = useState(false)

  // New invoice form
  const emptyForm = { business_name:'', business_email:'', owner_name:'', plan_name:'FREE', billing_type:'MONTHLY', invoice_amount:'', due_date:'', subscription_status:'ACTIVE', billing_period_start:'', billing_period_end:'', currency:'NGN', next_renewal_date:'' }
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (statusFilter !== 'ALL') q.set('status', statusFilter)
    if (search.trim()) q.set('search', search.trim())
    const res = await fetch('/api/admin/billing?' + q.toString())
    const d = await res.json()
    setInvoices(d.invoices || [])
    setStats(d.stats || null)
    setLoading(false)
  }, [statusFilter, search])

  useEffect(() => { load() }, [load])

  const act = async (action: string, payload: object = {}) => {
    if (!selected) return
    setActing(true); setActMsg('')
    const res = await fetch('/api/admin/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id: selected.id, ...payload }),
    })
    const d = await res.json()
    if (d.success) {
      setActMsg('Done')
      load()
      setSelected(prev => prev ? { ...prev, status: payload && (payload as any).status ? (payload as any).status : prev.status } : prev)
      setTimeout(() => setActMsg(''), 3000)
    } else {
      setActMsg('Error: ' + d.error)
    }
    setActing(false)
  }

  const createInvoice = async () => {
    if (!form.business_name || !form.invoice_amount) { setActMsg('Business name and amount are required'); return }
    setActing(true)
    const res = await fetch('/api/admin/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CREATE', ...form, invoice_amount: Number(form.invoice_amount) }),
    })
    const d = await res.json()
    if (d.success) { setShowCreate(false); setForm(emptyForm); load() }
    else setActMsg('Error: ' + d.error)
    setActing(false)
  }

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const fmtAmt = (n: number, cur = 'NGN') => (cur === 'NGN' ? '₦' : '$') + Number(n || 0).toLocaleString()

  const inp: React.CSSProperties = { height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--admin-card-border)', fontSize: 13, outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text)', boxSizing: 'border-box', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }

  const StatCard = ({ label, value, color, sub }: { label: string; value: any; color: string; sub?: string }) => (
    <div style={{ background: 'var(--admin-card)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--admin-card-border)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 4 }}>Billing & Invoices</h1>
          <p style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Amana subscription billing for all tenants. Not business customer invoices.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ height: 42, padding: '0 20px', background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + New Invoice
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total Invoices" value={stats.total} color="var(--admin-text)" />
          <StatCard label="Paid" value={stats.paid} color="#16A34A" />
          <StatCard label="Pending" value={stats.pending} color="#D97706" />
          <StatCard label="Overdue" value={stats.overdue} color="#DC2626" />
          <StatCard label="Failed" value={stats.failed} color="#DC2626" />
          <StatCard label="Waived" value={stats.waived} color="#7C3AED" />
          <StatCard label="Expected Revenue" value={'₦' + stats.totalExpected.toLocaleString()} color="#0E1A6E" />
          <StatCard label="Collected" value={'₦' + stats.totalCollected.toLocaleString()} color="#16A34A" />
          <StatCard label="Outstanding" value={'₦' + stats.totalOutstanding.toLocaleString()} color="#DC2626" />
          <StatCard label="Active Subs" value={stats.activeSubscriptions} color="#3B82F6" />
          <StatCard label="Trial Accounts" value={stats.trialAccounts} color="#F59E0B" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by business, email, invoice no..."
          style={{ ...inp, flex: '1 1 240px', height: 40 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ ...inp, flex: '0 0 140px', height: 40 }}>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div style={{ background: 'var(--admin-card)', borderRadius: 12, border: '1px solid var(--admin-card-border)', padding: 48, textAlign: 'center', color: 'var(--admin-text-muted)' }}>Loading...</div>
      ) : invoices.length === 0 ? (
        <div style={{ background: 'var(--admin-card)', borderRadius: 12, border: '1px solid var(--admin-card-border)', padding: 48, textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 14 }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No billing invoices found</p>
          <p>Create your first tenant invoice to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {invoices.map(inv => {
            const [sc, sb] = STATUS_COLORS[inv.status] || ['#6B7280', '#F9FAFB']
            const [subc, subb] = SUB_COLORS[inv.subscription_status] || ['#6B7280', '#F9FAFB']
            const isOverdue = inv.status !== 'PAID' && inv.due_date && new Date(inv.due_date) < new Date()
            return (
              <div key={inv.id} onClick={() => setSelected(inv)}
                style={{ background: 'var(--admin-card)', borderRadius: 12, border: `1px solid ${isOverdue ? '#FECACA' : 'var(--admin-card-border)'}`, padding: '16px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>{inv.invoice_number}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sc, background: sb, padding: '2px 8px', borderRadius: 20 }}>{inv.status}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: subc, background: subb, padding: '2px 8px', borderRadius: 20 }}>{inv.subscription_status}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 2 }}>{inv.business_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{inv.business_email} · {inv.plan_name} · {inv.billing_type}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)' }}>{fmtAmt(inv.invoice_amount, inv.currency)}</p>
                    {Number(inv.outstanding_balance) > 0 && (
                      <p style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>Owed: {fmtAmt(inv.outstanding_balance, inv.currency)}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>Due: {fmt(inv.due_date)}</p>
                  {inv.paid_at && <p style={{ fontSize: 11, color: '#16A34A' }}>Paid: {fmt(inv.paid_at)}</p>}
                  {inv.last_reminder_at && <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>Reminder: {fmt(inv.last_reminder_at)}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', zIndex: 1000, padding: 0 }}>
          <div style={{ background: 'var(--admin-card)', width: '100%', maxWidth: 520, height: '100vh', overflowY: 'auto', boxShadow: '-4px 0 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>
            {/* Detail header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--admin-card)', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>{selected.invoice_number}</p>
                <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{selected.business_name}</p>
              </div>
              <button onClick={() => { setSelected(null); setActMsg(''); setShowWaive(false); setShowNote(false) }}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--admin-text-muted)', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ padding: '16px 20px', flex: 1 }}>
              {actMsg && (
                <div style={{ background: actMsg.startsWith('Error') ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${actMsg.startsWith('Error') ? '#FECACA' : '#BBF7D0'}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, color: actMsg.startsWith('Error') ? '#DC2626' : '#16A34A', marginBottom: 14 }}>
                  {actMsg}
                </div>
              )}

              {/* Status + subscription */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {(() => { const [sc, sb] = STATUS_COLORS[selected.status] || ['#6B7280','#F9FAFB']; return <span style={{ fontSize: 12, fontWeight: 700, color: sc, background: sb, padding: '4px 12px', borderRadius: 20 }}>{selected.status}</span> })()}
                {(() => { const [sc, sb] = SUB_COLORS[selected.subscription_status] || ['#6B7280','#F9FAFB']; return <span style={{ fontSize: 12, fontWeight: 700, color: sc, background: sb, padding: '4px 12px', borderRadius: 20 }}>{selected.subscription_status}</span> })()}
              </div>

              {/* Business info */}
              <div style={{ background: 'var(--admin-bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Business Information</p>
                {[
                  ['Business', selected.business_name],
                  ['Email', selected.business_email],
                  ['Owner', selected.owner_name],
                  ['Plan', selected.plan_name],
                  ['Billing Type', selected.billing_type],
                  ['Subscription', selected.subscription_status],
                  ['Next Renewal', fmt(selected.next_renewal_date)],
                  ['Trial Ends', selected.trial_ends_at ? fmt(selected.trial_ends_at) : null],
                ].filter(([,v]) => v).map(([l, v]) => (
                  <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-card-border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{l as string}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text)' }}>{v as string}</p>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div style={{ background: 'var(--admin-bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Financial Summary</p>
                {[
                  ['Invoice Amount', fmtAmt(selected.invoice_amount, selected.currency)],
                  ['Amount Paid', fmtAmt(selected.amount_paid, selected.currency)],
                  ['Outstanding', fmtAmt(selected.outstanding_balance, selected.currency)],
                  ['Discount Applied', selected.discount_amount > 0 ? fmtAmt(selected.discount_amount, selected.currency) : null],
                  ['Due Date', fmt(selected.due_date)],
                  ['Paid On', selected.paid_at ? fmt(selected.paid_at) : null],
                  ['Payment Method', selected.payment_method],
                  ['Billing Period', selected.billing_period_start ? `${fmt(selected.billing_period_start)} – ${fmt(selected.billing_period_end)}` : null],
                ].filter(([,v]) => v).map(([l, v]) => (
                  <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--admin-card-border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{l as string}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: l === 'Outstanding' && Number(selected.outstanding_balance) > 0 ? '#DC2626' : 'var(--admin-text)' }}>{v as string}</p>
                  </div>
                ))}
              </div>

              {/* Admin notes */}
              {selected.admin_notes && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#D97706', marginBottom: 4 }}>ADMIN NOTE</p>
                  <p style={{ fontSize: 13, color: '#92400E' }}>{selected.admin_notes}</p>
                </div>
              )}
              {selected.waived_reason && (
                <div style={{ background: '#EDE9FE', border: '1px solid #DDD6FE', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 4 }}>WAIVED BY {selected.waived_by}</p>
                  <p style={{ fontSize: 13, color: '#5B21B6' }}>{selected.waived_reason}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ borderTop: '1px solid var(--admin-card-border)', paddingTop: 16, marginTop: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Admin Actions</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

                  {selected.status !== 'PAID' && (
                    <button onClick={() => act('MARK_PAID', { amount: selected.invoice_amount })} disabled={acting}
                      style={{ height: 38, background: '#16A34A', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Mark as Paid
                    </button>
                  )}

                  {!['OVERDUE','PAID','CANCELLED','WAIVED'].includes(selected.status) && (
                    <button onClick={() => act('MARK_OVERDUE')} disabled={acting}
                      style={{ height: 38, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Mark Overdue
                    </button>
                  )}

                  <button onClick={() => act('SEND_REMINDER')} disabled={acting}
                    style={{ height: 38, background: '#EEF2FF', color: '#0E1A6E', border: '1px solid #C7D2FE', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Send Reminder
                  </button>

                  <button onClick={() => act('UPDATE_STATUS', { status: 'SENT' })} disabled={acting}
                    style={{ height: 38, background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Mark as Sent
                  </button>

                  <button onClick={() => setShowNote(!showNote)}
                    style={{ height: 38, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Add Note
                  </button>

                  {!['PAID','WAIVED','CANCELLED'].includes(selected.status) && (
                    <button onClick={() => setShowWaive(!showWaive)}
                      style={{ height: 38, background: '#EDE9FE', color: '#7C3AED', border: '1px solid #DDD6FE', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Waive Invoice
                    </button>
                  )}

                  {!['PAID','CANCELLED'].includes(selected.status) && (
                    <button onClick={() => { if (confirm('Cancel this invoice?')) act('CANCEL') }} disabled={acting}
                      style={{ height: 38, background: '#F9FAFB', color: '#6B7280', border: '1px solid var(--admin-card-border)', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Cancel Invoice
                    </button>
                  )}
                </div>

                {/* Add note */}
                {showNote && (
                  <div style={{ marginTop: 12 }}>
                    <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Type admin note..." rows={3}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--admin-card-border)', fontSize: 13, resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}/>
                    <button onClick={() => { act('ADD_NOTE', { note: noteInput }); setShowNote(false); setNoteInput('') }} disabled={acting}
                      style={{ marginTop: 8, height: 36, width: '100%', background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Save Note
                    </button>
                  </div>
                )}

                {/* Waive reason */}
                {showWaive && (
                  <div style={{ marginTop: 12 }}>
                    <input value={waiveReason} onChange={e => setWaiveReason(e.target.value)} placeholder="Reason for waiving..."
                      style={{ ...inp, marginBottom: 8 }}/>
                    <button onClick={() => { act('WAIVE', { reason: waiveReason }); setShowWaive(false); setWaiveReason('') }} disabled={acting}
                      style={{ height: 36, width: '100%', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Confirm Waive
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--admin-card-border)' }}>
                <p style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>Created: {fmt(selected.created_at)}</p>
                {selected.last_reminder_at && <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 4 }}>Last reminder: {fmt(selected.last_reminder_at)}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 16 }}>
          <div style={{ background: 'var(--admin-card)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--admin-card-border)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>New Tenant Invoice</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--admin-text-muted)', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['business_name', 'Business Name *', 'text'],
                ['business_email', 'Business Email', 'email'],
                ['owner_name', 'Owner Name', 'text'],
                ['invoice_amount', 'Invoice Amount *', 'number'],
                ['due_date', 'Due Date', 'date'],
                ['billing_period_start', 'Billing Period Start', 'date'],
                ['billing_period_end', 'Billing Period End', 'date'],
                ['next_renewal_date', 'Next Renewal Date', 'date'],
              ].map(([key, label, type]) => (
                <div key={key as string}>
                  <label style={lbl}>{label as string}</label>
                  <input type={type as string} style={inp}
                    value={(form as any)[key as string]}
                    onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))}/>
                </div>
              ))}
              <div>
                <label style={lbl}>Plan</label>
                <select style={inp} value={form.plan_name} onChange={e => setForm(f => ({ ...f, plan_name: e.target.value }))}>
                  {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Billing Type</label>
                <select style={inp} value={form.billing_type} onChange={e => setForm(f => ({ ...f, billing_type: e.target.value }))}>
                  {BILLING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Subscription Status</label>
                <select style={inp} value={form.subscription_status} onChange={e => setForm(f => ({ ...f, subscription_status: e.target.value }))}>
                  {['TRIAL','ACTIVE','EXPIRED','SUSPENDED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {actMsg && <p style={{ fontSize: 13, color: '#DC2626' }}>{actMsg}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCreate(false)}
                  style={{ flex: 1, height: 44, background: 'none', border: '1px solid var(--admin-card-border)', borderRadius: 10, fontSize: 13, color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={createInvoice} disabled={acting}
                  style={{ flex: 2, height: 44, background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: acting ? 0.7 : 1 }}>
                  {acting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
