import Link from 'next/link'

interface BackLinkProps {
  href: string
  label?: string
}

// Small pill-style back button, same markup already used successfully on
// dashboard/invoices/[id] and dashboard/customers/[id]. Meant to sit as its
// own row above a page's existing header, so it never touches or replaces
// whatever title/action markup that page already has.
export function BackLink({ href, label = 'Back' }: BackLinkProps) {
  return (
    <Link href={href}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, padding: '8px 14px', border: '1px solid var(--border-light)', borderRadius: 9, background: 'var(--bg-secondary)', marginBottom: 16 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
      {label}
    </Link>
  )
}
