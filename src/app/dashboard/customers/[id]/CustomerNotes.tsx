'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function CustomerNotes({ customerId, initialNotes }: { customerId: string; initialNotes: any[] }) {
  const [notes, setNotes] = useState(initialNotes)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addNote = async () => {
    if (!text.trim()) return
    setSaving(true)
    setError('')
    const { data, error: err } = await supabase
      .from('customer_notes')
      .insert({ customer_id: customerId, note: text.trim() })
      .select()
      .single()
    if (err) {
      setError('Could not save note. Please try again.')
    } else {
      setNotes(prev => [data, ...prev])
      setText('')
    }
    setSaving(false)
  }

  const deleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return
    await supabase.from('customer_notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  return (
    <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', padding: '20px 24px' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Notes</p>

      {/* Add note */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note about this customer..."
          style={{ width: '100%', minHeight: 72, padding: '10px 12px', borderRadius: 9, border: '1px solid var(--border-light)', fontSize: 13, color: 'var(--text)', background: 'var(--bg-secondary)', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</p>}
        <button
          onClick={addNote}
          disabled={saving || !text.trim()}
          style={{ marginTop: 8, padding: '8px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving || !text.trim() ? 'not-allowed' : 'pointer', opacity: !text.trim() ? 0.5 : 1 }}>
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No notes yet.</p>
      ) : notes.map(note => (
        <div key={note.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 4 }}>{note.note}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {new Date(note.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button onClick={() => deleteNote(note.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
            title="Delete note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4h8v2"/></svg>
          </button>
        </div>
      ))}
    </div>
  )
}
