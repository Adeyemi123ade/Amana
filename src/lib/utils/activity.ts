import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function logActivity(
  workspaceId: string,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  await supabase.from('activity_logs').insert({
    workspace_id: workspaceId,
    user_id: userId,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    metadata: metadata || null,
  })
}
