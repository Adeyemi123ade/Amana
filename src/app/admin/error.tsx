'use client'
import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'system-ui,sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', background: 'white', borderRadius: 16, padding: 32, border: '1px solid #E2E8F0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Admin page error</h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Something crashed loading this admin page.</p>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontFamily: 'monospace', fontSize: 12, color: '#DC2626', wordBreak: 'break-all' }}>
          {error.message || 'Unknown error'}
          {error.digest && <div style={{ marginTop: 6, color: '#94A3B8' }}>Digest: {error.digest}</div>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={reset}
            style={{ flex: 1, height: 42, background: '#0E1A6E', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Try Again
          </button>
          <a href="/sign-in"
            style={{ flex: 1, height: 42, background: 'none', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 13, fontWeight: 500, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
