"use client";

import React, { useRef, useState } from "react";
import { ArrowLeft, Check, ExternalLink, Instagram, Loader2, Lock, Palette, Twitter, Youtube } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrandTheme } from "@/components/theme/BrandThemeProvider";
import { cn } from "@/lib/utils";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";
import { ThemeOption, THEMES } from "@/lib/themes";
import { useAuth } from "@/packages/auth/hooks/useAuth";
import { toast } from "sonner";
import { purchaseTheme, verifySocialUnlock } from "@/lib/actions/theme";
import { fetchUserPurchasedThemes } from "@/lib/supabase/user.client";
import { ProSubscriptionsModal } from "@/components/shared/ProSubscriptionsModal";
import { sendLarkMessage } from "@/lib/lark";

interface ThemeSelectorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ThemeSelector(props: ThemeSelectorProps) {
  const { theme, savedTheme, setTheme, setPreviewTheme } = useBrandTheme();
  const { setTheme: setMode, resolvedTheme } = useTheme();
  const { user, refreshUser } = useAuth();

  // Local state for purchased themes to ensure freshness
  const [localPurchasedThemes, setLocalPurchasedThemes] = useState<string[]>(user?.purchased_themes || []);
  const [showProModal, setShowProModal] = useState(false);

  // Sync local state when user prop updates (e.g. initial load)
  React.useEffect(() => {
    if (user?.purchased_themes) {
      setLocalPurchasedThemes(user.purchased_themes || []);
    }
  }, [user?.purchased_themes]);

  // Controlled vs Uncontrolled state
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = props.open !== undefined;
  const open = isControlled ? props.open : internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    props.onOpenChange?.(newOpen);
    if (!newOpen) {
      // Reset state on close
      setVerificationStep("idle");
      setProofValue("");
    } else {
      // Fetch fresh themes on open
      if (user) {
        fetchUserPurchasedThemes(user.id).then(themes => {
          setLocalPurchasedThemes(themes);
        });
      }
    }
  };

  // Also handle external open prop changes if controlled
  React.useEffect(() => {
    if (props.open && user) {
      fetchUserPurchasedThemes(user.id).then(themes => {
        setLocalPurchasedThemes(themes);
      });
    }
  }, [props.open, user]);

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [verificationStep, setVerificationStep] = useState<"idle" | "awaiting_proof">("idle");
  const [proofValue, setProofValue] = useState("");

  // Store the mode (light/dark) before opening to revert if cancelled
  const originalModeRef = useRef<string | undefined>(undefined);
  // Store if we are currently saving to prevent revert logic
  const isSavingRef = useRef(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      originalModeRef.current = resolvedTheme;
      isSavingRef.current = false;
      setOpen(true);
    } else {
      // Closing
      if (!isSavingRef.current) {
        // Revert changes
        setPreviewTheme(null);
        if (originalModeRef.current) {
          setMode(originalModeRef.current);
        }
      }
      setOpen(false);
    }
  };

  const handlePreview = (t: ThemeOption) => {
    setPreviewTheme(t.id as any);
    // Auto-switch mode based on theme configuration
    if (t.baseMode) {
      setMode(t.baseMode);
    }
  };
  const currentPreviewThemeDef = THEMES.find(t => t.id === theme) || THEMES[0];

  const isLocked = React.useMemo(() => {
    if (!currentPreviewThemeDef.isPro) return false;
    if (user?.is_pro) return false;
    if (localPurchasedThemes.includes(currentPreviewThemeDef.id)) return false;
    return true;
  }, [currentPreviewThemeDef, user, localPurchasedThemes]);

  const handleSave = async () => {
    if (isLocked) {
      toast.error("Unlock this theme first to catch the vibe.");
      return;
    }
    isSavingRef.current = true;
    await setTheme(theme); // Commit the current preview (which is 'theme')
    setOpen(false);

    toast.success("Theme applied! Workspace looking fresh. ✨", {
      action: {
        label: "Refresh Now",
        onClick: () => window.location.reload()
      },
      duration: 3000
    });

    // Auto refresh after short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const getSocialAction = () => {
    const platform = currentPreviewThemeDef.socialPlatform;
    switch (platform) {
      case "twitter_post":
        const text = `I'm leveling up my consistency with @whatchadoin_app 🚀\n\nJust customized my workspace with the ${currentPreviewThemeDef.name} theme. \n\n#habits #productivity`;
        return {
          url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
          label: "Share on X",
          icon: <Twitter className="w-4 h-4 text-blue-400" />,
          instruction: "Share your commitment on X.",
          proofPlaceholder: "Paste your tweet link here",
          proofLabel: "Tweet Link"
        };
      case "twitter_follow":
        return {
          url: "https://twitter.com/whatchadoin_app", // Replace with actual handle
          label: "Follow on X",
          icon: <Twitter className="w-4 h-4 text-blue-400" />,
          instruction: "Follow us on X for updates.",
          proofPlaceholder: "e.g., @yourhandle",
          proofLabel: "Your X Handle"
        };
      case "instagram_follow":
        return {
          url: "https://instagram.com/whatchadoin_app", // Replace with actual handle
          label: "Follow on IG",
          icon: <Instagram className="w-4 h-4 text-pink-500" />,
          instruction: "Follow our journey on Instagram.",
          proofPlaceholder: "e.g., @yourhandle",
          proofLabel: "Your IG Handle"
        };
      case "youtube_sub":
        return {
          url: "https://youtube.com/@whatchadoin_app", // Replace with actual channel
          label: "Subscribe on YT",
          icon: <Youtube className="w-4 h-4 text-red-500" />,
          instruction: "Subscribe to our YouTube channel.",
          proofPlaceholder: "Your Channel Name",
          proofLabel: "Your Channel Name"
        };
      default: // Fallback
        return {
          url: "https://twitter.com/intent/tweet",
          label: "Share",
          icon: <ExternalLink className="w-4 h-4" />,
          instruction: "Share the vibe.",
          proofPlaceholder: "Link to post",
          proofLabel: "Proof Link"
        };
    }
  };

  const handleUnlock = async () => {
    if (!user) {
      toast.error("Login to claim your rewards.");
      return;
    }

    if (currentPreviewThemeDef.unlockCondition === "social") {
      const action = getSocialAction();
      window.open(action.url, "_blank");
      setVerificationStep("awaiting_proof");
      return;
    }

    if (currentPreviewThemeDef.unlockCondition === "payment") {
        setShowProModal(true);
        return;
    }

    // Payment Flow (Simulation)
    setIsUnlocking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await executePurchase();
    } catch (error) {
      toast.error("Could not unlock theme. Try again?");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!proofValue) return;

    const platform = currentPreviewThemeDef.socialPlatform;

    // Specific validation for Post links
    if (platform === "twitter_post") {
      const twitterRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
      if (!twitterRegex.test(proofValue)) {
        toast.error("That link looks sus. Paste the full link to your tweet.");
        return;
      }
    }

    setIsUnlocking(true);
    try {
      // Optimistic Verification via Lark
      await verifySocialUnlock(currentPreviewThemeDef.id, proofValue);

      toast.success(`Unlocked ${currentPreviewThemeDef.name}! Welcome to the club. 🚀`);

      // Update local state immediately
      if (user) {
        setLocalPurchasedThemes(prev => [...prev, currentPreviewThemeDef.id]);
      }
      await refreshUser();

      setVerificationStep("idle");
      setProofValue("");
    } catch (error) {
      toast.error("Verification hiccup. Give it another shot.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const executePurchase = async () => {
    const result = await purchaseTheme(currentPreviewThemeDef.id);
    if (result.error) {
      toast.error(result.error);
      throw new Error(result.error);
    } else {
      toast.success(`Unlocked ${currentPreviewThemeDef.name}! Enjoy.`);
      // Update local state immediately
      if (user) {
        setLocalPurchasedThemes(prev => [...prev, currentPreviewThemeDef.id]);
      }
      await refreshUser();
    }
  };

  const currentThemeDef = THEMES.find(t => t.id === savedTheme) || THEMES[0];

  const getUnlockLabel = () => {
    if (isUnlocking) return "Working on it...";
    if (verificationStep === "awaiting_proof") return "Verify & Unlock";

    if (currentPreviewThemeDef.unlockCondition === "payment") {
      return `Buy for $${(currentPreviewThemeDef.price || 0) / 100}`;
    }
    if (currentPreviewThemeDef.unlockCondition === "social") {
      const action = getSocialAction();
      return `Unlock with ${action.label.split(" ")[2] || "Social"}`; // "Unlock with X", "Unlock with IG"
    }
    return "Unlock";
  };

  const socialAction = getSocialAction();

  const handleProSuccess = async () => {
      await refreshUser();
      setShowProModal(false);
      
      if (user) {
        const larkPrefix = process.env.LARK_MESSAGE_PREFIX || '';
        const env = process.env.NODE_ENV || 'development';
        const envTag = `[${env}]`;
        const message = `User upgraded to PRO via Theme Selector!\n\nID: ${user.id}\nEmail: ${user.email}`;
        await sendLarkMessage(`${larkPrefix} ${envTag} ${message}`, "💰 New Pro Upgrade (Theme)");
      }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {props.trigger !== null && (
        <DialogTrigger asChild>
          {props.trigger || (
            <div
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer group w-full"
              role="button"
              tabIndex={0}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm"
                style={{ backgroundColor: currentThemeDef.colors.primary, color: currentThemeDef.colors.background }}
              >
                <Palette className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Current Theme</div>
                <div className="text-xs text-muted-foreground">{currentThemeDef.name}</div>
              </div>
              <Button variant="ghost" size="sm"
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                Change
              </Button>
            </div>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="w-full max-w-[95vw] sm:max-w-xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden z-[100]">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 text-center shrink-0">
          <DialogTitle>Customize Appearance</DialogTitle>
          <DialogDescription className="max-w-prose mx-auto">
            {verificationStep === "awaiting_proof"
              ? "Vibe check! Verify your action to unlock."
              : "Choose a theme to personalize your experience."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          {verificationStep === "awaiting_proof" ? (
            <div className="py-2 space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg border border-border/50 text-sm space-y-2">
                <p className="font-medium flex items-center gap-2">
                  {socialAction.icon}
                  Step 1: {socialAction.instruction}
                </p>
                <p className="text-muted-foreground">
                  If the popup didn't open, click the button below. We trust you, just need a quick verify.
                </p>
                <Button variant="outline" size="sm" onClick={handleUnlock} className="w-full mt-2">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  {socialAction.label}
                </Button>
              </div>

              <div className="space-y-3">
                <Label>Step 2: {socialAction.proofLabel}</Label>
                <Input
                  placeholder={socialAction.proofPlaceholder}
                  value={proofValue}
                  onChange={(e) => setProofValue(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  We send this to our team to verify. Honest inputs get good karma! ✨
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                const isItemLocked = t.isPro && !user?.is_pro && !localPurchasedThemes.includes(t.id);

                return (
                  <MagicCard
                    key={t.id}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all overflow-hidden",
                      isActive
                        ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                        : "border-transparent hover:border-muted-foreground/20 hover:scale-[1.01]"
                    )}
                    gradientColor={resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
                    onClick={() => handlePreview(t)}
                  >
                    {/* Mini App Preview */}
                    <div
                      className="w-full h-24 rounded-md flex overflow-hidden shadow-sm border border-black/5 dark:border-white/5 relative select-none"
                      style={{ backgroundColor: t.colors.background }}
                    >
                      {/* Sidebar */}
                      <div
                        className="w-1/4 h-full flex flex-col gap-1.5 p-1.5"
                        style={{ backgroundColor: t.colors.sidebar }}
                      >
                        <div className="w-full h-2.5 rounded-sm opacity-80"
                             style={{ backgroundColor: t.colors.sidebarPrimary }} />
                        <div className="w-3/4 h-2 rounded-sm opacity-10"
                             style={{ backgroundColor: t.colors.sidebarForeground }} />
                        <div className="w-full h-2 rounded-sm opacity-10"
                             style={{ backgroundColor: t.colors.sidebarForeground }} />
                      </div>
                      {/* Main Content */}
                      <div className="flex-1 p-2 flex flex-col gap-2">
                        {/* Header */}
                        <div className="w-full h-3 rounded-sm flex items-center gap-1">
                          <div className="w-1/3 h-full rounded-sm opacity-20"
                               style={{ backgroundColor: t.colors.foreground }} />
                        </div>
                        {/* Cards */}
                        <div className="flex gap-2">
                          <div
                            className="flex-1 h-10 rounded-sm shadow-sm"
                            style={{ backgroundColor: t.colors.card }}
                          />
                          <div
                            className="flex-1 h-10 rounded-sm shadow-sm"
                            style={{ backgroundColor: t.colors.card }}
                          />
                        </div>
                      </div>
                      {/* Pro Badge */}
                      {t.isPro && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant={isItemLocked ? "destructive" : "secondary"}
                                 className="backdrop-blur-md shadow-sm text-[10px] h-5 px-1.5 gap-1">
                            {isItemLocked ? <Lock className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            {isItemLocked ? (t.price ? `$${t.price / 100}` : "PRO") : "OWNED"}
                          </Badge>
                        </div>
                      )}

                      {isActive && (
                        <div
                          className="absolute inset-0 bg-black/5 dark:bg-white/5 flex items-center justify-center backdrop-blur-[1px]"
                        >
                          <div
                            className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md animate-in zoom-in-50 duration-200"
                          >
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-semibold tracking-tight">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1 px-2">{t.description}</div>
                    </div>
                  </MagicCard>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-2 sm:pt-4 flex-col sm:flex-row sm:justify-end gap-2 shrink-0">
          {verificationStep === "awaiting_proof" ? (
            <>
              <Button variant="ghost" onClick={() => setVerificationStep("idle")} disabled={isUnlocking}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleVerifyProof} disabled={!proofValue || isUnlocking} className="min-w-[100px]">
                {isUnlocking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Verify & Unlock
              </Button>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </DialogClose>
              {isLocked ? (
                <Button onClick={handleUnlock} disabled={isUnlocking} className="min-w-[100px]">
                  {isUnlocking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {getUnlockLabel()}
                </Button>
              ) : (
                <Button onClick={handleSave} className="min-w-[100px]">
                  Apply Theme
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ProSubscriptionsModal 
        open={showProModal} 
        onOpenChange={setShowProModal} 
        onSuccess={handleProSuccess} 
    />
    </>
  );
}
