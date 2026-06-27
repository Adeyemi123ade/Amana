import { getAdminSupabase } from '@/lib/admin-auth'
import Link from 'next/link'

export default async function AdminReportsPage() {
  const db = getAdminSupabase()
  const [
    { count: businesses }, { count: invoices }, { count: payments },
    { count: appointments }, { count: customers }, { count: kyc },
  ] = await Promise.all([
    db.from('workspaces').select('*',{count:'exact',head:true}),
    db.from('invoices').select('*',{count:'exact',head:true}),
    db.from('payments').select('*',{count:'exact',head:true}),
    db.from('appointments').select('*',{count:'exact',head:true}),
    db.from('customers').select('*',{count:'exact',head:true}),
    db.from('kyc_submissions').select('*',{count:'exact',head:true}),
  ])
  const { data: paidPays } = await db.from('payments').select('amount').eq('status','SUCCESS')
  const totalRev = (paidPays||[]).reduce((s:number,p:any) => s+Number(p.amount), 0)

  const reports = [
    { label:'Business Growth', desc:`${businesses||0} total businesses`, link:'/admin/businesses', color:'#3B82F6', icon:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
    { label:'Invoice Activity', desc:`${invoices||0} invoices created`, link:'/admin/invoices', color:'#7C3AED', icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9v13a2 2 0 01-2 2z' },
    { label:'Payment Activity', desc:`\u20A6${totalRev.toLocaleString()} total collected`, link:'/admin/payments', color:'#16A34A', icon:'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { label:'Appointments', desc:`${appointments||0} appointments scheduled`, link:'/admin/businesses', color:'#EC4899', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label:'Customer Activity', desc:`${customers||0} customers registered`, link:'/admin/users', color:'#0EA5E9', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label:'KYC Status', desc:`${kyc||0} total KYC submissions`, link:'/admin/kyc', color:'#D97706', icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Admin Reports</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>Platform-wide analytics and downloadable reports</p>
      </div>

      {/* 3-col grid on desktop, 2-col on tablet, 1-col on mobile */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:24 }}>
        {reports.map(r => (
          <Link key={r.label} href={r.link} style={{ textDecoration:'none' }}>
            <div style={{ background:'var(--admin-card)', borderRadius:14, padding:'20px', border:'1px solid var(--admin-card-border)', height:'100%', boxSizing:'border-box' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:r.color + '20', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={r.icon}/>
                </svg>
              </div>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:6 }}>{r.label}</p>
              <p style={{ fontSize:13, color:'var(--admin-text-muted)', marginBottom:16 }}>{r.desc}</p>
              <span style={{ fontSize:12, fontWeight:700, color:r.color }}>View details</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Download section */}
      <div style={{ background:'var(--admin-card)', borderRadius:14, border:'1px solid var(--admin-card-border)', padding:'20px 24px' }}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:14 }}>Download Platform Reports</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          <a href="/api/reports?workspace=all&type=full&format=pdf" target="_blank" rel="noreferrer"
            style={{ padding:'10px 20px', background:'#0E1A6E', color:'white', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            Full PDF Report
          </a>
          <a href="/api/reports?workspace=all&type=invoices&format=csv" target="_blank" rel="noreferrer"
            style={{ padding:'10px 20px', background:'var(--admin-bg)', border:'1px solid var(--admin-card-border)', color:'var(--admin-text)', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            Invoice CSV
          </a>
          <a href="/api/reports?workspace=all&type=payments&format=csv" target="_blank" rel="noreferrer"
            style={{ padding:'10px 20px', background:'var(--admin-bg)', border:'1px solid var(--admin-card-border)', color:'var(--admin-text)', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            Payment CSV
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 899px) {
          .reports-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .reports-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
