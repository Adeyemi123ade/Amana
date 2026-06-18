'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const STATUS_COLOR: Record<string, [string,string]> = {
  PENDING:   ['#F59E0B','#FFFBEB'],
  CONFIRMED: ['#3B82F6','#EFF6FF'],
  COMPLETED: ['#22C55E','#F0FDF4'],
  CANCELLED: ['#EF4444','#FEF2F2'],
  NO_SHOW:   ['#6B7280','#F9FAFB'],
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const { data: ws, error: wsErr } = await supabase
        .from('workspaces').select('id').eq('created_by', user.id).maybeSingle()
      if (wsErr || !ws) { setError('Could not load workspace.'); setLoading(false); return }

      const { data: appts, error: apptErr } = await supabase
        .from('appointments')
        .select('*')
        .eq('workspace_id', ws.id)
        .order('start_time', { ascending: true })
      if (apptErr) throw new Error(apptErr.message)

      const custIds = [...new Set((appts || []).map(a => a.customer_id).filter(Boolean))]
      let custMap: Record<string, any> = {}
      if (custIds.length > 0) {
        const { data: custs } = await supabase
          .from('customers').select('id,name,email,phone').in('id', custIds)
        ;(custs || []).forEach(c => { custMap[c.id] = c })
      }

      setAppointments((appts || []).map(a => ({
        ...a, customer: custMap[a.customer_id] || null
      })))
    } catch (e: any) {
      setError(e.message || 'Could not load appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const now = new Date()
  const upcoming  = appointments.filter(a => new Date(a.start_time) >= now && a.status !== 'CANCELLED')
  const past      = appointments.filter(a => new Date(a.start_time) < now || a.status === 'CANCELLED')

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short',year:'numeric'})
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:300}}>
      <div style={{width:28,height:28,border:'3px solid var(--accent)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,textAlign:'center',padding:24}}>
      <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
      <p style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:6}}>Could not load appointments</p>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>{error}</p>
      <button onClick={load} style={{padding:'10px 24px',background:'var(--accent)',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}>
        Try Again
      </button>
    </div>
  )

  const Row = ({ a }: { a: any }) => {
    const [sc, sb] = STATUS_COLOR[a.status] || ['#6B7280','#F9FAFB']
    return (
      <div onClick={() => router.push(`/dashboard/appointments/${a.id}`)}
        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderTop:'1px solid var(--border)',cursor:'pointer',transition:'background .15s'}}
        onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-secondary)')}
        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
        <div style={{width:48,height:48,borderRadius:10,background:'var(--accent-light)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{fontSize:11,fontWeight:700,color:'var(--accent)',textTransform:'uppercase'}}>{new Date(a.start_time).toLocaleDateString('en-NG',{month:'short'})}</span>
          <span style={{fontSize:18,fontWeight:900,color:'var(--accent)',lineHeight:1}}>{new Date(a.start_time).getDate()}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:14,fontWeight:600,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</p>
          <p style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{a.customer?.name || 'No customer'} · {fmtTime(a.start_time)}</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
          <span style={{fontSize:10,fontWeight:700,color:sc,background:sb,padding:'3px 8px',borderRadius:20}}>{a.status}</span>
          <span style={{fontSize:11,color:'var(--text-muted)'}}>{a.location_type === 'PHYSICAL' ? '📍' : '💻'} {a.location_type === 'PHYSICAL' ? 'Physical' : 'Virtual'}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:'var(--text)',marginBottom:2}}>Appointments</h1>
          <p style={{fontSize:13,color:'var(--text-muted)'}}>{appointments.length} total · {upcoming.length} upcoming</p>
        </div>
        <button onClick={() => router.push('/dashboard/appointments/new')}
          style={{display:'flex',alignItems:'center',gap:6,background:'var(--accent)',color:'white',padding:'10px 18px',borderRadius:10,fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div style={{background:'var(--card)',borderRadius:16,border:'1px solid var(--border)',padding:'60px 24px',textAlign:'center'}}>
          <div style={{fontSize:52,marginBottom:16}}>📅</div>
          <p style={{fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:8}}>No appointments yet</p>
          <p style={{fontSize:14,color:'var(--text-muted)',marginBottom:24}}>Create your first appointment to get started</p>
          <button onClick={() => router.push('/dashboard/appointments/new')}
            style={{background:'var(--accent)',color:'white',padding:'12px 28px',borderRadius:10,fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>
            New Appointment
          </button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden',marginBottom:16}}>
              <div style={{padding:'12px 20px',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)'}}>
                <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5}}>Upcoming ({upcoming.length})</p>
              </div>
              {upcoming.map(a => <Row key={a.id} a={a}/>)}
            </div>
          )}
          {past.length > 0 && (
            <div style={{background:'var(--card)',borderRadius:14,border:'1px solid var(--border)',overflow:'hidden'}}>
              <div style={{padding:'12px 20px',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)'}}>
                <p style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5}}>Past & Cancelled ({past.length})</p>
              </div>
              {past.map(a => <Row key={a.id} a={a}/>)}
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
