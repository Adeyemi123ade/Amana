import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatTime } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workspace } = await supabase
    .from('workspaces').select('*').eq('created_by', user?.id).single()

  if (!workspace) redirect('/onboarding/business-information')

  const currency = workspace.currency || 'NGN'
  const wid = workspace.id

  const [
    { data: invoices },
    { data: customers },
    { data: appointments },
    { data: payments },
  ] = await Promise.all([
    supabase.from('invoices').select('*, customers(name)').eq('workspace_id', wid).order('created_at', { ascending: false }).limit(20),
    supabase.from('customers').select('id').eq('workspace_id', wid),
    supabase.from('appointments').select('*, customers(name)').eq('workspace_id', wid).gte('start_time', new Date().toISOString().split('T')[0]).order('start_time', { ascending: true }).limit(10),
    supabase.from('payments').select('*').eq('workspace_id', wid).order('created_at', { ascending: false }).limit(5),
  ])

  const totalRevenue = (payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const unpaid = (invoices || []).filter(i => ['UNPAID','OVERDUE'].includes(i.status))
  const unpaidAmt = unpaid.reduce((s, i) => s + Number(i.total_amount), 0)
  const today = new Date().toDateString()
  const todayAppts = (appointments || []).filter(a => new Date(a.start_time).toDateString() === today)
  const overdue = (invoices || []).filter(i => i.status === 'OVERDUE')
  const unconfirmed = (appointments || []).filter(a => a.status === 'PENDING')
  const recentInvoices = (invoices || []).slice(0, 5)
  const recentPayments = (payments || []).slice(0, 3)

  const statusBadge = (status: string) => {
    const map: Record<string, [string, string]> = {
      PAID: ['#22C55E', '#F0FDF4'],
      UNPAID: ['#F59E0B', '#FFFBEB'],
      OVERDUE: ['#EF4444', '#FEF2F2'],
      DRAFT: ['#6B7280', '#F9FAFB'],
    }
    const [color, bg] = map[status] || ['#6B7280', '#F9FAFB']
    return (
      <span style={{fontSize:11, fontWeight:600, color, background:bg, padding:'3px 9px', borderRadius:20, flexShrink:0}}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  const card = (label: string, value: string, sub: string, subColor: string, valueColor = '#111827') => (
    <div style={{background:'white', borderRadius:14, padding:'16px 18px', border:'1px solid #F3F4F6'}}>
      <p style={{fontSize:11, color:'#6B7280', fontWeight:500, marginBottom:6, textTransform:'uppercase', letterSpacing:0.3}}>{label}</p>
      <p className="stat-value" style={{fontSize:22, fontWeight:800, color:valueColor, marginBottom:2, lineHeight:1}}>{value}</p>
      <p style={{fontSize:11, color:subColor}}>{sub}</p>
    </div>
  )

  return (
    <div style={{display:'flex', flexDirection:'column', gap:18}}>

      {/* Stats — responsive 4-col → 2-col → 2-col */}
      <div className="stat-grid">
        {card('Total Revenue', formatCurrency(totalRevenue, currency), '+12.5% this month', '#22C55E')}
        {card('Unpaid Invoices', formatCurrency(unpaidAmt, currency), `${unpaid.length} invoices`, '#6B7280', '#EF4444')}
        {card("Today's Appointments", String(todayAppts.length), `${todayAppts.filter(a=>a.status==='CONFIRMED').length} confirmed`, '#6B7280')}
        {card('Customers', String((customers||[]).length), '+8 this month', '#7C3AED')}
      </div>

      {/* Attention + Recent Invoices — 2 col on desktop, 1 on mobile */}
      <div className="two-col-grid">
        <div style={{background:'white', borderRadius:14, padding:'18px 20px', border:'1px solid #F3F4F6'}}>
          <p style={{fontSize:13, fontWeight:600, color:'#111827', marginBottom:12}}>What needs your attention</p>
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {[
              { emoji:'🔴', label:`${overdue.length} invoices overdue`, sub:'Require follow-up', href:'/dashboard/invoices' },
              { emoji:'🟡', label:`${unconfirmed.length} appointments unconfirmed`, sub:'Require confirmation', href:'/dashboard/appointments' },
              { emoji:'🔵', label:`${(customers||[]).length} total customers`, sub:'No activity in 7 days', href:'/dashboard/customers' },
              { emoji:'⚠️', label:'1 high-value inactive', sub:'No activity in 19 days', href:'/dashboard/customers' },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, textDecoration:'none', background:'#F9FAFB'}}>
                <span style={{fontSize:14, flexShrink:0}}>{item.emoji}</span>
                <div style={{flex:1, minWidth:0}}>
                  <p style={{fontSize:12, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.label}</p>
                  <p style={{fontSize:11, color:'#9CA3AF'}}>{item.sub}</p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        </div>

        <div style={{background:'white', borderRadius:14, padding:'18px 20px', border:'1px solid #F3F4F6'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <p style={{fontSize:13, fontWeight:600, color:'#111827'}}>Recent Invoices</p>
            <Link href="/dashboard/invoices" style={{fontSize:12, color:'#7C3AED', textDecoration:'none', fontWeight:500}}>View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div style={{textAlign:'center', padding:'16px 0'}}>
              <p style={{fontSize:13, color:'#9CA3AF', marginBottom:6}}>No invoices yet</p>
              <Link href="/dashboard/invoices/create" style={{fontSize:13, color:'#7C3AED', textDecoration:'none', fontWeight:500}}>Create your first invoice</Link>
            </div>
          ) : recentInvoices.map((inv: any) => (
            <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F9FAFB', textDecoration:'none', alignItems:'center', gap:8}}>
              <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
                <div style={{width:30, height:30, borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#7C3AED', flexShrink:0}}>
                  {inv.customers?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:13, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{inv.customers?.name || 'Unknown'}</p>
                  <p style={{fontSize:11, color:'#9CA3AF'}}>{inv.invoice_number}</p>
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
                <span style={{fontSize:12, fontWeight:600, color:'#111827'}}>{formatCurrency(Number(inv.total_amount), currency)}</span>
                {statusBadge(inv.status)}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Appointments + Payments */}
      <div className="two-col-grid">
        <div style={{background:'white', borderRadius:14, padding:'18px 20px', border:'1px solid #F3F4F6'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <p style={{fontSize:13, fontWeight:600, color:'#111827'}}>Upcoming Appointments</p>
            <Link href="/dashboard/appointments" style={{fontSize:12, color:'#7C3AED', textDecoration:'none', fontWeight:500}}>View calendar</Link>
          </div>
          {todayAppts.length === 0 ? (
            <p style={{fontSize:13, color:'#9CA3AF', textAlign:'center', padding:'16px 0'}}>No appointments today</p>
          ) : todayAppts.map((a: any) => (
            <div key={a.id} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid #F9FAFB'}}>
              <span style={{fontSize:12, color:'#6B7280', fontWeight:500, minWidth:56, flexShrink:0}}>{formatTime(a.start_time)}</span>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontSize:13, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.customers?.name || 'Unknown'}</p>
                <p style={{fontSize:11, color:'#9CA3AF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.title}</p>
              </div>
              <span style={{fontSize:11, fontWeight:600, color:a.status==='CONFIRMED'?'#22C55E':'#F59E0B', background:a.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB', padding:'3px 8px', borderRadius:20, flexShrink:0}}>
                {a.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        <div style={{background:'white', borderRadius:14, padding:'18px 20px', border:'1px solid #F3F4F6'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <p style={{fontSize:13, fontWeight:600, color:'#111827'}}>Recent Payments</p>
            <Link href="/dashboard/payments" style={{fontSize:12, color:'#7C3AED', textDecoration:'none', fontWeight:500}}>View all</Link>
          </div>
          {recentPayments.length === 0 ? (
            <p style={{fontSize:13, color:'#9CA3AF', textAlign:'center', padding:'16px 0'}}>No payments yet</p>
          ) : recentPayments.map((p: any) => (
            <div key={p.id} style={{display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #F9FAFB', alignItems:'center'}}>
              <div style={{minWidth:0}}>
                <p style={{fontSize:13, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.customer_email || 'Customer'}</p>
                <p style={{fontSize:11, color:'#9CA3AF'}}>{new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
              </div>
              <div style={{textAlign:'right', flexShrink:0, marginLeft:8}}>
                <p style={{fontSize:13, fontWeight:700, color:'#111827'}}>{formatCurrency(Number(p.amount), currency)}</p>
                <p style={{fontSize:11, color:'#22C55E'}}>Paid</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
