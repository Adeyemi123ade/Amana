'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
import { formatCurrency } from '@/lib/utils'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [invoice, setInvoice] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('id,currency,name').eq('created_by', user?.id).single()
      setWorkspace(ws)
      const { data: inv } = await supabase.from('invoices').select('*, customers(name,phone,email)').eq('id', id).single()
      setInvoice(inv)
      setLoading(false)
    }
    load()
  }, [id])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const paymentLink = `${origin}/invoice/${id}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const markPaid = async () => {
    await supabase.from('invoices').update({ status: 'PAID', paid_at: new Date().toISOString() }).eq('id', id)
    setInvoice((prev: any) => ({ ...prev, status: 'PAID' }))
  }

  const sendEmail = () => {
    if (!invoice?.customers?.email) {
      alert('This customer has no email address. Please add one in their customer profile first.')
      return
    }
    const currency = workspace?.currency || 'NGN'
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    const amount = formatCurrency(Number(invoice.total_amount), currency)
    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number} — Payment Request from ${workspace?.name || 'Business'}`)
    const body = encodeURIComponent([
      `Dear ${invoice.customers.name},`,
      '',
      `Please find your invoice details below.`,
      '',
      `Invoice Number: ${invoice.invoice_number}`,
      `Amount Due:     ${amount}`,
      `Due Date:       ${dueDate}`,
      '',
      `Pay securely online using the link below:`,
      paymentLink,
      '',
      `You can pay by card, bank transfer, USSD, or OPay.`,
      '',
      `Best regards,`,
      workspace?.name || 'Business',
    ].join('\n'))
    window.open(`mailto:${invoice.customers.email}?subject=${subject}&body=${body}`)
    setEmailSent(true)
  }

  const resendEmail = () => {
    setEmailSent(false)
    setTimeout(() => sendEmail(), 100)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!invoice) return (
    <div style={{ textAlign: 'center', padding: 48 }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>Invoice not found</p>
      <Link href="/dashboard/invoices" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Back to invoices</Link>
    </div>
  )

  const currency = workspace?.currency || 'NGN'
  const isPaid = invoice.status === 'PAID'
  const statusColor: Record<string, [string, string]> = {
    PAID: ['#22C55E', '#F0FDF4'],
    UNPAID: ['#F59E0B', '#FFFBEB'],
    OVERDUE: ['#EF4444', '#FEF2F2'],
    DRAFT: ['#6B7280', '#F9FAFB'],
    PENDING_VERIFICATION: ['#7C3AED', '#EDE9FE'],
  }
  const [sc, sb] = statusColor[invoice.status] || ['#6B7280', '#F9FAFB']

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/dashboard/invoices" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Invoice Details</h1>
      </div>

      {/* Invoice card */}
      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px', marginBottom: 12 }}>
        {/* Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: sc, background: sb, padding: '4px 12px', borderRadius: 20 }}>
            {invoice.status.replace('_', ' ')}
          </span>
          {!isPaid && invoice.status !== 'DRAFT' && (
            <button onClick={markPaid} style={{ fontSize: 12, fontWeight: 600, color: '#22C55E', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
              Mark as Paid
            </button>
          )}
        </div>

        {/* Invoice number + customer */}
        <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{invoice.invoice_number}</p>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>{invoice.customers?.name}</p>
        {invoice.customers?.email && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{invoice.customers.email}</p>}
        {invoice.customers?.phone && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{invoice.customers.phone}</p>}

        {/* Amount + dates */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginBottom: 14 }}>
            {formatCurrency(Number(invoice.total_amount), currency)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Issue Date</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                {new Date(invoice.issue_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Due Date</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: isPaid ? 'var(--text)' : '#EF4444' }}>
                {new Date(invoice.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {isPaid && invoice.paid_at && (
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Paid On</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#22C55E' }}>
                  {new Date(invoice.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
            {invoice.payment_method && (
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Payment Method</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{invoice.payment_method}</p>
              </div>
            )}
          </div>

          {/* Line items */}
          {Array.isArray(invoice.items) && invoice.items.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {invoice.items.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.description}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(Number(item.amount), currency)}</p>
                </div>
              ))}
            </div>
          )}

          {invoice.notes && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, fontStyle: 'italic' }}>{invoice.notes}</p>}
        </div>

        {/* Bank receipt */}
        {invoice.bank_receipt_url && (
          <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '12px 14px', marginBottom: 16, border: '1px solid #BBF7D0' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', marginBottom: 4 }}>Bank Receipt Submitted</p>
            <a href={invoice.bank_receipt_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'none' }}>View receipt</a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isPaid ? (
          /* PAID — only download PDF. No links needed. */
          <>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#16A34A', marginBottom: 2 }}>This invoice has been paid</p>
              <p style={{ fontSize: 12, color: '#15803D' }}>Transaction completed. Download a copy for your records.</p>
            </div>
            <a href={`/api/invoice-pdf?id=${id}`} target="_blank" rel="noreferrer"
              style={{ display:'block', width: '100%', height: 48, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration:'none', lineHeight:'48px', textAlign:'center' }}>
              Download Invoice PDF
            </a>
          </>
        ) : (
          /* UNPAID / OVERDUE — show send email + payment link */
          <>
            {invoice.customers?.email ? (
              <>
              <button onClick={sendEmail}
                style={{ width: '100%', height: 48, background: emailSent ? '#22C55E' : '#111827', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" />
                </svg>
                {emailSent ? '✓ Email Opened — Check Your Email App' : 'Send Invoice to ' + invoice.customers.email}
              </button>
              {emailSent && (
                <button onClick={resendEmail}
                  style={{ width: '100%', height: 38, background: 'none', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', marginTop: 6 }}>
                  Resend Invoice →
                </button>
              )}
              </>
            ) : (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400E' }}>
                No email for this customer. Add one to their profile to send the invoice.
              </div>
            )}

            {/* Payment link — only for unpaid invoices */}
            <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED', marginBottom: 6 }}>Customer Payment Link</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'white', borderRadius: 6, padding: '7px 10px', border: '1px solid #DDD6FE', overflow: 'hidden' }}>
                  <p style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paymentLink}</p>
                </div>
                <button onClick={copyLink}
                  style={{ height: 34, padding: '0 12px', background: copied ? '#22C55E' : '#7C3AED', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 5 }}>Customer uses this link to pay by card, bank transfer, or upload receipt</p>
            </div>

            <a href={`/api/invoice-pdf?id=${id}`} target="_blank" rel="noreferrer"
              style={{ display:'block', width: '100%', height: 42, background: 'var(--card)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', textDecoration:'none', lineHeight:'42px', textAlign:'center' }}>
              Download PDF
            </a>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
