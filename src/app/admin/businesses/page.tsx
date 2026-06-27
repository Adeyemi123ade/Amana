'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminBusinessesPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/businesses').then(r => r.json()).then(d => {
      setBusinesses(d.businesses || [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Business Management</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>{businesses.length} businesses on the platform</p>
      </div>

      <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', overflow:'hidden' }}>
        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 90px', gap:12, padding:'12px 20px', background:'var(--admin-bg)', borderBottom:'2px solid var(--admin-card-border)' }}>
          {['Business','Type','Country','Status'].map(h => (
            <p key={h} style={{ fontSize:11, fontWeight:700, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>Loading...</div>
        ) : businesses.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>No businesses yet</div>
        ) : businesses.map((b:any) => (
          <div key={b.id}
            style={{ display:'grid', gridTemplateColumns:'1fr 140px 100px 90px', gap:12, padding:'14px 20px', borderBottom:'1px solid var(--admin-card-border)', alignItems:'center', cursor:'pointer', transition:'background 0.15s' }}
            onClick={() => router.push('/admin/businesses/' + b.id)}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--admin-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-accent)', marginBottom:2, textDecoration:'underline', textDecorationColor:'transparent' }}
                onMouseEnter={e => ((e.target as any).style.textDecorationColor = 'var(--admin-accent)')}
                onMouseLeave={e => ((e.target as any).style.textDecorationColor = 'transparent')}>
                {b.name}
              </p>
              <p style={{ fontSize:12, color:'var(--admin-text-muted)' }}>{b.business_email || '—'}</p>
            </div>
            <p style={{ fontSize:13, color:'var(--admin-text-secondary)' }}>{b.business_type || '—'}</p>
            <p style={{ fontSize:13, color:'var(--admin-text-secondary)' }}>{b.country || '—'}</p>
            <span style={{ fontSize:11, fontWeight:700, color:b.suspended?'#DC2626':'#16A34A', background:b.suspended?'#FEF2F2':'#F0FDF4', padding:'4px 10px', borderRadius:20, display:'inline-block', whiteSpace:'nowrap' }}>
              {b.suspended ? 'SUSPENDED' : 'ACTIVE'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
