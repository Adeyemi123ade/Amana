import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function createNotification(
  workspaceId: string,
  title: string,
  description: string,
  type: string = 'general',
  link?: string
) {
  await supabase.from('notifications').insert({
    workspace_id: workspaceId,
    title,
    description,
    type,
    link: link || null,
    read: false,
  })
}
