import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: workspace } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).single()
  const { data: invoices } = await supabase.from('invoices').select('*, customers(name)').eq('workspace_id', workspace?.id || '').order('created_at', { ascending: false })

  const currency = workspace?.currency || 'NGN'

  const statusColor: Record<string, [string,string]> = {
    PAID: ['#22C55E','#F0FDF4'],
    UNPAID: ['#F59E0B','#FFFBEB'],
    OVERDUE: ['#EF4444','#FEF2F2'],
    DRAFT: ['#6B7280','#F9FAFB'],
    CANCELLED: ['#6B7280','#F9FAFB'],
  }

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#111827'}}>Invoices</h1>
        <Link href="/dashboard/invoices/create" style={{display:'flex',alignItems:'center',gap:6,background:'#7C3AED',color:'white',padding:'10px 18px',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Create New
        </Link>
      </div>

      {/* Search + filters */}
      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #F3F4F6',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200,position:'relative'}}>
            <svg style={{position:'absolute',left:10,top:10}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search invoices..." style={{width:'100%',height:36,paddingLeft:34,paddingRight:12,borderRadius:8,border:'1px solid #E5E7EB',fontSize:13,color:'#111827',outline:'none',boxSizing:'border-box'}} />
          </div>
          <div style={{display:'flex',gap:6}}>
            {['All','Paid','Unpaid','Overdue'].map(tab => (
              <button key={tab} style={{padding:'6px 14px',borderRadius:8,border:'1px solid #E5E7EB',background: tab==='All'?'#7C3AED':'white',color: tab==='All'?'white':'#6B7280',fontSize:13,fontWeight:500,cursor:'pointer'}}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice list */}
        {!invoices || invoices.length === 0 ? (
          <div style={{padding:'48px 20px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>📄</div>
            <p style={{fontSize:15,fontWeight:600,color:'#111827',marginBottom:4}}>No invoices yet</p>
            <p style={{fontSize:13,color:'#6B7280',marginBottom:16}}>Create your first invoice to get started</p>
            <Link href="/dashboard/invoices/create" style={{background:'#7C3AED',color:'white',padding:'10px 20px',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none'}}>
              Create Invoice
            </Link>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 140px 100px 80px',gap:12,padding:'10px 20px',background:'#F9FAFB',fontSize:11,fontWeight:600,color:'#6B7280',textTransform:'uppercase',letterSpacing:0.5}}>
              <span>Customer</span>
              <span>Amount</span>
              <span>Due Date</span>
              <span>Status</span>
            </div>
            {invoices.map((inv: any) => {
              const [color, bg] = statusColor[inv.status] || ['#6B7280','#F9FAFB']
              return (
                <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} style={{display:'grid',gridTemplateColumns:'1fr 140px 100px 80px',gap:12,padding:'14px 20px',borderTop:'1px solid #F9FAFB',textDecoration:'none',alignItems:'center'}}>
                  <div>
                    <p style={{fontSize:14,fontWeight:500,color:'#111827'}}>{inv.customers?.name || 'Unknown'}</p>
                    <p style={{fontSize:12,color:'#9CA3AF'}}>{inv.invoice_number} · {new Date(inv.issue_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
                  </div>
                  <p style={{fontSize:14,fontWeight:600,color:'#111827'}}>{formatCurrency(Number(inv.total_amount), currency)}</p>
                  <p style={{fontSize:13,color:'#6B7280'}}>{new Date(inv.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</p>
                  <span style={{fontSize:11,fontWeight:600,color,background:bg,padding:'3px 8px',borderRadius:20,display:'inline-block'}}>{inv.status.charAt(0)+inv.status.slice(1).toLowerCase()}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
