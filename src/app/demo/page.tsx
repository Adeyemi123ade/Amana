import Link from 'next/link'
import AmanaDemo from '@/components/AmanadDemo'

export default function DemoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0c0720 0%,#130a2e 60%,#1a0d3d 100%)', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,7,32,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#7C3AED', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Amana</span>
          </Link>

          {/* Back button */}
          <Link href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Demo content */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 20px 80px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 24, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block' }} />
            <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 500 }}>Interactive Demo</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 14 }}>
            See Amana in action
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Watch the complete workflow — from adding a customer to receiving payment — in under five minutes.
          </p>
        </div>

        {/* Demo carousel */}
        <AmanaDemo />

        {/* CTA after demo */}
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
            Ready to get started?
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/sign-up"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7C3AED', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', padding: '14px 32px', borderRadius: 12, boxShadow: '0 4px 24px rgba(124,58,237,0.45)' }}>
              Create Free Account →
            </Link>
            <Link href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500, textDecoration: 'none', padding: '14px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
