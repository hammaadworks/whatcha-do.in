'use client'

import { useEffect, useState, useTransition } from 'react'
import { generateMagicLinkForQR } from '@/packages/auth/actions/auth-qr'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function DeviceConnect() {
  const [link, setLink] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const generate = () => {
    startTransition(async () => {
      try {
        const url = await generateMagicLinkForQR()
        if (url) {
            setLink(url)
        }
      } catch (error) {
        toast.error('Failed to generate connection code')
        console.error(error)
      }
    })
  }

  // Generate on mount
  useEffect(() => {
    generate()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-card border rounded-lg shadow-sm">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Connect a new device</h3>
        <p className="text-sm text-muted-foreground">
          Scan this code with your mobile camera (or any QR scanner) to log in instantly.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg relative">
        {isPending ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : link ? (
          <div className="relative group">
             <QRCodeSVG
                value={link}
                size={200}
                level="L" // Lower error correction for denser URLs
                includeMargin={true}
              />
          </div>
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center text-red-500 text-sm">
            Error generating code
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={generate} 
        disabled={isPending}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
        Refresh Code
      </Button>

      <div className="text-xs text-muted-foreground text-center max-w-xs">
        <p>This code expires quickly. Do not share it.</p>
      </div>
    </div>
  )
}
