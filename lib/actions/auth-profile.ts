'use server'

import { createServerSideClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Deletes the currently authenticated user's account.
 * This is a destructive action and cannot be undone.
 */
export async function deleteAccount() {
  const supabase = await createServerSideClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const adminAuth = createAdminClient().auth.admin

  // Delete the user from Supabase Auth
  const { error } = await adminAuth.deleteUser(user.id)

  if (error) {
    throw new Error(error.message)
  }

  // Sign out properly to clear cookies
  await supabase.auth.signOut()
  
  revalidatePath('/')
  redirect('/')
}
