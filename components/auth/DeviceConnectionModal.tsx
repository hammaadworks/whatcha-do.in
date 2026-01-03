'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeviceConnect } from '@/components/auth/DeviceConnect'

interface DeviceConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeviceConnectionModal({ open, onOpenChange }: DeviceConnectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Another Device</DialogTitle>
          <DialogDescription>
            Scan this code with the new device to log it in instantly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
            <DeviceConnect />
        </div>
      </DialogContent>
    </Dialog>
  )
}
