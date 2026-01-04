"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProUpgradeModal({ open, onOpenChange }: ProUpgradeModalProps) {
  const { resolvedTheme } = useTheme();

  const handleUpgrade = () => {
    // In a real app, this would redirect to Stripe or a payment provider.
    // For now, we'll just show a toast or lead them to the "Social Unlock" if that was the intent,
    // but the prompt implies a general "Pro" subscription.
    // We'll simulate a "Contact us" or "Waitlist" flow, or just a placeholder.
    toast.info("Pro subscriptions are currently invite-only. Check back soon!", {
        description: "Follow us on social media for updates."
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        <div className="relative p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <DialogHeader className="relative z-10 text-left">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-black" /> PRO
                </span>
            </div>
            <DialogTitle className="text-3xl font-bold text-white mb-2">Unlock Your Potential</DialogTitle>
            <DialogDescription className="text-gray-300 text-base">
              Supercharge your consistency with premium features designed for the obsessed.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-background">
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

          <DialogFooter className="flex-col gap-2 sm:gap-0">
            <Button size="lg" className="w-full text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all hover:scale-[1.02]" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground mt-2" onClick={() => onOpenChange(false)}>
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
        <div className="flex items-start gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <h4 className="font-semibold text-foreground text-sm">{title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
            </div>
        </div>
    )
}
