import Link from 'next/link'
import AmanaDemo from '@/components/AmanadDemo'

export default function DemoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>

      {/* Header — white background, Amana logo left, Get Started right */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo — clicking returns home */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#7C3AED', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
            </div>
            <span style={{ color: '#111827', fontWeight: 800, fontSize: 18 }}>Amana</span>
          </Link>

          {/* Get Started button — right side */}
          <Link href="/sign-up"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7C3AED', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', padding: '10px 20px', borderRadius: 10, boxShadow: '0 2px 12px rgba(124,58,237,0.35)' }}>
            Get Started Free →
          </Link>
        </div>
      </header>

      {/* Demo content */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, color: '#111827', lineHeight: 1.1, marginBottom: 12 }}>
            See Amana in action
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Watch the complete flow, from adding a customer to receiving payment, all within five minutes.
          </p>
        </div>

        {/* Demo carousel — dark design preserved */}
        {/* Back button sits inside the carousel at top-left (handled by AmanadDemo) */}
        <div style={{ position: 'relative' }}>
          {/* Back button — top left corner above carousel */}
          <div style={{ marginBottom: 12 }}>
            <Link href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '8px 16px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Back
            </Link>
          </div>
          <AmanaDemo />
        </div>

      </main>
    </div>
  )
}
