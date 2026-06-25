import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatTime } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces').select('*').eq('created_by', user.id).maybeSingle()

  if (!wsError && !workspace) {
    redirect('/onboarding/business-information')
  }

  if (wsError || !workspace) {
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center', padding:32}}>
        <div style={{fontSize:48, marginBottom:16}}>⚠️</div>
        <p style={{fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8}}>We could not load your workspace</p>
        <p style={{fontSize:14, color:'var(--text-muted)', marginBottom:20, maxWidth:360}}>
          Please refresh the page. If this keeps happening, contact support.
        </p>
        <a href="/dashboard" style={{background:'var(--accent)', color:'white', padding:'12px 24px', borderRadius:10, fontSize:14, fontWeight:600, textDecoration:'none'}}>
          Refresh Page
        </a>
      </div>
    )
  }

  const currency = workspace.currency || 'NGN'
  const wid = workspace.id

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  const [
    { data: invoices },
    { data: customers },
    { data: appointments },
    { data: payments },
    { data: thisMonthPay },
    { data: lastMonthPay },
  ] = await Promise.all([
    supabase.from('invoices').select('*, customers(name)').eq('workspace_id', wid).order('created_at', { ascending: false }).limit(20),
    supabase.from('customers').select('id').eq('workspace_id', wid),
    supabase.from('appointments').select('*, customers(name)').eq('workspace_id', wid).gte('start_time', new Date().toISOString().split('T')[0]).order('start_time', { ascending: true }).limit(10),
    supabase.from('payments').select('*').eq('workspace_id', wid).order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('amount').eq('workspace_id', wid).eq('status', 'SUCCESS').gte('created_at', startOfThisMonth),
    supabase.from('payments').select('amount').eq('workspace_id', wid).eq('status', 'SUCCESS').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
  ])

  const thisMonthRevenue = (thisMonthPay || []).reduce((s, p) => s + Number(p.amount), 0)
  const lastMonthRevenue = (lastMonthPay || []).reduce((s, p) => s + Number(p.amount), 0)
  const totalRevenue = (payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const revenueGrowth = lastMonthRevenue === 0
    ? null
    : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)

  const unpaid = (invoices || []).filter(i => ['UNPAID','OVERDUE'].includes(i.status))
  const unpaidAmt = unpaid.reduce((s, i) => s + Number(i.total_amount), 0)
  const today = new Date().toDateString()
  const todayAppts = (appointments || []).filter(a => new Date(a.start_time).toDateString() === today)
  const overdue = (invoices || []).filter(i => i.status === 'OVERDUE')
  const recentInvoices = (invoices || []).slice(0, 5)
  const recentPayments = (payments || []).slice(0, 3)

  const revenueSubtext = totalRevenue === 0
    ? 'No payments yet'
    : revenueGrowth === null
      ? 'No comparison data yet'
      : `${parseFloat(revenueGrowth) >= 0 ? '+' : ''}${revenueGrowth}% vs last month`

  const revenueSubColor = revenueGrowth !== null && parseFloat(revenueGrowth) < 0
    ? 'var(--danger)'
    : 'var(--success)'

  const statusBadge = (status: string) => {
    const map: Record<string,[string,string]> = {
      PAID:['#22C55E','#F0FDF4'], UNPAID:['#F59E0B','#FFFBEB'],
      OVERDUE:['#EF4444','#FEF2F2'], DRAFT:['#6B7280','#F9FAFB'],
    }
    const [color, bg] = map[status] || ['#6B7280','#F9FAFB']
    return <span style={{fontSize:11, fontWeight:600, color, background:bg, padding:'3px 9px', borderRadius:20, flexShrink:0}}>{status.charAt(0)+status.slice(1).toLowerCase()}</span>
  }

  const card = (label: string, value: string, sub: string, subColor: string, valueColor = 'var(--text)') => (
    <div style={{background:'var(--card)', borderRadius:14, padding:'16px 18px', border:'1px solid var(--border)'}}>
      <p style={{fontSize:11, color:'var(--text-muted)', fontWeight:500, marginBottom:6, textTransform:'uppercase', letterSpacing:0.3}}>{label}</p>
      <p className="stat-value" style={{fontSize:22, fontWeight:800, color:valueColor, marginBottom:2}}>{value}</p>
      <p style={{fontSize:11, color:subColor}}>{sub}</p>
    </div>
  )

  const empty = (icon: string, title: string, sub: string) => (
    <div style={{textAlign:'center', padding:'24px 0'}}>
      <div style={{fontSize:32, marginBottom:8}}>{icon}</div>
      <p style={{fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:4}}>{title}</p>
      <p style={{fontSize:12, color:'var(--text-muted)'}}>{sub}</p>
    </div>
  )

  return (
    <div style={{display:'flex', flexDirection:'column', gap:18}}>
      <div className="stat-grid">
        {card('Total Revenue', totalRevenue > 0 ? formatCurrency(totalRevenue, currency) : '—', revenueSubtext, revenueSubColor)}
        {card('Unpaid Invoices', unpaidAmt > 0 ? formatCurrency(unpaidAmt, currency) : '—', unpaid.length > 0 ? `${unpaid.length} invoices pending` : 'All invoices paid', 'var(--text-muted)', unpaidAmt > 0 ? 'var(--danger)' : 'var(--text)')}
        {card("Today's Appointments", String(todayAppts.length), todayAppts.length > 0 ? `${todayAppts.filter(a=>a.status==='CONFIRMED').length} confirmed` : 'No appointments today', 'var(--text-muted)')}
        {card('Customers', String((customers||[]).length), (customers||[]).length > 0 ? `${(customers||[]).length} total` : 'No customers yet', 'var(--accent)')}
      </div>

      <div className="two-col-grid">
        <div style={{background:'var(--card)', borderRadius:14, padding:'18px 20px', border:'1px solid var(--border)'}}>
          <p style={{fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:12}}>What needs your attention</p>
          {overdue.length === 0 && unpaid.length === 0 && todayAppts.length === 0 ? (
            <div style={{textAlign:'center', padding:'20px 0'}}>
              <div style={{fontSize:28, marginBottom:6}}>✅</div>
              <p style={{fontSize:13, fontWeight:500, color:'var(--text)'}}>You are all caught up</p>
              <p style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>Nothing needs your attention right now</p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {overdue.length > 0 && <Link href="/dashboard/invoices" style={{display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, textDecoration:'none', background:'var(--bg-secondary)'}}>
                <span>🔴</span>
                <div><p style={{fontSize:12, fontWeight:500, color:'var(--text)'}}>{overdue.length} invoice{overdue.length>1?'s':''} overdue</p><p style={{fontSize:11, color:'var(--text-muted)'}}>Customers have not paid yet</p></div>
              </Link>}
              {unpaid.length > 0 && <Link href="/dashboard/invoices" style={{display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, textDecoration:'none', background:'var(--bg-secondary)'}}>
                <span>🟡</span>
                <div><p style={{fontSize:12, fontWeight:500, color:'var(--text)'}}>{unpaid.length} invoice{unpaid.length>1?'s':''} waiting for payment</p><p style={{fontSize:11, color:'var(--text-muted)'}}>Send reminders to customers</p></div>
              </Link>}
              {todayAppts.length > 0 && <Link href="/dashboard/appointments" style={{display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:10, textDecoration:'none', background:'var(--bg-secondary)'}}>
                <span>📅</span>
                <div><p style={{fontSize:12, fontWeight:500, color:'var(--text)'}}>{todayAppts.length} appointment{todayAppts.length>1?'s':''} today</p><p style={{fontSize:11, color:'var(--text-muted)'}}>View your schedule</p></div>
              </Link>}
            </div>
          )}
        </div>

        <div style={{background:'var(--card)', borderRadius:14, padding:'18px 20px', border:'1px solid var(--border)'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <p style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>Recent Invoices</p>
            <Link href="/dashboard/invoices" style={{fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:500}}>View all</Link>
          </div>
          {recentInvoices.length === 0 ? empty('📄','No invoices yet','Create your first invoice to get started') : recentInvoices.map((inv:any) => (
            <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} style={{display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)', textDecoration:'none', alignItems:'center', gap:8}}>
              <div style={{display:'flex', alignItems:'center', gap:10, minWidth:0}}>
                <div style={{width:28, height:28, borderRadius:'50%', background:'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--accent)', flexShrink:0}}>{inv.customers?.name?.[0]?.toUpperCase()||'?'}</div>
                <div style={{minWidth:0}}><p style={{fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{inv.customers?.name||'Unknown'}</p><p style={{fontSize:11, color:'var(--text-muted)'}}>{inv.invoice_number}</p></div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}><span style={{fontSize:12, fontWeight:600, color:'var(--text)'}}>{formatCurrency(Number(inv.total_amount),currency)}</span>{statusBadge(inv.status)}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="two-col-grid">
        <div style={{background:'var(--card)', borderRadius:14, padding:'18px 20px', border:'1px solid var(--border)'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <p style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>Upcoming Appointments</p>
            <Link href="/dashboard/appointments" style={{fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:500}}>View calendar</Link>
          </div>
          {todayAppts.length === 0 ? empty('📅','No appointments today','Click Appointments to schedule one') : todayAppts.map((a:any) => (
            <div key={a.id} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:12, color:'var(--text-muted)', fontWeight:500, minWidth:56, flexShrink:0}}>{formatTime(a.start_time)}</span>
              <div style={{flex:1, minWidth:0}}><p style={{fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.customers?.name||'Unknown'}</p><p style={{fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.title}</p></div>
              <span style={{fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, flexShrink:0, color:a.status==='CONFIRMED'?'#22C55E':'#F59E0B', background:a.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB'}}>{a.status==='CONFIRMED'?'Confirmed':'Pending'}</span>
            </div>
          ))}
        </div>

        <div style={{background:'var(--card)', borderRadius:14, padding:'18px 20px', border:'1px solid var(--border)'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
            <p style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>Recent Payments</p>
            <Link href="/dashboard/payments" style={{fontSize:12, color:'var(--accent)', textDecoration:'none', fontWeight:500}}>View all</Link>
          </div>
          {recentPayments.length === 0 ? empty('💳','No payments yet','Payments appear here once received') : recentPayments.map((p:any) => (
            <div key={p.id} style={{display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)', alignItems:'center'}}>
              <div style={{minWidth:0}}><p style={{fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.customer_email||'Customer'}</p><p style={{fontSize:11, color:'var(--text-muted)'}}>{new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p></div>
              <div style={{textAlign:'right', flexShrink:0, marginLeft:8}}><p style={{fontSize:13, fontWeight:700, color:'var(--text)'}}>{formatCurrency(Number(p.amount),currency)}</p><p style={{fontSize:11, color:'#22C55E'}}>Paid</p></div>
            </div>
          ))}
        </div>
      </div>

      {workspace.slug && (
        <div style={{background:'var(--card)', borderRadius:14, padding:'18px 20px', border:'1px solid var(--border)', marginTop:16}}>
          <div style={{marginBottom:10}}>
            <p style={{fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2}}>📅 Your Public Booking Page</p>
            <p style={{fontSize:12, color:'var(--text-muted)'}}>Share this link with customers so they can book appointments directly</p>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <div style={{flex:1, background:'var(--bg-secondary)', borderRadius:8, padding:'10px 12px', border:'1px solid var(--border)', overflow:'hidden'}}>
              <p style={{fontSize:12, color:'var(--accent)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'monospace'}}>{'https://amana-two.vercel.app/book/' + workspace.slug}</p>
            </div>
            <Link href={'/book/' + workspace.slug} target="_blank"
              style={{fontSize:12, fontWeight:600, color:'var(--accent)', textDecoration:'none', padding:'8px 14px', border:'1px solid var(--accent)', borderRadius:8, flexShrink:0, whiteSpace:'nowrap'}}>
              Preview
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}