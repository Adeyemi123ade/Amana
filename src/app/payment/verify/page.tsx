'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('verify')
    const invoiceId = searchParams.get('invoiceId') || searchParams.get('invoice_id')

    if (!reference) {
      setStatus('failed')
      setError('No payment reference found. Please contact the business.')
      return
    }

    const verify = async () => {
      // Hard timeout — if verification takes more than 25s, show a result anyway
      const timeout = setTimeout(() => {
        setStatus(prev => prev === 'verifying' ? 'failed' : prev)
        setError('Verification is taking longer than expected. If you were charged, your payment is safe and the invoice will update shortly. Reference: ' + reference)
      }, 25000)

      try {
        const res = await fetch('/api/paystack-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, invoiceId }),
        })
        const data = await res.json()
        clearTimeout(timeout)

        if (data.success) {
          setDetails(data)
          setStatus('success')
        } else {
          setStatus('failed')
          setError(data.message || data.error || 'Payment could not be verified.')
        }
      } catch {
        clearTimeout(timeout)
        setStatus('failed')
        setError('Could not connect to verification server. If you were charged, your payment is safe. Reference: ' + reference)
      }
    }

    verify()
  }, [searchParams, router])

  if (status === 'verifying') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: 52, height: 52, border: '4px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', marginBottom: 24 }} />
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Confirming your payment...</p>
      <p style={{ fontSize: 14, color: '#6B7280' }}>Please wait. Do not close this page.</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (status === 'success') return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 20, padding: '40px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', textAlign: 'center' }}>

        {/* Success icon */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          Payment verification completed successfully.
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
          The payment has been confirmed and the invoice has been updated.
        </p>

        {/* Details */}
        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 28 }}>
          {[
            ['Invoice Number', details?.invoiceNumber || '—'],
            ['Payment Reference', searchParams.get('reference') || searchParams.get('trxref') || '—'],
            ['Amount', details?.amount ? `${details.currency || 'NGN'} ${Number(details.amount).toLocaleString()}` : '—'],
            ['Status', 'PAID'],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: l === 'Status' ? '#22C55E' : '#111827' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Manual navigation — user chooses */}
        <div style={{ display: 'flex', gap: 10 }}>
          {searchParams.get('invoiceId') && (
            <Link href={`/invoice/${searchParams.get('invoiceId')}`}
              style={{ flex: 1, display: 'block', background: 'white', border: '1px solid #E5E7EB', color: '#374151', textDecoration: 'none', padding: '13px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
              View Invoice
            </Link>
          )}
          <Link href="/dashboard"
            style={{ flex: 1, display: 'block', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', textDecoration: 'none', padding: '13px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 20, padding: '40px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Verification Issue</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.65 }}>{error}</p>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
          Reference: <strong style={{ color: '#374151' }}>{searchParams.get('reference') || searchParams.get('trxref') || '—'}</strong>
        </p>
        <p style={{ fontSize: 12, color: '#9CA3AF' }}>
          If you were charged, please share this reference with the business owner.
        </p>
      </div>
    </div>
  )
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
