import { getAdminSupabase } from '@/lib/admin-auth'

export default async function AdminLogsPage() {
  const db = getAdminSupabase()
  const [logs, adminLogs] = await Promise.all([
    db.from('activity_logs').select('*').order('created_at',{ascending:false}).limit(200).then(r => r.data||[]).catch(() => []),
    db.from('admin_logs').select('*').order('created_at',{ascending:false}).limit(50).then(r => r.data||[]).catch(() => []),
  ])
  const fmt = (d:string) => { try { return new Date(d).toLocaleString('en-NG',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) } catch { return '—' } }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--admin-text)', marginBottom:4 }}>Activity Logs</h1>
        <p style={{ fontSize:13, color:'var(--admin-text-muted)' }}>Platform and admin action history</p>
      </div>
      <div className="admin-two-col">
        <div>
          <h2 style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:12 }}>Platform Activity <span style={{ fontWeight:400, color:'var(--admin-text-muted)' }}>({logs.length})</span></h2>
          <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', overflow:'hidden', maxHeight:600, overflowY:'auto' }}>
            {logs.length === 0 ? (
              <div style={{ padding:'32px 20px', textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>No activity yet</div>
            ) : logs.map((l:any, i:number) => (
              <div key={l.id||i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--admin-card-border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--admin-text)' }}>{(l.action||'').replace(/_/g,' ')}</p>
                  <p style={{ fontSize:11, color:'var(--admin-text-muted)', flexShrink:0, marginLeft:8 }}>{fmt(l.created_at)}</p>
                </div>
                {l.entity_type && <p style={{ fontSize:12, color:'var(--admin-text-muted)' }}>{l.entity_type}</p>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontSize:14, fontWeight:700, color:'var(--admin-text)', marginBottom:12 }}>Admin Actions <span style={{ fontWeight:400, color:'var(--admin-text-muted)' }}>({adminLogs.length})</span></h2>
          <div style={{ background:'var(--admin-card)', borderRadius:12, border:'1px solid var(--admin-card-border)', overflow:'hidden', maxHeight:600, overflowY:'auto' }}>
            {adminLogs.length === 0 ? (
              <div style={{ padding:'32px 20px', textAlign:'center', color:'var(--admin-text-muted)', fontSize:13 }}>No admin actions yet</div>
            ) : adminLogs.map((l:any) => (
              <div key={l.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--admin-card-border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#7C3AED' }}>{(l.action||'').replace(/_/g,' ')}</p>
                  <p style={{ fontSize:11, color:'var(--admin-text-muted)', flexShrink:0, marginLeft:8 }}>{fmt(l.created_at)}</p>
                </div>
                <p style={{ fontSize:12, color:'var(--admin-text-muted)' }}>{l.admin_email} · {l.target_type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
