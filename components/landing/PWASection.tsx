"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/packages/auth/hooks/useAuth';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { MagicCard } from '@/components/ui/magic-card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2 } from 'lucide-react';
import LoginPromptModal from '@/components/shared/LoginPromptModal'; // Will create this component next
import { SparklesText } from "@/components/ui/sparkles-text"; // Add SparklesText import
import { PulseBadge } from "@/components/shared/PulseBadge"; // Add PulseBadge import

/**
 * A section prompting the user to install the application as a PWA.
 * Conditionally renders only if the app is NOT already installed.
 * Handles iOS specific instructions and login checks.
 */
export const PWASection = () => {
    const { user, loading } = useAuth();
    const { promptInstall, isAppInstalled, isIOS, setInstallMessage, setShowInstallMessage } = usePWAInstall();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInstallClick = () => {
        if (!mounted || loading) {
            return; // Do nothing if not mounted or still loading auth status
        }

        if (!user) {
            setIsLoginModalOpen(true); // Show login prompt if not logged in
            return;
        }

        if (isAppInstalled) {
            // Already installed, maybe show a message or do nothing
            // For now, if installed, the button won't appear or will be disabled.
            return;
        }

        if (isIOS) {
            setInstallMessage('To install, tap the Share button (box with an arrow) and then "Add to Home Screen".');
            setShowInstallMessage(true);
        } else {
            promptInstall();
        }
    };

    // Only render the section if not installed, component is mounted, and auth state is loaded.
    // If the PWA is already installed, we don't need to show this section.
    if (!mounted || loading || isAppInstalled) {
        return null;
    }

    return (
        <section className="relative py-16 bg-gradient-to-br from-background via-card to-background text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            <div className="container mx-auto px-4 text-center">
                <MagicCard
                    className="w-full max-w-4xl mx-auto p-6 md:p-10 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl relative z-10"
                    gradientColor="var(--primary)"
                >
                    <SparklesText>
                        <h2 className="text-4xl md:text-5xl font-extrabold font-mono mb-4 leading-tight">
                            Experience the Power of a PWA
                        </h2>
                    </SparklesText>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Install whatcha-do.in as an app on your device for a faster, more integrated, and distraction-free experience.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="flex flex-col items-center p-4 bg-background/50 rounded-lg shadow-md">
                            <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                            <h3 className="text-xl font-semibold font-mono mb-2">Offline Access</h3>
                            <p className="text-muted-foreground text-sm">Stay productive even without an internet connection.</p>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-background/50 rounded-lg shadow-md">
                            <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                            <h3 className="text-xl font-semibold font-mono mb-2">Native App Experience</h3>
                            <p className="text-muted-foreground text-sm">Fast loading, push notifications, and a dedicated icon on your home screen.</p>
                        </div>
                    </div>

                    {user ? (
                        <PulseBadge
                            link={isIOS ? "#" : "/me"} // Link to # for iOS as it has special instructions
                            bannerText={isIOS ? "Follow instructions above" : "Install whatcha-do.in App"}
                            badgeText="Install Now!"
                        />
                    ) : (
                        <PulseBadge
                            link="/me"
                            bannerText="Log in to Install"
                            badgeText="Login First"
                        />
                    )}
                </MagicCard>
            </div>
            <LoginPromptModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </section>
    );
};