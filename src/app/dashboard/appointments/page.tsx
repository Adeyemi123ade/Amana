import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatTime } from '@/lib/utils'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: workspace } = await supabase.from('workspaces').select('id').eq('created_by', user?.id).single()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const { data: appointments } = await supabase
    .from('appointments').select('*, customers(name)')
    .eq('workspace_id', workspace?.id || '')
    .order('start_time', { ascending: true })

  const todayStr = now.toDateString()
  const todayAppts = (appointments || []).filter(a => new Date(a.start_time).toDateString() === todayStr)
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const apptDays = new Set((appointments || []).map(a => new Date(a.start_time).getDate()))

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
        <h1 style={{fontSize:22, fontWeight:700, color:'#111827'}}>Appointments</h1>
      </div>

      {/* Responsive: calendar + schedule side by side on desktop, stacked on mobile */}
      <div className="three-col-grid">
        {/* Calendar */}
        <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', padding:'20px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
            <button style={{background:'none', border:'none', cursor:'pointer', color:'#6B7280', padding:'4px 8px', borderRadius:6, fontSize:16}}>‹</button>
            <p style={{fontSize:14, fontWeight:600, color:'#111827'}}>{monthNames[month]} {year}</p>
            <button style={{background:'none', border:'none', cursor:'pointer', color:'#6B7280', padding:'4px 8px', borderRadius:6, fontSize:16}}>›</button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6}}>
            {dayNames.map(d => (
              <div key={d} style={{textAlign:'center', fontSize:10, fontWeight:700, color:'#9CA3AF', padding:'4px 0', textTransform:'uppercase'}}>{d}</div>
            ))}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2}}>
            {Array.from({length: firstDay}).map((_, i) => <div key={`e${i}`}/>)}
            {Array.from({length: daysInMonth}).map((_, i) => {
              const day = i + 1
              const isToday = day === now.getDate()
              const hasAppt = apptDays.has(day)
              return (
                <div key={day} style={{textAlign:'center', padding:'7px 0', borderRadius:8, fontSize:13, fontWeight: isToday ? 700 : 400, color: isToday ? 'white' : '#111827', background: isToday ? '#7C3AED' : 'transparent', position:'relative', cursor:'pointer'}}>
                  {day}
                  {hasAppt && !isToday && (
                    <span style={{position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'#7C3AED', display:'block'}}/>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's schedule */}
        <div style={{background:'white', borderRadius:14, border:'1px solid #F3F4F6', padding:'20px', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <p style={{fontSize:14, fontWeight:600, color:'#111827'}}>
              {now.toLocaleDateString('en-NG', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
            </p>
          </div>

          <div style={{flex:1}}>
            {todayAppts.length === 0 ? (
              <div style={{textAlign:'center', padding:'32px 0'}}>
                <div style={{fontSize:36, marginBottom:8}}>📅</div>
                <p style={{fontSize:14, color:'#9CA3AF'}}>No appointments today</p>
              </div>
            ) : todayAppts.map((a: any) => (
              <div key={a.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid #F9FAFB'}}>
                <span style={{fontSize:12, fontWeight:500, color:'#6B7280', minWidth:60, flexShrink:0}}>{formatTime(a.start_time)}</span>
                <div style={{flex:1, minWidth:0}}>
                  <p style={{fontSize:14, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.customers?.name}</p>
                  <p style={{fontSize:12, color:'#9CA3AF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.title}</p>
                </div>
                <span style={{fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, color:a.status==='CONFIRMED'?'#22C55E':'#F59E0B', background:a.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB', flexShrink:0}}>
                  {a.status === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          <button style={{width:'100%', height:44, background:'#7C3AED', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New Appointment
          </button>
        </div>
      </div>
    </div>
  )
}
