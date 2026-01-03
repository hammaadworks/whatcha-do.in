'use server'

import { createServerSideClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

/**
 * Generates a Magic Link for the current authenticated user.
 * This is used when the logged-in device displays a QR code for a new device to scan.
 */
export async function generateMagicLinkForQR() {
  const supabase = await createServerSideClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    throw new Error('User not authenticated or email missing')
  }

  const adminAuth = createAdminClient().auth.admin
  
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const origin = `${protocol}://${host}`

  // Create a link that redirects to the home page (or a specific callback)
  // The user will scan this on their mobile device (which opens a browser)
  const { data, error } = await adminAuth.generateLink({
    type: 'magiclink',
    email: user.email,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // data.properties.action_link contains the magic link
  return data.properties?.action_link
}

/**
 * Authorizes a remote session (e.g., PC waiting for login).
 * This is used when the logged-in device scans a QR code from a new device.
 */
export async function authorizeRemoteSession(sessionId: string) {
  const supabase = await createServerSideClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    throw new Error('User not authenticated')
  }

  const admin = createAdminClient()
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const origin = `${protocol}://${host}`

  // 1. Generate the magic link
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.properties?.action_link) {
    throw new Error(error?.message || 'Failed to generate link')
  }

  // 2. Broadcast the link to the waiting device via Realtime
  // We use the 'system' channel or a specific topic
  const channel = admin.channel(`session:${sessionId}`)
  
  await channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      channel.send({
        type: 'broadcast',
        event: 'authorized',
        payload: { link: data.properties.action_link },
      })
      // Clean up after sending
      setTimeout(() => admin.removeChannel(channel), 1000)
    }
  })

  return { success: true }
}
