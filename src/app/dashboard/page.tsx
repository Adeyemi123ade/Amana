import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatTime } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workspace } = await supabase
    .from('workspaces').select('*').eq('created_by', user?.id).single()

  // If no workspace exists, send them to onboarding — never show the setup widget on dashboard
  if (!workspace) {
    redirect('/onboarding/identity-verification')
  }

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
    return <span style={{fontSize:11,fontWeight:600,color,background:bg,padding:'3px 10px',borderRadius:20}}>{status.charAt(0)+status.slice(1).toLowerCase()}</span>
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
        {[
          {label:'Total Revenue', value:formatCurrency(totalRevenue,currency), sub:'+12.5% this month', subColor:'#22C55E', valueColor:'#111827'},
          {label:'Unpaid Invoices', value:formatCurrency(unpaidAmt,currency), sub:`${unpaid.length} invoices`, subColor:'#6B7280', valueColor:'#EF4444'},
          {label:"Today's Appointments", value:String(todayAppts.length), sub:`${todayAppts.filter(a=>a.status==='CONFIRMED').length} confirmed`, subColor:'#6B7280', valueColor:'#111827'},
          {label:'Customers', value:String((customers||[]).length), sub:'+8 this month', subColor:'#7C3AED', valueColor:'#111827'},
        ].map(card => (
          <div key={card.label} style={{background:'white',borderRadius:14,padding:'18px 20px',border:'1px solid #F3F4F6'}}>
            <p style={{fontSize:12,color:'#6B7280',fontWeight:500,marginBottom:6}}>{card.label}</p>
            <p style={{fontSize:24,fontWeight:800,color:card.valueColor,marginBottom:2}}>{card.value}</p>
            <p style={{fontSize:11,color:card.subColor}}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Attention + Recent Invoices */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
        <div style={{background:'white',borderRadius:14,padding:'20px',border:'1px solid #F3F4F6'}}>
          <p style={{fontSize:13,fontWeight:600,color:'#111827',marginBottom:14}}>What needs your attention</p>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              {emoji:'🔴',label:`${overdue.length} invoices overdue`,sub:'Require follow-up',href:'/dashboard/invoices'},
              {emoji:'🟡',label:`${unconfirmed.length} appointments unconfirmed`,sub:'Require confirmation',href:'/dashboard/appointments'},
              {emoji:'🔵',label:`${(customers||[]).length} customers to follow up`,sub:'No activity in 7 days',href:'/dashboard/customers'},
              {emoji:'⚠️',label:'1 high-value inactive customer',sub:'No activity in 19 days',href:'/dashboard/customers'},
            ].map(item => (
              <Link key={item.label} href={item.href} style={{display:'flex',alignItems:'center',gap:10,padding:'10px',borderRadius:10,textDecoration:'none',background:'#F9FAFB'}}>
                <span style={{fontSize:14}}>{item.emoji}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:12,fontWeight:500,color:'#111827'}}>{item.label}</p>
                  <p style={{fontSize:11,color:'#9CA3AF'}}>{item.sub}</p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        </div>

        <div style={{background:'white',borderRadius:14,padding:'20px',border:'1px solid #F3F4F6'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
            <p style={{fontSize:13,fontWeight:600,color:'#111827'}}>Recent Invoices</p>
            <Link href="/dashboard/invoices" style={{fontSize:12,color:'#7C3AED',textDecoration:'none',fontWeight:500}}>View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <p style={{fontSize:13,color:'#9CA3AF',marginBottom:8}}>No invoices yet</p>
              <Link href="/dashboard/invoices/create" style={{fontSize:13,color:'#7C3AED',textDecoration:'none',fontWeight:500}}>Create your first invoice</Link>
            </div>
          ) : recentInvoices.map((inv: any) => (
            <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #F9FAFB',textDecoration:'none',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#7C3AED',flexShrink:0}}>
                  {inv.customers?.name?.[0]?.toUpperCase()||'?'}
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{inv.customers?.name||'Unknown'}</p>
                  <p style={{fontSize:11,color:'#9CA3AF'}}>{inv.invoice_number}</p>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:13,fontWeight:600,color:'#111827'}}>{formatCurrency(Number(inv.total_amount),currency)}</span>
                {statusBadge(inv.status)}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Appointments + Payments */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
        <div style={{background:'white',borderRadius:14,padding:'20px',border:'1px solid #F3F4F6'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
            <p style={{fontSize:13,fontWeight:600,color:'#111827'}}>Upcoming Appointments</p>
            <Link href="/dashboard/appointments" style={{fontSize:12,color:'#7C3AED',textDecoration:'none',fontWeight:500}}>View calendar</Link>
          </div>
          {todayAppts.length === 0 ? (
            <p style={{fontSize:13,color:'#9CA3AF',textAlign:'center',padding:'16px 0'}}>No appointments today</p>
          ) : todayAppts.map((a: any) => (
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #F9FAFB'}}>
              <span style={{fontSize:12,color:'#6B7280',fontWeight:500,minWidth:60}}>{formatTime(a.start_time)}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{a.customers?.name||'Unknown'}</p>
                <p style={{fontSize:11,color:'#9CA3AF'}}>{a.title}</p>
              </div>
              <span style={{fontSize:11,fontWeight:600,color:a.status==='CONFIRMED'?'#22C55E':'#F59E0B',background:a.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB',padding:'3px 8px',borderRadius:20}}>
                {a.status==='CONFIRMED'?'Confirmed':'Pending'}
              </span>
            </div>
          ))}
        </div>

        <div style={{background:'white',borderRadius:14,padding:'20px',border:'1px solid #F3F4F6'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
            <p style={{fontSize:13,fontWeight:600,color:'#111827'}}>Recent Payments</p>
            <Link href="/dashboard/payments" style={{fontSize:12,color:'#7C3AED',textDecoration:'none',fontWeight:500}}>View all</Link>
          </div>
          {recentPayments.length === 0 ? (
            <p style={{fontSize:13,color:'#9CA3AF',textAlign:'center',padding:'16px 0'}}>No payments yet</p>
          ) : recentPayments.map((p: any) => (
            <div key={p.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #F9FAFB',alignItems:'center'}}>
              <div>
                <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{p.customer_email||'Customer'}</p>
                <p style={{fontSize:11,color:'#9CA3AF'}}>{new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:13,fontWeight:700,color:'#111827'}}>{formatCurrency(Number(p.amount),currency)}</p>
                <p style={{fontSize:11,color:'#22C55E'}}>Paid</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
