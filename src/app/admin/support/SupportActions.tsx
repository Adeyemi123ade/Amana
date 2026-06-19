'use client'
import { useRouter } from 'next/navigation'
export default function SupportActions({ id, status }: { id:string, status:string }) {
  const router = useRouter()
  const update = async (s: string) => {
    await fetch('/api/admin/support', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, status:s }) })
    router.refresh()
  }
  return (
    <div style={{ display:'flex', gap:8 }}>
      {status !== 'IN_PROGRESS' && <button onClick={()=>update('IN_PROGRESS')} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #FEF3C7', background:'#FFFBEB', color:'#D97706', cursor:'pointer', fontWeight:600 }}>In Progress</button>}
      {status !== 'RESOLVED' && <button onClick={()=>update('RESOLVED')} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #BBF7D0', background:'#F0FDF4', color:'#16A34A', cursor:'pointer', fontWeight:600 }}>Resolve</button>}
      {status !== 'CLOSED' && <button onClick={()=>update('CLOSED')} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid #E2E8F0', background:'#F8FAFC', color:'#64748B', cursor:'pointer', fontWeight:600 }}>Close</button>}
    </div>
  )
}
