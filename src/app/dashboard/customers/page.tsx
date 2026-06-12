import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: workspace } = await supabase.from('workspaces').select('id,currency').eq('created_by', user?.id).single()
  const { data: customers } = await supabase.from('customers').select('*').eq('workspace_id', workspace?.id || '').order('created_at', { ascending: false })

  const currency = workspace?.currency || 'NGN'

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'#111827'}}>Customers</h1>
        <button style={{display:'flex',alignItems:'center',gap:6,background:'#7C3AED',color:'white',padding:'10px 18px',borderRadius:10,fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add Customer
        </button>
      </div>

      <div style={{background:'white',borderRadius:14,border:'1px solid #F3F4F6',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #F3F4F6'}}>
          <div style={{position:'relative'}}>
            <svg style={{position:'absolute',left:10,top:10}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search customers..." style={{width:'100%',height:36,paddingLeft:34,paddingRight:12,borderRadius:8,border:'1px solid #E5E7EB',fontSize:13,outline:'none',boxSizing:'border-box'}} />
          </div>
        </div>

        {!customers || customers.length === 0 ? (
          <div style={{padding:'48px 20px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>👥</div>
            <p style={{fontSize:15,fontWeight:600,color:'#111827',marginBottom:4}}>No customers yet</p>
            <p style={{fontSize:13,color:'#6B7280'}}>Add your first customer to get started</p>
          </div>
        ) : customers.map((c: any) => (
          <Link key={c.id} href={`/dashboard/customers/${c.id}`}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderTop:'1px solid #F9FAFB',textDecoration:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#7C3AED',flexShrink:0}}>
                {c.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{fontSize:14,fontWeight:500,color:'#111827'}}>{c.name}</p>
                <p style={{fontSize:12,color:'#9CA3AF'}}>{c.phone || c.email || ''}</p>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{textAlign:'right'}}>
                <p style={{fontSize:11,color:'#9CA3AF'}}>Total Spent</p>
                <p style={{fontSize:13,fontWeight:600,color:'#111827'}}>{formatCurrency(Number(c.total_spent), currency)}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
