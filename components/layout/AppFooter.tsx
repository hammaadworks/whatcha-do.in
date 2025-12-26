'use client';

import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import ContactSupportModal from '@/components/shared/ContactSupportModal';
import FeedbackModal from '@/components/shared/FeedbackModal';
import { PWAInstallModal } from '@/components/shared/PWAInstallModal';
import { LifeBuoy, Bug, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RelatedApplication {
    platform: string;
    url?: string;
    id?: string;
}

const AppFooter = () => {
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

    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false); // New state for client-side mounting

    const { user, loading } = useAuth(); // Call useAuth hook, corrected to 'loading'

    const [isPWAInstalledFromRelatedApps, setIsPWAInstalledFromRelatedApps] = useState(false);

    useEffect(() => {
        setMounted(true); // Set mounted to true after initial client-side render
    }, []);

    useEffect(() => {
        const checkPWAInstallation = async () => {
            if ('getInstalledRelatedApps' in navigator) {
                try {
                    const relatedApps = await (navigator as any).getInstalledRelatedApps();
                    const installed = relatedApps.some((app: RelatedApplication) => app.platform === 'webapp' && app.url?.includes('/manifest.json'));
                    setIsPWAInstalledFromRelatedApps(installed);
                } catch (error) {
                    console.error('Error checking for installed related apps:', error);
                    setIsPWAInstalledFromRelatedApps(false);
                }
            }
        };

        if (mounted) {
            checkPWAInstallation();
        }
    }, [mounted]);

    // Helper function to render the PWA button/message
    const renderPWAInstallUI = () => {
        if (!mounted || loading || !user) { // Corrected to 'loading'
            return null; // Render nothing if not mounted, still loading, or no user
        }

        if (isAppInstalled) {
            return null; // Don't show anything if the app is already installed
        }

        if (isIOS) {
            return (<button
                    onClick={() => {
                        closeInstallMessage();
                        setInstallMessage('To install, tap the Share button (box with an arrow) and then "Add to Home Screen".');
                        setShowInstallMessage(true);
                    }}
                    className="text-primary hover:underline focus:outline-none"
                >
                    Add to Home Screen
                </button>);
        } else { // Not iOS
            return (<button onClick={promptInstall} className="text-primary hover:underline focus:outline-none">
                    Install the App
                </button>);
        }
    };

    return (<footer className="text-center p-4 bg-card border-t border-card-border text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} whatcha-do.in | All rights reserved.

            <div className="flex items-center justify-center gap-x-4 mt-2">
                {
                    (() => {
                        const footerItems = [];

                        footerItems.push(
                            <button key="contact" onClick={() => setIsContactModalOpen(true)} className="flex items-center gap-x-1 text-primary hover:underline focus:outline-none text-sm">
                                <LifeBuoy className="h-4 w-4" />
                                <span>Contact Support</span>
                            </button>
                        );

                        footerItems.push(
                            <button key="feedback" onClick={() => setIsFeedbackModalOpen(true)} className="flex items-center gap-x-1 text-primary hover:underline focus:outline-none text-sm">
                                <Bug className="h-4 w-4" />
                                <span>Send Feedback / Report Bug</span>
                            </button>
                        );

                        if (!isAppInstalled && mounted && !loading && user) { // Corrected to 'loading'
                            footerItems.push(
                                <div key="pwa-install" className="flex items-center gap-x-1 text-primary hover:underline focus:outline-none text-sm">
                                    <Download className="h-4 w-4" />
                                    {renderPWAInstallUI()}
                                </div>
                            );
                        } else if (!isAppInstalled && isPWAInstalledFromRelatedApps && mounted && !loading && user) {
                            footerItems.push(
                                <button
                                    key="open-pwa"
                                    onClick={() => window.open('web+whadoin://', '_self')}
                                    className="flex items-center gap-x-1 text-primary hover:underline focus:outline-none text-sm"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Open in App</span>
                                </button>
                            );
                        }

                        return footerItems.map((item, index) => (
                            <React.Fragment key={item.key}>
                                {index > 0 && <span className="text-muted-foreground px-2">|</span>}
                                {item}
                            </React.Fragment>
                        ));
                    })()
                }
            </div>

            <ContactSupportModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onOpenFeedback={() => { setIsContactModalOpen(false); setIsFeedbackModalOpen(true); }}
            />
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onOpenContact={() => { setIsFeedbackModalOpen(false); setIsContactModalOpen(true); }}
            />
            <PWAInstallModal
                show={showInstallMessage}
                message={installMessage}
                onClose={closeInstallMessage}
            />
        </footer>);
};

export default AppFooter;
