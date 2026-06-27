'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string,[string,string]> = {
  PAID:['#16A34A','#F0FDF4'], UNPAID:['#D97706','#FFFBEB'],
  OVERDUE:['#DC2626','#FEF2F2'], CANCELLED:['#6B7280','#F9FAFB'],
}

export default function AdminInvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/invoices')
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Invoice Monitoring</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>{invoices.length} invoices across all businesses</p>
      </div>

      {loading ? (
        <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:40, textAlign:'center', color:'var(--admin-text-muted)' }}>Loading...</div>
      ) : invoices.length === 0 ? (
        <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:40, textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>No invoices yet</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {invoices.map((inv:any) => {
            const [c,b] = STATUS_COLORS[inv.status] || ['#6B7280','#F9FAFB']
            return (
              <div key={inv.id} onClick={() => setSelected(inv)}
                style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:'16px 20px', cursor:'pointer', transition:'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow='none')}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#7C3AED', marginBottom:2 }}>{inv.invoice_number}</p>
                    <p style={{ fontSize:12, color:'var(--admin-text-muted)' }}>{inv.workspaces?.name || '—'}</p>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:c, background:b, padding:'4px 10px', borderRadius:20, flexShrink:0 }}>{inv.status}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:12, color:'var(--admin-text-muted)', marginBottom:2 }}>Customer</p>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--admin-text)' }}>{inv.customers?.name || '—'}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:12, color:'var(--admin-text-muted)', marginBottom:2 }}>Amount</p>
                    <p style={{ fontSize:16, fontWeight:800, color:'var(--admin-text)' }}>&#x20A6;{Number(inv.total_amount).toLocaleString()}</p>
                  </div>
                </div>
                <p style={{ fontSize:11, color:'var(--admin-text-muted)', marginTop:8 }}>
                  Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:'var(--admin-card)', borderRadius:16, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--admin-card-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:'var(--admin-text)' }}>{selected.invoice_number}</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:24, cursor:'pointer', color:'var(--admin-text-muted)', lineHeight:1 }}>&times;</button>
            </div>
            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
              {[
                ['Invoice Number', selected.invoice_number],
                ['Status', selected.status],
                ['Business', selected.workspaces?.name],
                ['Customer', selected.customers?.name],
                ['Customer Email', selected.customers?.email],
                ['Amount', '&#x20A6;' + Number(selected.total_amount).toLocaleString()],
                ['Due Date', selected.due_date ? new Date(selected.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'}) : '—'],
                ['Created', new Date(selected.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})],
                ['Notes', selected.notes],
              ].map(([label, value]) => value ? (
                <div key={label as string}>
                  <p style={{ fontSize:11, fontWeight:700, color:'var(--admin-text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{label as string}</p>
                  <p style={{ fontSize:14, color:'var(--admin-text)', fontWeight:500 }} dangerouslySetInnerHTML={{ __html: value as string }}/>
                </div>
              ) : null)}
              <button onClick={() => setSelected(null)}
                style={{ height:44, background:'var(--admin-accent,#0E1A6E)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', marginTop:8 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
