'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const RULE_DEFINITIONS = [
  { type: 'INVOICE_REMINDER',    trigger_days: 2,  label: 'Invoice Due — 2 Day Reminder',  desc: 'Email customer 2 days before invoice due date' },
  { type: 'INVOICE_REMINDER',    trigger_days: 7,  label: 'Invoice Due — 7 Day Reminder',  desc: 'Email customer 7 days before invoice due date' },
  { type: 'APPOINTMENT_REMINDER',trigger_days: 1,  label: 'Appointment — 1 Day Reminder',  desc: 'Email customer 1 day before their appointment' },
  { type: 'FOLLOW_UP_REMINDER',  trigger_days: 30, label: 'Follow-Up — 30 Day Inactive',   desc: 'Remind business owner about customers with no activity in 30 days' },
]

const TYPE_COLOR: Record<string, string> = {
  INVOICE_REMINDER: '#7C3AED',
  APPOINTMENT_REMINDER: '#3B82F6',
  FOLLOW_UP_REMINDER: '#F59E0B',
}

const inp: React.CSSProperties = { width:'100%', height:44, padding:'0 12px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:14, color:'#111827', outline:'none', boxSizing:'border-box', background:'white' }
const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 }

export default function RemindersPage() {
  const [rules, setRules] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [wsId, setWsId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadError('Please sign in to access reminders.'); setLoading(false); return }
      const { data: ws, error: wsErr } = await supabase.from('workspaces').select('id').eq('created_by', user.id).maybeSingle()
      if (wsErr || !ws) { setLoadError('Could not load your workspace. Please refresh the page.'); setLoading(false); return }
      setWsId(ws.id)

      // Load rules
      const { data: existingRules } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('workspace_id', ws.id)
        .order('type')

      // Ensure all default rules exist — create any missing ones
      const created: any[] = []
      for (const def of RULE_DEFINITIONS) {
        const match = (existingRules || []).find(r => r.type === def.type && r.trigger_days === def.trigger_days)
        if (!match) {
          const { data: newRule } = await supabase.from('automation_rules').insert({
            workspace_id: ws.id,
            type: def.type,
            trigger_days: def.trigger_days,
            channel: 'EMAIL',
            active: true,
          }).select().single()
          if (newRule) created.push(newRule)
        }
      }

      const allRules = [...(existingRules || []), ...created]
      setRules(allRules)

      // Load recent reminder logs
      const { data: recentLogs } = await supabase
        .from('reminder_logs')
        .select('*')
        .eq('workspace_id', ws.id)
        .order('sent_at', { ascending: false })
        .limit(20)
      setLogs(recentLogs || [])
      setLoading(false)
      } catch(e: any) {
        setLoadError(e.message || 'Could not load reminders. Please refresh.')
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggle = async (rule: any) => {
    setToggling(rule.id)
    const newActive = !rule.active
    const { error } = await supabase
      .from('automation_rules')
      .update({ active: newActive, updated_at: new Date().toISOString() })
      .eq('id', rule.id)

    if (!error) {
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: newActive } : r))
    }
    setToggling(null)
  }

  const runRemindersNow = async () => {
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/run-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      setSendResult(data)
    } catch {
      setSendResult({ error: 'Could not reach reminder engine' })
    } finally {
      setSending(false)
      // Reload logs
      if (wsId) {
        const { data } = await supabase.from('reminder_logs').select('*').eq('workspace_id', wsId).order('sent_at', { ascending: false }).limit(20)
        setLogs(data || [])
      }
    }
  }

  const activeCount = rules.filter(r => r.active).length
  const sentToday = logs.filter(l => new Date(l.sent_at).toDateString() === new Date().toDateString() && l.status === 'SENT').length

  if (loadError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Could not load reminders</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{loadError}</p>
      <button onClick={() => window.location.reload()} style={{ padding: '9px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Refresh Page</button>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      <div style={{ width: 24, height: 24, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Reminders & Automation</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rules run daily automatically. Toggle on or off at any time.</p>
        </div>
        <button onClick={runRemindersNow} disabled={sending}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'white', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}>
          {sending ? <><span style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Running...</> : '▶ Run Now'}
        </button>
      </div>

      {/* Run result */}
      {sendResult && (
        <div style={{ background: sendResult.error ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${sendResult.error ? '#FEE2E2' : '#BBF7D0'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: sendResult.error ? '#DC2626' : '#15803D' }}>
          {sendResult.error ? `Error: ${sendResult.error}` : `✓ Sent — Invoices: ${sendResult.results?.invoices?.sent ?? 0} sent, ${sendResult.results?.invoices?.failed ?? 0} failed · Appointments: ${sendResult.results?.appointments?.sent ?? 0} sent, ${sendResult.results?.appointments?.failed ?? 0} failed`}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active Rules', value: activeCount, color: '#22C55E' },
          { label: 'Total Rules', value: rules.length, color: 'var(--accent)' },
          { label: 'Sent Today', value: sentToday, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Automation rules */}
      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Automation Rules</p>
        </div>
        {rules.map((rule, i) => {
          const def = RULE_DEFINITIONS.find(d => d.type === rule.type && d.trigger_days === rule.trigger_days)
          const label = def?.label || `${rule.type} — ${rule.trigger_days}d`
          const desc = def?.desc || rule.type
          const color = TYPE_COLOR[rule.type] || '#6B7280'
          return (
            <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
                  {rule.active && <span style={{ fontSize: 9, fontWeight: 700, color: '#22C55E', background: '#F0FDF4', padding: '2px 6px', borderRadius: 10 }}>ACTIVE</span>}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 16 }}>{desc}</p>
              </div>
              <button onClick={() => toggle(rule)} disabled={toggling === rule.id}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: toggling === rule.id ? 'not-allowed' : 'pointer', background: rule.active ? 'var(--accent)' : '#E5E7EB', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: 2, left: rule.active ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Reminder log */}
      <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recent Reminder Activity</p>
        </div>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No reminders sent yet</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reminders run automatically each day. Click Run Now to test.</p>
          </div>
        ) : logs.map((log, i) => (
          <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                {log.invoice_id ? 'Invoice Reminder' : log.appointment_id ? 'Appointment Reminder' : 'Reminder'} → {log.recipient_email || 'Unknown'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {new Date(log.sent_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                {log.error_message && <span style={{ color: '#EF4444' }}> · {log.error_message}</span>}
              </p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: log.status === 'SENT' ? '#22C55E' : '#EF4444', background: log.status === 'SENT' ? '#F0FDF4' : '#FEF2F2', padding: '3px 8px', borderRadius: 20 }}>
              {log.status}
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
