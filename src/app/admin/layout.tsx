import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClientLayout from './AdminClientLayout'
import { isAdminEmail } from '@/lib/admin-auth'

export const metadata = { title: 'Amana Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/sign-in')
  return <AdminClientLayout email={user.email!}>{children}</AdminClientLayout>
}
