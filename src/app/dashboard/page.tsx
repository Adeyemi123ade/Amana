import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatTime } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: workspace } = await supabase
    .from('workspaces').select('*').eq('created_by', user.id).maybeSingle()

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
  const recentInvoices = (invoices || []).slice(0, 5)
  const recentPayments = (payments || []).slice(0, 3)

  const statusBadge = (status: string) => {
    const map: Record<string,[string,string]> = {
      PAID:['#22C55E','#F0FDF4'], UNPAID:['#F59E0B','#FFFBEB'],
      OVERDUE:['#EF4444','#FEF2F2'], DRAFT:['#6B7280','#F9FAFB'],
    }
    const [color, bg] = map[status] || ['#6B7280','#F9FAFB']
    return <span style={{fontSize:11,fontWeight:600,color,background:bg,padding:'3px 9px',borderRadius:20,flexShrink:0}}>{status.charAt(0)+status.slice(1).toLowerCase()}</span>
  }

  const emptyCard = (icon: string, title: string, sub: string, href: string, btnLabel: string) => (
    <div style={{textAlign:'center',padding:'28px 20px'}}>
      <div style={{fontSize:32,marginBottom:10}}>{icon}</div>
      <p style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:4}}>{title}</p>
      <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:14}}>{sub}</p>
      <Link href={href} style={{background:'var(--accent)',color:'white',padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-block'}}>{btnLabel}</Link>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>

      {/* Stats */}
      <div className="stat-grid">
        {[
          {label:'Total Revenue', value: totalRevenue > 0 ? formatCurrency(totalRevenue,currency) : '—', sub: totalRevenue > 0 ? '+12.5% this month' : 'No payments yet', subColor:'var(--success)', valueColor:'var(--text)'},
          {label:'Unpaid Invoices', value: unpaidAmt > 0 ? formatCurrency(unpaidAmt,currency) : '—', sub: unpaid.length > 0 ? `${unpaid.length} invoices pending` : 'All invoices paid', subColor:'var(--text-muted)', valueColor: unpaidAmt > 0 ? 'var(--danger)' : 'var(--text)'},
          {label:"Today's Appointments", value: String(todayAppts.length || 0), sub: todayAppts.length > 0 ? `${todayAppts.filter(a=>a.status==='CONFIRMED').length} confirmed` : 'No appointments today', subColor:'var(--text-muted)', valueColor:'var(--text)'},
          {label:'Customers', value: String((customers||[]).length || 0), sub: (customers||[]).length > 0 ? `${(customers||[]).length} total` : 'No customers yet', subColor:'var(--accent)', valueColor:'var(--text)'},
        ].map(card => (
          <div key={card.label} style={{background:'var(--card)',borderRadius:14,padding:'16px 18px',border:'1px solid var(--border)'}}>
            <p style={{fontSize:11,color:'var(--text-muted)',fontWeight:500,marginBottom:6,textTransform:'uppercase',letterSpacing:0.3}}>{card.label}</p>
            <p className="stat-value" style={{fontSize:22,fontWeight:800,color:card.valueColor,marginBottom:2,lineHeight:1}}>{card.value}</p>
            <p style={{fontSize:11,color:card.subColor}}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Attention + Recent Invoices */}
      <div className="two-col-grid">
        <div style={{background:'var(--card)',borderRadius:14,padding:'18px 20px',border:'1px solid var(--border)'}}>
          <p style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:12}}>What needs your attention</p>
          {overdue.length === 0 && todayAppts.length === 0 && (invoices||[]).length === 0 ? (
            <div style={{textAlign:'center',padding:'24px 0'}}>
              <div style={{fontSize:32,marginBottom:8}}>✅</div>
              <p style={{fontSize:13,fontWeight:500,color:'var(--text)',marginBottom:4}}>You are all caught up</p>
              <p style={{fontSize:12,color:'var(--text-muted)'}}>Nothing needs your attention right now</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {overdue.length > 0 && (
                <Link href="/dashboard/invoices" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,textDecoration:'none',background:'var(--bg-secondary)'}}>
                  <span style={{fontSize:14,flexShrink:0}}>🔴</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:500,color:'var(--text)'}}>{overdue.length} invoice{overdue.length>1?'s':''} overdue</p>
                    <p style={{fontSize:11,color:'var(--text-muted)'}}>Customers have not paid yet</p>
                  </div>
                </Link>
              )}
              {todayAppts.length > 0 && (
                <Link href="/dashboard/appointments" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,textDecoration:'none',background:'var(--bg-secondary)'}}>
                  <span style={{fontSize:14,flexShrink:0}}>📅</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:500,color:'var(--text)'}}>{todayAppts.length} appointment{todayAppts.length>1?'s':''} today</p>
                    <p style={{fontSize:11,color:'var(--text-muted)'}}>View your schedule</p>
                  </div>
                </Link>
              )}
              {unpaid.length > 0 && (
                <Link href="/dashboard/invoices" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,textDecoration:'none',background:'var(--bg-secondary)'}}>
                  <span style={{fontSize:14,flexShrink:0}}>🟡</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:500,color:'var(--text)'}}>{unpaid.length} invoice{unpaid.length>1?'s':''} waiting for payment</p>
                    <p style={{fontSize:11,color:'var(--text-muted)'}}>Send reminders to customers</p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        <div style={{background:'var(--card)',borderRadius:14,padding:'18px 20px',border:'1px solid var(--border)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <p style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>Recent Invoices</p>
            <Link href="/dashboard/invoices" style={{fontSize:12,color:'var(--accent)',textDecoration:'none',fontWeight:500}}>View all</Link>
          </div>
          {recentInvoices.length === 0
            ? emptyCard('📄','No invoices yet','Your invoices will appear here once you create them','/dashboard/invoices/create','Create Invoice')
            : recentInvoices.map((inv: any) => (
              <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)',textDecoration:'none',alignItems:'center',gap:8}}>
                <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--accent)',flexShrink:0}}>
                    {inv.customers?.name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div style={{minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:500,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.customers?.name||'Unknown'}</p>
                    <p style={{fontSize:11,color:'var(--text-muted)'}}>{inv.invoice_number}</p>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{formatCurrency(Number(inv.total_amount),currency)}</span>
                  {statusBadge(inv.status)}
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Appointments + Payments */}
      <div className="two-col-grid">
        <div style={{background:'var(--card)',borderRadius:14,padding:'18px 20px',border:'1px solid var(--border)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <p style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>Upcoming Appointments</p>
            <Link href="/dashboard/appointments" style={{fontSize:12,color:'var(--accent)',textDecoration:'none',fontWeight:500}}>View calendar</Link>
          </div>
          {todayAppts.length === 0
            ? emptyCard('📅','No appointments today','Your appointments will appear here','/dashboard/appointments','Schedule Appointment')
            : todayAppts.map((a: any) => (
              <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:12,color:'var(--text-muted)',fontWeight:500,minWidth:56,flexShrink:0}}>{formatTime(a.start_time)}</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:500,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.customers?.name||'Unknown'}</p>
                  <p style={{fontSize:11,color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</p>
                </div>
                <span style={{fontSize:11,fontWeight:600,color:a.status==='CONFIRMED'?'#22C55E':'#F59E0B',background:a.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB',padding:'3px 8px',borderRadius:20,flexShrink:0}}>
                  {a.status==='CONFIRMED'?'Confirmed':'Pending'}
                </span>
              </div>
            ))}
        </div>

        <div style={{background:'var(--card)',borderRadius:14,padding:'18px 20px',border:'1px solid var(--border)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <p style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>Recent Payments</p>
            <Link href="/dashboard/payments" style={{fontSize:12,color:'var(--accent)',textDecoration:'none',fontWeight:500}}>View all</Link>
          </div>
          {recentPayments.length === 0
            ? emptyCard('💳','No payments yet','Payments will appear here once customers pay','/dashboard/invoices/create','Create Invoice')
            : recentPayments.map((p: any) => (
              <div key={p.id} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)',alignItems:'center'}}>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:500,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.customer_email||'Customer'}</p>
                  <p style={{fontSize:11,color:'var(--text-muted)'}}>{new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:8}}>
                  <p style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{formatCurrency(Number(p.amount),currency)}</p>
                  <p style={{fontSize:11,color:'var(--success)'}}>Paid</p>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  )
}
