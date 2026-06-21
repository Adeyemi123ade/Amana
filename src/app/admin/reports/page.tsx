import { getAdminSupabase } from '@/lib/admin-auth'
import Link from 'next/link'

export default async function AdminReportsPage() {
  const db = getAdminSupabase()
  const [
    { count: businesses },
    { count: invoices },
    { count: payments },
    { count: appointments },
    { count: customers },
    { count: kyc },
  ] = await Promise.all([
    db.from('workspaces').select('*',{count:'exact',head:true}),
    db.from('invoices').select('*',{count:'exact',head:true}),
    db.from('payments').select('*',{count:'exact',head:true}),
    db.from('appointments').select('*',{count:'exact',head:true}),
    db.from('customers').select('*',{count:'exact',head:true}),
    db.from('kyc_submissions').select('*',{count:'exact',head:true}),
  ])
  const { data: paidPays } = await db.from('payments').select('amount').eq('status','SUCCESS')
  const totalRev = (paidPays||[]).reduce((s:number,p:any)=>s+Number(p.amount),0)

  const reports = [
    { label:'Business Growth Report',     desc:`${businesses||0} total businesses on the platform`, link:'/admin/businesses' },
    { label:'Invoice Activity Report',    desc:`${invoices||0} invoices created across all businesses`, link:'/admin/invoices' },
    { label:'Payment Activity Report',    desc:`₦${totalRev.toLocaleString()} total collected`, link:'/admin/payments' },
    { label:'Appointment Activity Report',desc:`${appointments||0} appointments scheduled`, link:'/admin/businesses' },
    { label:'Customer Activity Report',   desc:`${customers||0} customers across all businesses`, link:'/admin/businesses' },
    { label:'KYC Status Report',          desc:`${kyc||0} total KYC submissions`, link:'/admin/kyc' },
  ]

  return (
    <div>
      <h1 style={{ fontSize:20, fontWeight:800, color:'#0F172A', marginBottom:6 }}>Admin Reports</h1>
      <p style={{ fontSize:13, color:'#64748B', marginBottom:24 }}>Platform-wide analytics and downloadable reports</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
        {reports.map(r=>(
          <Link key={r.label} href={r.link} style={{ textDecoration:'none', background:'white', borderRadius:12, padding:'20px', border:'1px solid #E2E8F0', display:'block' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#0F172A', marginBottom:4 }}>{r.label}</p>
            <p style={{ fontSize:12, color:'#64748B', marginBottom:16 }}>{r.desc}</p>
            <span style={{ fontSize:11, fontWeight:600, color:'#7C3AED' }}>View →</span>
          </Link>
        ))}
      </div>
      <div style={{ background:'white', borderRadius:12, border:'1px solid #E2E8F0', padding:'20px 24px' }}>
        <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:12 }}>Download Platform Reports</p>
        <div style={{ display:'flex', gap:10 }}>
          <a href="/api/reports?workspace=all&type=full&format=pdf" target="_blank" rel="noreferrer"
            style={{ padding:'9px 18px', background:'#0E1A6E', color:'white', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            📄 Full PDF Report
          </a>
          <a href="/api/reports?workspace=all&type=invoices&format=csv" target="_blank" rel="noreferrer"
            style={{ padding:'9px 18px', background:'#F8FAFC', border:'1px solid #E2E8F0', color:'#374151', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            📊 Invoice CSV
          </a>
          <a href="/api/reports?workspace=all&type=payments&format=csv" target="_blank" rel="noreferrer"
            style={{ padding:'9px 18px', background:'#F8FAFC', border:'1px solid #E2E8F0', color:'#374151', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            💳 Payment CSV
          </a>
        </div>
      </div>
    </div>
  )
}
