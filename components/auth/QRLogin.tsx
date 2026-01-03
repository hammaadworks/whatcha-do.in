'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createBrowserClient } from '@supabase/ssr'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function QRLogin() {
  const [sessionId, setSessionId] = useState<string>('')
  const [status, setStatus] = useState<'generating' | 'waiting' | 'authorized'>('generating')
  const router = useRouter()

  useEffect(() => {
    // Generate a unique session ID
    const sid = uuidv4()
    setSessionId(sid)
    setStatus('waiting')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Subscribe to the session channel
    const channel = supabase.channel(`session:${sid}`)

    channel
      .on('broadcast', { event: 'authorized' }, (payload) => {
        if (payload.payload?.link) {
          setStatus('authorized')
          toast.success('Login authorized! Redirecting...')
          window.location.href = payload.payload.link
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-card border rounded-lg shadow-sm">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Login with another device</h3>
        <p className="text-sm text-muted-foreground">
          Scan this code with a logged-in device to log in here.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        {status === 'generating' ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <QRCodeSVG
            value={`wd-auth:${sessionId}`}
            size={200}
            level="H"
            includeMargin={true}
          />
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {status === 'waiting' ? (
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Waiting for scan...
          </div>
        ) : (
          <span className="text-green-600 font-medium">Redirecting...</span>
        )}
      </div>
    </div>
  )
}
