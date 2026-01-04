"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function DeviceScanner({ onClose }: Readonly<{ onClose?: () => void }>) {
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (text: string) => {
    if (!text || processing) return;

    // Check if it's a URL
    if (text.startsWith("http://") || text.startsWith("https://")) {
      setScanning(false);
      setProcessing(true);
      toast.success("Code detected! Redirecting...");
      window.location.href = text;
      return;
    }

    // Fallback or specific error
    toast.error("Invalid QR Code. Please scan a valid Login Link.");
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
        {processing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 z-10">
            <Loader2 className="h-10 w-10 animate-spin mb-2" />
            <p>Redirecting...</p>
          </div>
        ) : (
          <Scanner
            onScan={(result) => {
              if (result && result.length > 0) {
                handleScan(result[0].rawValue);
              }
            }}
            components={{
              onOff: true,
              torch: true
            }}
          />
        )}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Point your camera at a Login QR Code shown on a logged-in device.
      </p>
      {onClose && (
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      )}
    </div>
  );
}
