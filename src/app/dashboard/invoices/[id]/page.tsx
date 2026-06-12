import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: workspace } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).single()
  const { data: invoice } = await supabase.from('invoices').select('*, customers(name,phone,email)').eq('id', id).single()

  if (!invoice) notFound()

  const currency = workspace?.currency || 'NGN'
  const statusColor: Record<string,[string,string]> = {
    PAID:['#22C55E','#F0FDF4'],UNPAID:['#F59E0B','#FFFBEB'],OVERDUE:['#EF4444','#FEF2F2'],DRAFT:['#6B7280','#F9FAFB'],
  }
  const [sc, sb] = statusColor[invoice.status] || ['#6B7280','#F9FAFB']

  return (
    <div style={{maxWidth:520,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <Link href="/dashboard/invoices" style={{color:'#6B7280',textDecoration:'none',display:'flex',alignItems:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <h1 style={{fontSize:20,fontWeight:700,color:'#111827'}}>Invoice Details</h1>
      </div>

      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',padding:'24px'}}>
        {/* Status */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <span style={{fontSize:12,fontWeight:700,color:sc,background:sb,padding:'4px 12px',borderRadius:20}}>{invoice.status}</span>
          <button style={{background:'none',border:'none',cursor:'pointer',color:'#9CA3AF'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>

        {/* Invoice number */}
        <p style={{fontSize:28,fontWeight:800,color:'#111827',marginBottom:4}}>{invoice.invoice_number}</p>
        <p style={{fontSize:14,color:'#374151',fontWeight:500,marginBottom:2}}>{invoice.customers?.name}</p>
        <p style={{fontSize:13,color:'#9CA3AF',marginBottom:20}}>{invoice.customers?.phone || invoice.customers?.email || ''}</p>

        <div style={{borderTop:'1px solid #F3F4F6',paddingTop:20,marginBottom:20}}>
          <p style={{fontSize:28,fontWeight:800,color:'#111827',marginBottom:16}}>{formatCurrency(Number(invoice.total_amount), currency)}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <p style={{fontSize:11,color:'#9CA3AF',marginBottom:2}}>Issue Date</p>
              <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{new Date(invoice.issue_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
            </div>
            <div>
              <p style={{fontSize:11,color:'#9CA3AF',marginBottom:2}}>Due Date</p>
              <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{new Date(invoice.due_date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</p>
            </div>
          </div>
          {invoice.items && Array.isArray(invoice.items) && invoice.items.map((item: any, i: number) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #F9FAFB'}}>
              <p style={{fontSize:13,color:'#374151'}}>{item.description}</p>
              <p style={{fontSize:13,fontWeight:600,color:'#111827'}}>{formatCurrency(Number(item.amount), currency)}</p>
            </div>
          ))}
          {invoice.notes && <p style={{fontSize:13,color:'#6B7280',marginTop:12,fontStyle:'italic'}}>{invoice.notes}</p>}
        </div>

        <div style={{marginBottom:20}}>
          <p style={{fontSize:11,color:'#9CA3AF',marginBottom:4}}>Payment Method</p>
          <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{invoice.payment_method || 'Paystack'}</p>
        </div>

        {invoice.paid_at && (
          <div style={{marginBottom:20}}>
            <p style={{fontSize:11,color:'#9CA3AF',marginBottom:4}}>Paid on</p>
            <p style={{fontSize:13,fontWeight:500,color:'#111827'}}>{new Date(invoice.paid_at).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
          </div>
        )}

        <button style={{width:'100%',height:48,background:'#7C3AED',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:600,cursor:'pointer',marginBottom:12}}>
          Send Receipt
        </button>
        <div style={{display:'flex',gap:8}}>
          <button style={{flex:1,height:40,background:'white',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,fontWeight:500,color:'#374151',cursor:'pointer'}}>Share Invoice</button>
          <button style={{flex:1,height:40,background:'white',border:'1px solid #E5E7EB',borderRadius:10,fontSize:13,fontWeight:500,color:'#374151',cursor:'pointer'}}>Download PDF</button>
        </div>
      </div>
    </div>
  )
}
