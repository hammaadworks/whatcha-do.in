import { createServerSideClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerSideClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/logins')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile?.username) {
    redirect(`/${profile.username}`)
  }

  // Fallback if no username found (shouldn't happen for valid users)
  redirect('/')
}
