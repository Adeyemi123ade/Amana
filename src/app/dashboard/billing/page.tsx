'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BackLink } from '@/components/shared/BackLink'

const STATUS_COLORS: Record<string, [string, string]> = {
  DRAFT:     ['var(--text-muted)', 'var(--bg)'],
  SENT:      ['#3B82F6', '#EFF6FF'],
  PAID:      ['#16A34A', '#F0FDF4'],
  PENDING:   ['#D97706', '#FFFBEB'],
  FAILED:    ['#DC2626', '#FEF2F2'],
  OVERDUE:   ['#DC2626', '#FEF2F2'],
  CANCELLED: ['var(--text-muted)', '#F1F5F9'],
  WAIVED:    ['var(--accent)', 'var(--accent-light)'],
}

type Invoice = {
  id: string; invoice_number: string; plan_name: string; billing_type: string;
  invoice_amount: number; amount_paid: number; outstanding_balance: number;
  status: string; due_date: string; paid_at: string; created_at: string;
  billing_period_start: string; billing_period_end: string; currency: string;
  subscription_status: string; next_renewal_date: string;
}

export default function BusinessBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Invoice | null>(null)

  useEffect(() => {
    fetch('/api/billing')
      .then(r => r.json())
      .then(d => {
        setInvoices(d.invoices || [])
        setWorkspace(d.workspace || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fmt = (d: string) => d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const fmtAmt = (n: number, cur = 'NGN') =>
    (cur === 'NGN' ? '₦' : '$') + Number(n || 0).toLocaleString()

  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE')
  const pendingInvoices = invoices.filter(i => ['PENDING', 'SENT'].includes(i.status))
  const totalOwed = invoices
    .filter(i => !['PAID', 'WAIVED', 'CANCELLED'].includes(i.status))
    .reduce((s, i) => s + Number(i.outstanding_balance || 0), 0)

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading billing information...
    </div>
  )

  return (
    <div style={{ maxWidth: 800 }}>
      <BackLink href="/dashboard" />
      {/* Overdue warning */}
      {overdueInvoices.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 2 }}>
              You have {overdueInvoices.length} overdue platform invoice{overdueInvoices.length > 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: 13, color: '#B91C1C' }}>
              Please complete payment to avoid service interruption. Total owed: <strong>{fmtAmt(totalOwed)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          Billing & Subscription
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Platform invoices from Amana for your subscription and services.
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}> This is separate from invoices you send to your customers.</span>
        </p>
      </div>

      {/* Plan summary */}
      {workspace && (
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '18px 24px', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Current Plan</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{workspace.plan || 'FREE'}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Total Invoices</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{invoices.length}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Pending</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#D97706' }}>{pendingInvoices.length}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Total Owed</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: totalOwed > 0 ? '#DC2626' : '#16A34A' }}>{fmtAmt(totalOwed)}</p>
          </div>
        </div>
      )}

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🧾</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No platform invoices yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>When Amana issues an invoice for your subscription or services, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {invoices.map(inv => {
            const [sc, sb] = STATUS_COLORS[inv.status] || ['var(--text-muted)', 'var(--bg)']
            const isOverdue = inv.status === 'OVERDUE'
            const isPending = ['PENDING', 'SENT'].includes(inv.status)
            return (
              <div key={inv.id} onClick={() => setSelected(inv)}
                style={{ background: 'var(--card)', borderRadius: 12, border: `1px solid ${isOverdue ? '#FECACA' : 'var(--border-light)'}`, padding: '16px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{inv.invoice_number}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sc, background: sb, padding: '2px 8px', borderRadius: 20 }}>{inv.status}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                      {inv.plan_name} — {inv.billing_type}
                    </p>
                    {inv.billing_period_start && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Period: {fmt(inv.billing_period_start)} – {fmt(inv.billing_period_end)}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                      {fmtAmt(inv.invoice_amount, inv.currency)}
                    </p>
                    {Number(inv.outstanding_balance) > 0 && (
                      <p style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>
                        Owed: {fmtAmt(inv.outstanding_balance, inv.currency)}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 11, color: isOverdue ? '#DC2626' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}>
                      Due: {fmt(inv.due_date)}
                    </p>
                    {inv.paid_at && <p style={{ fontSize: 11, color: '#16A34A' }}>Paid: {fmt(inv.paid_at)}</p>}
                  </div>
                  {(isPending || isOverdue) && (
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(inv) }}
                      style={{ height: 32, padding: '0 16px', background: isOverdue ? '#DC2626' : '#0E1A6E', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      View & Pay
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invoice detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ background: 'var(--card)', width: '100%', maxWidth: 480, height: '100vh', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--card)', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{selected.invoice_number}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Platform Invoice from Amana</p>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Status badge */}
              {(() => { const [sc, sb] = STATUS_COLORS[selected.status] || ['var(--text-muted)', 'var(--bg)']; return (
                <span style={{ fontSize: 12, fontWeight: 700, color: sc, background: sb, padding: '4px 14px', borderRadius: 20, display: 'inline-block', marginBottom: 20 }}>
                  {selected.status}
                </span>
              )})()}

              {/* Amount due */}
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>INVOICE AMOUNT</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{fmtAmt(selected.invoice_amount, selected.currency)}</p>
                {Number(selected.outstanding_balance) > 0 && (
                  <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, marginTop: 4 }}>
                    Outstanding: {fmtAmt(selected.outstanding_balance, selected.currency)}
                  </p>
                )}
              </div>

              {/* Details */}
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                {[
                  ['Plan', selected.plan_name],
                  ['Billing Type', selected.billing_type],
                  ['Billing Period', selected.billing_period_start ? `${fmt(selected.billing_period_start)} – ${fmt(selected.billing_period_end)}` : null],
                  ['Due Date', fmt(selected.due_date)],
                  ['Amount Paid', fmtAmt(selected.amount_paid, selected.currency)],
                  ['Paid On', selected.paid_at ? fmt(selected.paid_at) : null],
                  ['Invoice Created', fmt(selected.created_at)],
                  ['Next Renewal', selected.next_renewal_date ? fmt(selected.next_renewal_date) : null],
                ].filter(([,v]) => v).map(([l, v]) => (
                  <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border,#F3F4F6)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{l as string}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: l === 'Due Date' && selected.status === 'OVERDUE' ? '#DC2626' : 'var(--text)' }}>{v as string}</p>
                  </div>
                ))}
              </div>

              {/* Payment instructions */}
              {!['PAID', 'WAIVED', 'CANCELLED'].includes(selected.status) && (
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginBottom: 6 }}>Payment Instructions</p>
                  <p style={{ fontSize: 13, color: '#1E40AF', lineHeight: 1.6 }}>
                    To pay this invoice, please contact Amana support or use the payment link sent to your registered email address.
                    Mention invoice number <strong>{selected.invoice_number}</strong> in your payment.
                  </p>
                </div>
              )}

              {selected.status === 'PAID' && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>✓ Payment Received</p>
                  <p style={{ fontSize: 12, color: '#15803D' }}>Thank you. This invoice has been paid in full.</p>
                </div>
              )}

              <button onClick={() => setSelected(null)}
                style={{ width: '100%', height: 44, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
