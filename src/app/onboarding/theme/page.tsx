'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { THEMES, type ThemeId } from '@/lib/theme/themes'

export default function ThemeSelectionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<ThemeId>('light')
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({ data: { theme: selected } })
      localStorage.setItem('amana-theme', selected)
      router.push('/dashboard')
    } catch {
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Logo */}
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:32}}>
        <div style={{width:34, height:34, background:'#7C3AED', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="white"/></svg>
        </div>
        <span style={{fontWeight:800, fontSize:18, color:'#111827'}}>Amana</span>
      </div>

      <div style={{width:'100%', maxWidth:720}}>
        {/* Header */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <h1 style={{fontSize:26, fontWeight:800, color:'#111827', marginBottom:8}}>Choose your workspace theme</h1>
          <p style={{fontSize:15, color:'#6B7280', lineHeight:1.6}}>
            Pick the look that feels right for your business. You can change this anytime in Settings.
          </p>
        </div>

        {/* Theme cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}>
          {THEMES.map(theme => {
            const isSelected = selected === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => setSelected(theme.id)}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  border: isSelected ? `2px solid ${theme.preview.accent}` : '2px solid #E5E7EB',
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxShadow: isSelected ? `0 0 0 4px ${theme.preview.accent}22` : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* Theme preview */}
                <div style={{
                  background: theme.preview.bg,
                  height: 130,
                  padding: 10,
                  display: 'flex',
                  gap: 8,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Mini sidebar */}
                  <div style={{
                    width: 44,
                    background: theme.preview.sidebar,
                    borderRadius: 8,
                    padding: '8px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    flexShrink: 0,
                  }}>
                    <div style={{width: 20, height: 8, background: theme.preview.accent, borderRadius: 3, marginBottom: 4}}/>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        width: '100%',
                        height: 6,
                        borderRadius: 3,
                        background: i === 1 ? theme.preview.accent : 'rgba(255,255,255,0.15)',
                      }}/>
                    ))}
                  </div>

                  {/* Mini content */}
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
                    {/* Topbar */}
                    <div style={{
                      height: 20,
                      background: theme.preview.card,
                      borderRadius: 6,
                      border: `1px solid ${theme.preview.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 6,
                      gap: 4,
                    }}>
                      <div style={{width: 8, height: 8, borderRadius: '50%', background: theme.preview.accent}}/>
                      <div style={{width: 12, height: 6, borderRadius: 3, background: theme.preview.accent}}/>
                    </div>

                    {/* Stat cards */}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4}}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          background: theme.preview.card,
                          borderRadius: 5,
                          padding: '4px 6px',
                          border: `1px solid ${theme.preview.border}`,
                        }}>
                          <div style={{width: '60%', height: 3, borderRadius: 2, background: theme.preview.subtext, marginBottom: 3, opacity: 0.5}}/>
                          <div style={{width: '80%', height: 5, borderRadius: 2, background: i === 1 ? theme.preview.accent : theme.preview.text, opacity: 0.7}}/>
                        </div>
                      ))}
                    </div>

                    {/* Content row */}
                    <div style={{
                      flex: 1,
                      background: theme.preview.card,
                      borderRadius: 5,
                      border: `1px solid ${theme.preview.border}`,
                      padding: '4px 6px',
                    }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{display:'flex', gap:4, marginBottom:3, alignItems:'center'}}>
                          <div style={{width:8, height:8, borderRadius:'50%', background:theme.preview.accent, opacity:0.3, flexShrink:0}}/>
                          <div style={{flex:1, height:3, borderRadius:2, background:theme.preview.text, opacity:0.2}}/>
                          <div style={{width:12, height:4, borderRadius:2, background:theme.preview.accent, opacity:0.5}}/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Theme info */}
                <div style={{padding:'12px 14px 14px'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4}}>
                    <p style={{fontSize:14, fontWeight:700, color:'#111827'}}>{theme.name}</p>
                    {isSelected && (
                      <div style={{width:18, height:18, borderRadius:'50%', background:theme.preview.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>
                  <p style={{fontSize:12, color:'#6B7280', lineHeight:1.5}}>{theme.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={saving}
          style={{
            width: '100%',
            height: 50,
            background: '#7C3AED',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving && <span style={{width:16, height:16, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite'}}/>}
          Continue to Dashboard
        </button>

        <p style={{textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:12}}>
          You can change your theme anytime in Settings → Appearance
        </p>
      </div>
    </div>
  )
}
