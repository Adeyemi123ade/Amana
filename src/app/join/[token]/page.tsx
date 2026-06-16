'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [invite, setInvite] = useState<any>(null)
  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: inv } = await supabase
        .from('team_invites')
        .select('*, workspaces(id, name)')
        .eq('token', token)
        .single()

      if (!inv) { setError('This invitation link is invalid or has already been used.'); setLoading(false); return }
      if (inv.status !== 'PENDING') { setError('This invitation has already been ' + inv.status.toLowerCase() + '.'); setLoading(false); return }
      if (new Date(inv.expires_at) < new Date()) { setError('This invitation has expired. Please ask for a new one.'); setLoading(false); return }

      setInvite(inv)
      setWorkspace(inv.workspaces)
      setLoading(false)
    }
    load()
  }, [token])

  const handleAccept = async () => {
    setJoining(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Not logged in — redirect to sign-in with return URL
      router.push(`/sign-in?next=/join/${token}`)
      return
    }

    // Check email matches
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      setError(`This invitation was sent to ${invite.email}. You are signed in as ${user.email}. Please sign in with the correct account.`)
      setJoining(false)
      return
    }

    // Add to workspace_members
    const { error: memberError } = await supabase.from('workspace_members').upsert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role,
    }, { onConflict: 'workspace_id,user_id' })

    if (memberError) {
      setError('Could not add you to the workspace. Please try again.')
      setJoining(false)
      return
    }

    // Mark invite as accepted
    await supabase.from('team_invites').update({ status: 'ACCEPTED' }).eq('id', invite.id)

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'white', borderRadius: 20, padding: '40px 32px', boxShadow: '0 2px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, background: '#7C3AED', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>Amana</span>
        </div>

        {done ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FDF4', border: '3px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>You have joined!</h2>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Taking you to the {workspace?.name} dashboard...</p>
          </>
        ) : error ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Invitation Issue</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
            <Link href="/dashboard" style={{ display: 'inline-block', background: '#7C3AED', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>Go to Dashboard</Link>
          </>
        ) : (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z"/></svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Team Invitation</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 6 }}>You have been invited to join</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 24 }}>{workspace?.name}</p>
            <button onClick={handleAccept} disabled={joining}
              style={{ width: '100%', height: 48, background: joining ? '#6D28D9cc' : '#7C3AED', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: joining ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {joining ? <><span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Joining...</> : 'Accept Invitation'}
            </button>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
              Sent to {invite?.email}
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
