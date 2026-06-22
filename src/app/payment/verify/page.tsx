'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'abandoned' | 'failed'>('verifying')
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState('')

  const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('verify') || ''
  const invoiceId = searchParams.get('invoiceId') || searchParams.get('invoice_id') || ''

  useEffect(() => {
    if (!reference) {
      // No reference at all — customer likely landed here directly
      // If we have an invoiceId, send them back to the invoice
      if (invoiceId) {
        window.location.replace(`/invoice/${invoiceId}`)
      } else {
        setStatus('failed')
        setError('No payment reference found.')
      }
      return
    }

    const verify = async () => {
      const timeout = setTimeout(() => {
        setStatus(prev => prev === 'verifying' ? 'failed' : prev)
        setError(
          'Verification is taking longer than expected. If you were charged, your payment is safe and the invoice will update shortly. Reference: ' + reference
        )
      }, 25000)

      try {
        const res = await fetch('/api/paystack-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, invoiceId: invoiceId || undefined }),
        })
        const data = await res.json()
        clearTimeout(timeout)

        if (data.success) {
          setDetails(data)
          setStatus('success')
          // Auto-redirect to invoice page after 3 seconds so customer sees PAID status
          if (invoiceId) {
            setTimeout(() => {
              window.location.replace('/invoice/' + invoiceId)
            }, 3000)
          }
        } else {
          // Check if this is an abandoned/cancelled payment (not a real failure)
          // Paystack returns specific messages for these cases
          const msg = (data.message || data.error || '').toLowerCase()
          const isAbandoned =
            msg.includes('abandon') ||
            msg.includes('cancel') ||
            msg.includes('not success') ||
            msg.includes('verification failed') ||
            msg.includes('could not be verified') ||
            data.alreadyProcessed === false

          if (isAbandoned && invoiceId) {
            setStatus('abandoned')
          } else if (isAbandoned) {
            setStatus('abandoned')
          } else {
            setStatus('failed')
            setError(data.message || data.error || 'Payment could not be verified.')
          }
        }
      } catch {
        clearTimeout(timeout)
        setStatus('failed')
        setError(
          'Could not connect to verification server. If you were charged, your payment is safe. Reference: ' + reference
        )
      }
    }

    verify()
  }, [reference, invoiceId])

  // ── VERIFYING ──────────────────────────────────────────
  if (status === 'verifying') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: 52, height: 52, border: '4px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite', marginBottom: 24 }} />
      <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Checking your payment...</p>
      <p style={{ fontSize: 14, color: '#6B7280' }}>Please wait a moment.</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── SUCCESS ────────────────────────────────────────────
  if (status === 'success') return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 20, padding: '40px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Payment Confirmed!</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>Your payment has been received successfully.</p>
        {invoiceId && (
          <p style={{ fontSize: 13, color: '#7C3AED', fontWeight: 600, marginBottom: 24 }}>
            Taking you back to your receipt in 3 seconds...
          </p>
        )}
        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 24 }}>
          {[
            ['Invoice', details?.invoiceNumber || '—'],
            ['Reference', reference.slice(0, 24) + (reference.length > 24 ? '...' : '')],
            ['Amount', details?.amount ? `${details.currency || 'NGN'} ${Number(details.amount).toLocaleString()}` : '—'],
            ['Status', 'PAID ✓'],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: l === 'Status' ? '#22C55E' : '#111827' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {invoiceId && (
            <Link href={`/invoice/${invoiceId}`}
              style={{ flex: 1, display: 'block', background: 'linear-gradient(135deg,#22C55E,#16A34A)', color: 'white', textDecoration: 'none', padding: '13px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
              View Receipt Now
            </Link>
          )}
          <Link href="/dashboard"
            style={{ flex: 1, display: 'block', background: 'white', border: '1px solid #E5E7EB', color: '#374151', textDecoration: 'none', padding: '13px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )

  // ── ABANDONED / CANCELLED — customer clicked Back ─────
  if (status === 'abandoned') return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 20, padding: '40px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>↩️</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Payment Not Completed</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 8, lineHeight: 1.65 }}>
          It looks like you left the payment page before completing your transaction.
        </p>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.65 }}>
          <strong>You have not been charged.</strong> You can go back to the invoice and try again with any payment method.
        </p>
        {invoiceId ? (
          <Link href={`/invoice/${invoiceId}`}
            style={{ display: 'block', width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', textDecoration: 'none', padding: '15px 20px', borderRadius: 12, fontSize: 15, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}>
            ← Back to Invoice — Try Again
          </Link>
        ) : (
          <a href="javascript:history.back()"
            style={{ display: 'block', width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', textDecoration: 'none', padding: '15px 20px', borderRadius: 12, fontSize: 15, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}>
            ← Go Back and Try Again
          </a>
        )}
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
          Need help? Contact the business directly.
        </p>
      </div>
    </div>
  )

  // ── REAL FAILURE — something actually went wrong ──────
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 20, padding: '40px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Payment Issue</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 1.65 }}>{error}</p>
        {reference && (
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
            Reference: <strong style={{ color: '#374151' }}>{reference}</strong>
          </p>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          {invoiceId && (
            <Link href={`/invoice/${invoiceId}`}
              style={{ flex: 1, display: 'block', background: '#7C3AED', color: 'white', textDecoration: 'none', padding: '13px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
              Try Again
            </Link>
          )}
          <Link href="/"
            style={{ flex: 1, display: 'block', background: 'white', border: '1px solid #E5E7EB', color: '#374151', textDecoration: 'none', padding: '13px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            Go Home
          </Link>
        </div>
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
