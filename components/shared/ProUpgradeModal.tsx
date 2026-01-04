"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import Image from "next/image";

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void> | void;
}

export function ProUpgradeModal({ open, onOpenChange, onSuccess }: ProUpgradeModalProps) {
  const { resolvedTheme } = useTheme();

  const handleUpgrade = async () => {
    // In a real app, this would redirect to Stripe or a payment provider.
    // For now, we'll just show a toast or lead them to the "Social Unlock" if that was the intent,
    // but the prompt implies a general "Pro" subscription.
    // We'll simulate a "Contact us" or "Waitlist" flow, or just a placeholder.
    toast.info("Pro subscriptions are currently invite-only. Check back soon!", {
        description: "Follow us on social media for updates."
    });
    
    // Simulate success for now if needed, or just trigger the callback
    if (onSuccess) {
        await onSuccess();
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl bg-card">
        <div className="relative h-48 w-full overflow-hidden">
             <Image 
                src="/favicons/light/logo-bg.png" 
                alt="Pro Background" 
                fill 
                className="object-cover object-center opacity-90"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
             
             <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Zap className="w-3 h-3 fill-black" /> PRO
                    </span>
                </div>
                <DialogTitle className="text-3xl font-black text-white tracking-tight drop-shadow-md">Unlock Your Potential</DialogTitle>
                <DialogDescription className="text-white/80 text-sm font-medium mt-1 drop-shadow-sm">
                  Supercharge your consistency with premium features.
                </DialogDescription>
             </div>
        </div>

        <div className="p-6 pt-4 bg-card">
          <div className="space-y-4 mb-8">
            <FeatureRow 
                title="Unlimited Themes" 
                description="Access every visual theme to match your vibe." 
            />
            <FeatureRow 
                title="Rich Media Uploads" 
                description="Upload photos to your Journal and Bio. Visualize your journey." 
            />
            <FeatureRow 
                title="Priority Support" 
                description="Direct line to the team for feature requests." 
            />
          </div>

          <DialogFooter className="flex-col gap-3 sm:gap-0">
            <Button size="lg" className="w-full text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all hover:scale-[1.01]" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground mt-2 hover:bg-muted/50" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <div className="bg-primary/10 p-1.5 rounded-full shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
                <h4 className="font-semibold text-foreground text-sm tracking-tight">{title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{description}</p>
            </div>
        </div>
    )
}
