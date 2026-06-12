import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: workspace } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).single()
  const { data: payments } = await supabase.from('payments').select('amount,created_at').eq('workspace_id', workspace?.id || '')
  const { data: invoices } = await supabase.from('invoices').select('total_amount,items,status').eq('workspace_id', workspace?.id || '')
  const currency = workspace?.currency || 'NGN'

  const totalRevenue = (payments||[]).reduce((s,p) => s + Number(p.amount), 0)
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthRevenue = (payments||[]).filter(p => {
    const d = new Date(p.created_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).reduce((s,p) => s + Number(p.amount), 0)

  // Top services from invoice items
  const serviceMap: Record<string,number> = {}
  ;(invoices||[]).filter(i => i.status === 'PAID').forEach(inv => {
    if (Array.isArray(inv.items)) {
      inv.items.forEach((item: any) => {
        if (item.description) {
          serviceMap[item.description] = (serviceMap[item.description] || 0) + Number(item.amount)
        }
      })
    }
  })
  const topServices = Object.entries(serviceMap).sort((a,b) => b[1]-a[1]).slice(0,3)

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#111827'}}>Reports</h1>
        <select style={{height:36,padding:'0 12px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:13,color:'#374151',outline:'none',background:'white'}}>
          <option>This Month (May)</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      {/* Revenue overview */}
      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',padding:'24px',marginBottom:16}}>
        <p style={{fontSize:13,color:'#6B7280',marginBottom:4}}>Revenue Overview</p>
        <p style={{fontSize:32,fontWeight:800,color:'#111827',marginBottom:2}}>{formatCurrency(monthRevenue, currency)}</p>
        <p style={{fontSize:12,color:'#22C55E',marginBottom:24}}>+10.5% from last month</p>

        {/* Simple chart bars */}
        <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
          {[40,55,35,70,50,85,60,45,90,65,75,monthRevenue > 0 ? 100 : 30].map((h,i) => (
            <div key={i} style={{flex:1,height:`${h}%`,background: i===11?'#7C3AED':'#EDE9FE',borderRadius:'3px 3px 0 0',minWidth:0}}/>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
          {['May 1','May 7','May 14','May 21','May 28','May 31'].map(d => (
            <span key={d} style={{fontSize:10,color:'#9CA3AF'}}>{d}</span>
          ))}
        </div>
      </div>

      {/* Top Services */}
      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',padding:'24px',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <p style={{fontSize:14,fontWeight:600,color:'#111827'}}>Top Services</p>
        </div>
        {topServices.length === 0 ? (
          <p style={{fontSize:13,color:'#9CA3AF',textAlign:'center',padding:'16px 0'}}>No data yet</p>
        ) : topServices.map(([name, amount], i) => (
          <div key={name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #F9FAFB'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:12,fontWeight:600,color:'#9CA3AF',width:16}}>{i+1}.</span>
              <p style={{fontSize:14,color:'#111827'}}>{name}</p>
            </div>
            <p style={{fontSize:14,fontWeight:600,color:'#111827'}}>{formatCurrency(amount, currency)}</p>
          </div>
        ))}
        <button style={{background:'none',border:'none',cursor:'pointer',color:'#7C3AED',fontSize:13,fontWeight:500,padding:'8px 0',width:'100%',textAlign:'center'}}>
          View Full Report
        </button>
      </div>
    </div>
  )
}
