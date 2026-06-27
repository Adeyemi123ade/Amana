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
    { label:'Business Growth', desc:`${businesses||0} total businesses`, link:'/admin/businesses', color:'#3B82F6' },
    { label:'Invoice Activity', desc:`${invoices||0} invoices created`, link:'/admin/invoices', color:'#7C3AED' },
    { label:'Payment Activity', desc:`Total collected: &#x20A6;${totalRev.toLocaleString()}`, link:'/admin/payments', color:'#16A34A' },
    { label:'Appointments', desc:`${appointments||0} appointments scheduled`, link:'/admin/businesses', color:'#EC4899' },
    { label:'Customer Activity', desc:`${customers||0} customers registered`, link:'/admin/users', color:'#0EA5E9' },
    { label:'KYC Status', desc:`${kyc||0} total KYC submissions`, link:'/admin/kyc', color:'#D97706' },
  ]

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Admin Reports</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>Platform-wide analytics and downloadable reports</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16, marginBottom:28 }}>
        {reports.map(r => (
          <Link key={r.label} href={r.link} style={{ textDecoration:'none' }}>
            <div style={{ background:'var(--admin-card)', borderRadius:12, padding:'20px', border:'1px solid var(--admin-card-border)' }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:6 }}>{r.label}</p>
              <p style={{ fontSize:13, color:'var(--admin-text-muted)', marginBottom:14 }} dangerouslySetInnerHTML={{ __html: r.desc }}/>
              <span style={{ fontSize:12, fontWeight:700, color:r.color }}>View details</span>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', padding:'20px 24px' }}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:14 }}>Download Platform Reports</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {[
            ['/api/reports?workspace=all&type=full&format=pdf', 'Full PDF Report', '#0E1A6E', 'white'],
            ['/api/reports?workspace=all&type=invoices&format=csv', 'Invoice CSV', 'var(--admin-bg)', 'var(--admin-text)'],
            ['/api/reports?workspace=all&type=payments&format=csv', 'Payment CSV', 'var(--admin-bg)', 'var(--admin-text)'],
          ].map(([href, label, bg, color]) => (
            <a key={label as string} href={href as string} target="_blank" rel="noreferrer"
              style={{ padding:'10px 20px', background:bg as string, border:'1px solid var(--admin-card-border)', color:color as string, borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none' }}>
              {label as string}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
