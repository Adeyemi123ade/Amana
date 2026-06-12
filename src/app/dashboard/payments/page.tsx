import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: workspace } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).single()
  const { data: payments } = await supabase.from('payments').select('*, invoices(invoice_number, customers(name))').eq('workspace_id', workspace?.id || '').order('created_at', { ascending: false })
  const currency = workspace?.currency || 'NGN'

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#111827'}}>Payment History</h1>
      </div>
      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #F3F4F6'}}>
          <div style={{position:'relative'}}>
            <svg style={{position:'absolute',left:10,top:10}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search payments..." style={{width:'100%',height:36,paddingLeft:34,paddingRight:12,borderRadius:8,border:'1px solid #E5E7EB',fontSize:13,outline:'none',boxSizing:'border-box'}} />
          </div>
        </div>
        {!payments || payments.length === 0 ? (
          <div style={{padding:'48px 20px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>💳</div>
            <p style={{fontSize:15,fontWeight:600,color:'#111827',marginBottom:4}}>No payments yet</p>
            <p style={{fontSize:13,color:'#6B7280'}}>Payments will appear here once received</p>
          </div>
        ) : payments.map((p: any) => (
          <div key={p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderTop:'1px solid #F9FAFB'}}>
            <div>
              <p style={{fontSize:14,fontWeight:500,color:'#111827'}}>{(p.invoices as any)?.customers?.name || p.customer_email || 'Customer'}</p>
              <p style={{fontSize:12,color:'#9CA3AF'}}>{new Date(p.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})} · {p.method}</p>
            </div>
            <div style={{textAlign:'right'}}>
              <p style={{fontSize:14,fontWeight:700,color:'#111827'}}>{formatCurrency(Number(p.amount), currency)}</p>
              <span style={{fontSize:11,fontWeight:600,color: p.status==='SUCCESS'?'#22C55E':p.status==='FAILED'?'#EF4444':'#F59E0B',background: p.status==='SUCCESS'?'#F0FDF4':p.status==='FAILED'?'#FEF2F2':'#FFFBEB',padding:'2px 8px',borderRadius:20}}>
                {p.status==='SUCCESS'?'Paid':p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
