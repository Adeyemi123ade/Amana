import { createClient } from '@/lib/supabase/server'
import CustomerNotes from './CustomerNotes'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: workspace } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).maybeSingle()
  const { data: customer } = await supabase.from('customers').select('*').eq('id', id).single()
  const { data: invoices } = await supabase.from('invoices').select('*').eq('customer_id', id).order('created_at', { ascending: false })
  const { data: appointments } = await supabase.from('appointments').select('*').eq('customer_id', id).order('start_time', { ascending: false })
  const { data: notes } = await supabase.from('customer_notes').select('*').eq('customer_id', id).order('created_at', { ascending: false })

  if (!customer) notFound()
  const currency = workspace?.currency || 'NGN'
  const outstanding = (invoices || []).filter(i => ['UNPAID','OVERDUE'].includes(i.status)).reduce((s,i) => s + Number(i.total_amount), 0)

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/dashboard/customers"
          style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Customer Details</h1>
      </div>

      {/* Header card — purple always, white text always */}
      <div style={{ background: '#7C3AED', borderRadius: 14, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white' }}>
            {customer.name[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{customer.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{customer.phone || customer.email || ''}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Total Spent</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{formatCurrency(Number(customer.total_spent), currency)}</p>
        </div>
      </div>

      {/* Info card — CSS vars for theme awareness */}
      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Customer since</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              {new Date(customer.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Last interaction</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              {customer.last_interaction ? new Date(customer.last_interaction).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Total invoices</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{(invoices || []).length}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Outstanding</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: outstanding > 0 ? '#EF4444' : 'var(--text)' }}>
              {formatCurrency(outstanding, currency)}
            </p>
          </div>
        </div>

        {/* Email + Phone */}
        {(customer.email || customer.phone) && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 14 }}>
            {customer.email && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Email: </span>
                <a href={`mailto:${customer.email}`} style={{ color: 'var(--accent, #7C3AED)', textDecoration: 'none' }}>{customer.email}</a>
              </p>
            )}
            {customer.phone && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Phone: </span>
                <a href={`tel:${customer.phone}`} style={{ color: 'var(--accent, #7C3AED)', textDecoration: 'none' }}>{customer.phone}</a>
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</p>
          {[
            { label: 'Send Message', href: customer.email ? `mailto:${customer.email}` : `/dashboard/customers/${id}`, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { label: 'Create Invoice', href: `/dashboard/invoices/create?customer=${id}`, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { label: 'Schedule Appointment', href: `/dashboard/appointments?customer=${id}`, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          ].map(action => (
            <a key={action.label} href={action.href}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #7C3AED)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={action.icon}/>
                </svg>
                <span style={{ fontSize: 14, color: 'var(--text)' }}>{action.label}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Recent invoices */}
      {invoices && invoices.length > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Recent Invoices</p>
          {invoices.slice(0, 3).map((inv: any) => (
            <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{inv.invoice_number}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(inv.issue_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(Number(inv.total_amount), currency)}</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: inv.status === 'PAID' ? '#22C55E' : inv.status === 'OVERDUE' ? '#EF4444' : '#F59E0B' }}>
                  {inv.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Customer Notes */}
      <CustomerNotes customerId={id} initialNotes={notes || []} />
    </div>
  )
}
