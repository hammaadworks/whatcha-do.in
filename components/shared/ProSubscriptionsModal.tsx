"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Star, Crown } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button"; // Assuming available or standard button with shimmer class

interface ProSubscriptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void> | void;
}

export function ProSubscriptionsModal({ open, onOpenChange, onSuccess }: ProSubscriptionsModalProps) {
  const { resolvedTheme } = useTheme();

  const handleUpgrade = async () => {
    toast.loading("Initiating upgrade...", { duration: 1000 });
    
    // Simulate delay for "processing"
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.dismiss();
    toast.info("Pro subscriptions are currently invite-only. You've been added to the priority waitlist!", {
        description: "We'll notify you as soon as spots open up."
    });
    
    // Simulate success/waitlist join
    if (onSuccess) {
        await onSuccess();
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl bg-card max-h-[90vh] flex flex-col gap-0">
        <div className="relative h-56 w-full overflow-hidden shrink-0 group">
             <Image 
                src="/favicons/light/logo-bg.png" 
                alt="Pro Background" 
                fill 
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
             
             <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse">
                        <Crown className="w-3.5 h-3.5 fill-black" /> PRO MEMBER
                    </span>
                </div>
                <DialogTitle className="text-4xl font-black text-foreground tracking-tight drop-shadow-sm mb-2">
                  Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">Game.</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[90%]">
                  Unlock the full power of consistency with exclusive tools designed for top performers.
                </DialogDescription>
             </div>
        </div>

        <div className="p-6 pt-2 bg-card flex-1 overflow-y-auto">
          <div className="space-y-4">
            <FeatureRow 
                icon={<Palette className="w-5 h-5 text-purple-500" />}
                title="Unlimited Themes" 
                description="Customize your workspace with our entire premium collection. Match your mood, every day." 
            />
            <FeatureRow 
                icon={<ImageUp className="w-5 h-5 text-blue-500" />}
                title="Rich Media Uploads" 
                description="Visualize your journey. Upload unlimited photos and videos to your Journal and Bio." 
            />
            <FeatureRow 
                icon={<Star className="w-5 h-5 text-yellow-500" />}
                title="Priority Support" 
                description="Get front-of-the-line access to our team. Your feedback shapes the future." 
            />
             <FeatureRow 
                icon={<Zap className="w-5 h-5 text-orange-500" />}
                title="Early Access" 
                description="Be the first to try new features before they are released to the public." 
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 p-6 pt-2 shrink-0 bg-card">
            <Button 
                size="lg" 
                className="w-full text-base font-bold h-12 bg-gradient-to-r from-yellow-400 to-orange-600 hover:from-yellow-500 hover:to-orange-700 text-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] border-0" 
                onClick={handleUpgrade}
            >
              <Sparkles className="w-4 h-4 mr-2 fill-black" />
              Upgrade to Pro
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs hover:bg-muted/50" onClick={() => onOpenChange(false)}>
              No thanks, I'll stay basic
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Palette, Image as ImageUp } from "lucide-react";

function FeatureRow({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors group">
            <div className="bg-accent p-2.5 rounded-lg shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-foreground text-sm tracking-tight mb-1">{title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
            </div>
        </div>
    )
}
