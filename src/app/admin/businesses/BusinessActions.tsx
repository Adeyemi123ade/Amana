'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BusinessActions({ id, suspended, name }: { id:string, suspended:boolean, name:string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    if (!confirm(suspended ? `Reactivate ${name}?` : `Suspend ${name}? They will lose access.`)) return
    setLoading(true)
    await fetch('/api/admin/businesses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, action: suspended?'reactivate':'suspend' }) })
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading}
      style={{ fontSize:11, fontWeight:600, padding:'5px 10px', borderRadius:7, border:'1px solid', cursor:'pointer', background:'none',
        color: suspended?'#16A34A':'#DC2626', borderColor: suspended?'#BBF7D0':'#FECACA' }}>
      {loading ? '...' : suspended ? 'Reactivate' : 'Suspend'}
    </button>
  )
}
