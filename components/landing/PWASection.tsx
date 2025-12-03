"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Smartphone, Tablet, Laptop, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { PWAInstallModal } from "@/components/shared/PWAInstallModal";

export const PWASection = () => {
  const searchParams = useSearchParams();
  const {
      promptInstall,
      isIOS,
      isAppInstalled,
      showInstallMessage,
      installMessage,
      closeInstallMessage,
      setInstallMessage,
      setShowInstallMessage
  } = usePWAInstall();

  useEffect(() => {
    if (searchParams.get("install") === "true") {
        handleInstallClick();
    }
  }, [searchParams]);

  const handleInstallClick = () => {
    if (isAppInstalled) return;

    if (isIOS) {
        closeInstallMessage();
        setInstallMessage('To install, tap the Share button (box with an arrow) and then "Add to Home Screen".');
        setShowInstallMessage(true);
    } else {
        promptInstall();
    }
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden border-y border-white/10 bg-neutral-100/50 dark:bg-neutral-900/50 w-full">
        {/* Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
             <DotPattern className="opacity-60 text-primary/20" glow width={30} height={30} cx={1} cy={1} cr={1} />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-8 text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Your Pocket Coach. <br />
                    <span className="text-primary">No App Store Required.</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                    Always with you, offline or online. Experience a native-like app that lives on your home screen. Loads instantly, works everywhere.
                </p>
                
                {/* Text side instructions/icons */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border">
                         <Smartphone className="h-4 w-4" /> <span>Mobile</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border">
                         <Tablet className="h-4 w-4" /> <span>Tablet</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border">
                         <Laptop className="h-4 w-4" /> <span>Desktop</span>
                     </div>
                </div>
            </div>

            {/* Card CTA */}
            <div className="flex-1 flex justify-center">
                <button 
                    onClick={handleInstallClick}
                    className="group relative size-64 md:size-80 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer text-left outline-none focus:ring-2 focus:ring-primary/50"
                    aria-label="Install Application"
                >
                    <div className="text-center space-y-4 group-hover:scale-105 transition-transform duration-300">
                        <div className="mx-auto size-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-shadow">
                            <Zap className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <p className="font-bold text-lg">whatcha-doin</p>
                        <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                            {isAppInstalled ? "App Installed" : "Tap to Install"}
                        </p>
                    </div>
                </button>
            </div>
        </div>

        {/* PWA Install Modal */}
        <PWAInstallModal
            show={showInstallMessage}
            message={installMessage}
            onClose={closeInstallMessage}
        />
    </section>
  );
};
