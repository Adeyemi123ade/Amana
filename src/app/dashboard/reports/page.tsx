'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

const supabase = createClient()

export default function ReportsPage() {

  const [workspace, setWorkspace] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [period, setPeriod] = useState('this_month')
  const [showFull, setShowFull] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: ws } = await supabase.from('workspaces').select('*').eq('created_by', user?.id).maybeSingle()
      setWorkspace(ws)
      if (ws) {
        const [{ data: inv }, { data: pay }, { data: cust }] = await Promise.all([
          supabase.from('invoices').select('*').eq('workspace_id', ws.id),
          supabase.from('payments').select('*').eq('workspace_id', ws.id).order('created_at', { ascending: false }),
          supabase.from('customers').select('*').eq('workspace_id', ws.id),
        ])
        setInvoices(inv || [])
        setPayments(pay || [])
        setCustomers(cust || [])
      }
    }
    load()
  }, [])

  const currency = workspace?.currency || 'NGN'
  const now = new Date()

  const filterByPeriod = (items: any[], dateField: string) => {
    return items.filter(item => {
      const d = new Date(item[dateField])
      if (period === 'this_month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (period === 'last_month') {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
      }
      if (period === 'this_year') return d.getFullYear() === now.getFullYear()
      return true
    })
  }

  const filteredPayments = filterByPeriod(payments, 'created_at')
  const filteredInvoices = filterByPeriod(invoices, 'created_at')
  const totalRevenue = filteredPayments.reduce((s, p) => s + Number(p.amount), 0)
  const totalInvoiced = filteredInvoices.reduce((s, i) => s + Number(i.total_amount), 0)
  const paidInvoices = filteredInvoices.filter(i => i.status === 'PAID')
  const unpaidInvoices = filteredInvoices.filter(i => ['UNPAID','OVERDUE'].includes(i.status))

  // Top services
  const serviceMap: Record<string, number> = {}
  invoices.filter(i => i.status === 'PAID').forEach(inv => {
    if (Array.isArray(inv.items)) {
      inv.items.forEach((item: any) => {
        if (item.description) serviceMap[item.description] = (serviceMap[item.description] || 0) + Number(item.amount)
      })
    }
  })
  const topServices = Object.entries(serviceMap).sort((a,b) => b[1]-a[1]).slice(0,5)

  // Monthly chart data (last 6 months)
  const chartData = Array.from({length:6}).map((_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5-i), 1)
    const monthPayments = payments.filter(p => {
      const pd = new Date(p.created_at)
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
    })
    return {
      label: d.toLocaleDateString('en-NG', {month:'short'}),
      amount: monthPayments.reduce((s,p) => s + Number(p.amount), 0),
    }
  })
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1)

  const periodLabel = period === 'this_month' ? 'This Month' : period === 'last_month' ? 'Last Month' : period === 'this_year' ? 'This Year' : 'All Time'

  const exportUrl = (type: string, format: string) =>
    `/api/reports?workspace=${workspace?.id || ''}&type=${type}&format=${format}`

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10}}>
        <h1 style={{fontSize:22, fontWeight:700, color:'var(--text)'}}>Reports</h1>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            style={{height:36, padding:'0 12px', borderRadius:8, border:'1px solid var(--border-light)', fontSize:13, color:'var(--text)', outline:'none', background:'var(--card)'}}>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
          </select>
          {workspace && <>
            <a href={exportUrl('full','pdf')} target="_blank" rel="noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#7C3AED',color:'white',borderRadius:9,fontSize:12,fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>
              📄 Full Report PDF
            </a>
            <a href={exportUrl('invoices','csv')} target="_blank" rel="noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--bg-secondary)',border:'1px solid var(--border-light)',color:'var(--text-muted)',borderRadius:9,fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>
              📊 Invoice CSV
            </a>
            <a href={exportUrl('payments','csv')} target="_blank" rel="noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--bg-secondary)',border:'1px solid var(--border-light)',color:'var(--text-muted)',borderRadius:9,fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>
              💳 Payment CSV
            </a>
          </>}
        </div>
      </div>

      {/* Summary stats */}
      <div className="stat-grid" style={{marginBottom:16}}>
        {[
          {label:'Total Revenue', value:formatCurrency(totalRevenue, currency), color:'var(--success)'},
          {label:'Total Invoiced', value:formatCurrency(totalInvoiced, currency), color:'var(--text)'},
          {label:'Paid Invoices', value:String(paidInvoices.length), color:'var(--success)'},
          {label:'Unpaid / Overdue', value:String(unpaidInvoices.length), color:'var(--danger)'},
        ].map(s => (
          <div key={s.label} style={{background:'var(--card)', borderRadius:14, padding:'16px 18px', border:'1px solid var(--border)'}}>
            <p style={{fontSize:11, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.3}}>{s.label}</p>
            <p style={{fontSize:22, fontWeight:800, color:s.color}}>{s.value}</p>
            <p style={{fontSize:11, color:'var(--text-muted)'}}>{periodLabel}</p>
          </div>
        ))}
      </div>

      <div className="two-col-grid">
        {/* Revenue chart */}
        <div style={{background:'var(--card)', borderRadius:14, padding:'20px', border:'1px solid var(--border)'}}>
          <p style={{fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:4}}>Revenue Overview</p>
          <p style={{fontSize:11, color:'var(--text-muted)', marginBottom:20}}>Last 6 months</p>
          <div style={{display:'flex', alignItems:'flex-end', gap:8, height:120}}>
            {chartData.map((d, i) => (
              <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                <div style={{width:'100%', background: i===5 ? 'var(--accent)' : 'var(--accent-light)', borderRadius:'4px 4px 0 0', height:`${Math.max((d.amount/maxAmount)*100, 4)}%`, minHeight:4, transition:'height 0.3s'}}/>
                <span style={{fontSize:9, color:'var(--text-muted)', fontWeight:500}}>{d.label}</span>
              </div>
            ))}
          </div>
          {totalRevenue === 0 && <p style={{fontSize:12, color:'var(--text-muted)', textAlign:'center', marginTop:12}}>No payment data yet</p>}
        </div>

        {/* Top services */}
        <div style={{background:'var(--card)', borderRadius:14, padding:'20px', border:'1px solid var(--border)'}}>
          <p style={{fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:14}}>Top Services</p>
          {topServices.length === 0 ? (
            <p style={{fontSize:13, color:'var(--text-muted)', textAlign:'center', padding:'24px 0'}}>No paid invoices yet</p>
          ) : topServices.map(([name, amount], i) => (
            <div key={name} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:13, fontWeight:700, color:'var(--accent)', width:20}}>{i+1}.</span>
                <p style={{fontSize:13, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160}}>{name}</p>
              </div>
              <p style={{fontSize:13, fontWeight:600, color:'var(--text)', flexShrink:0}}>{formatCurrency(amount, currency)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Report */}
      <div style={{background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', marginTop:16, overflow:'hidden'}}>
        <button onClick={() => setShowFull(!showFull)}
          style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'none', border:'none', cursor:'pointer'}}>
          <p style={{fontSize:14, fontWeight:600, color:'var(--text)'}}>Full Report — All Invoices</p>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
            style={{transform: showFull ? 'rotate(180deg)' : 'none', transition:'transform 0.2s'}}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showFull && (
          <div style={{borderTop:'1px solid var(--border)'}}>
            {/* Table header */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 120px 100px 80px', gap:12, padding:'10px 20px', background:'var(--bg-secondary)', fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>
              <span>Invoice</span><span>Amount</span><span>Date</span><span>Status</span>
            </div>
            {invoices.length === 0 ? (
              <p style={{fontSize:13, color:'var(--text-muted)', textAlign:'center', padding:'24px'}}>No invoices yet</p>
            ) : invoices.map((inv: any) => {
              const statusColor: Record<string,[string,string]> = { PAID:['#22C55E','#F0FDF4'], UNPAID:['#F59E0B','#FFFBEB'], OVERDUE:['#EF4444','#FEF2F2'], DRAFT:['#6B7280','#F9FAFB'] }
              const [sc, sb] = statusColor[inv.status] || ['#6B7280','#F9FAFB']
              return (
                <div key={inv.id} style={{display:'grid', gridTemplateColumns:'1fr 120px 100px 80px', gap:12, padding:'12px 20px', borderTop:'1px solid var(--border)', alignItems:'center'}}>
                  <div>
                    <p style={{fontSize:13, fontWeight:500, color:'var(--text)'}}>{inv.invoice_number}</p>
                  </div>
                  <p style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>{formatCurrency(Number(inv.total_amount), currency)}</p>
                  <p style={{fontSize:12, color:'var(--text-muted)'}}>{new Date(inv.issue_date).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</p>
                  <span style={{fontSize:11, fontWeight:600, color:sc, background:sb, padding:'3px 8px', borderRadius:20, display:'inline-block'}}>{inv.status.charAt(0)+inv.status.slice(1).toLowerCase()}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
