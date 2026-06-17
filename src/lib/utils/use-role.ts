'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from './permissions'

const supabase = createClient()

// Cache role per workspace to avoid repeated DB calls
const roleCache = new Map<string, Role>()

export function useRole(workspaceId: string | null): { role: Role; loading: boolean } {
  const [role, setRole] = useState<Role>('NONE')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return }

    // Check cache first
    if (roleCache.has(workspaceId)) {
      setRole(roleCache.get(workspaceId)!)
      setLoading(false)
      return
    }

    const fetchRole = async () => {
      const { data } = await supabase.rpc('get_user_role', {
        p_workspace_id: workspaceId,
      })
      const r = (data as Role) || 'NONE'
      roleCache.set(workspaceId, r)
      setRole(r)
      setLoading(false)
    }

    fetchRole()
  }, [workspaceId])

  return { role, loading }
}
