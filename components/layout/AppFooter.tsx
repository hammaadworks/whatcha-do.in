'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import ContactSupportModal from '@/components/shared/ContactSupportModal'; // Import the new modal component
import FeedbackModal from '@/components/shared/FeedbackModal'; // Import the feedback modal
import { PWAInstallModal } from '@/components/shared/PWAInstallModal'; // Import the reusable PWA install modal
import { LifeBuoy, Bug, Download } from 'lucide-react'; // Import icons

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

    const [isContactModalOpen, setIsContactModalOpen] = useState(false); // State for contact modal
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // State for feedback modal

    // Helper function to render the PWA button/message
    const renderPWAInstallUI = () => {
        if (isIOS) {
            if (isAppInstalled) {
                return <span className="text-muted-foreground">App Already Installed</span>;
            } else {
                return (<button
                        onClick={() => {
                            closeInstallMessage(); // Close any previous message
                            setInstallMessage('To install, tap the Share button (box with an arrow) and then "Add to Home Screen".');
                            setShowInstallMessage(true);
                        }}
                        className="text-primary hover:underline focus:outline-none"
                    >
                        Add to Home Screen
                    </button>);
            }
        } else { // Not iOS
            if (isAppInstalled) {
                return <span className="text-muted-foreground">App Already Installed</span>;
            } else {
                return (<button onClick={promptInstall} className="text-primary hover:underline focus:outline-none">
                        Install the App
                    </button>);
            }
        }
    };

    return (<footer className="text-center p-4 bg-card border-t border-card-border text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} whatcha-doin. All rights reserved.

            <div className="flex items-center justify-center gap-x-4 mt-2">
                <button onClick={() => setIsContactModalOpen(true)} className="flex items-center gap-x-1 text-primary hover:underline focus:outline-none text-sm">
                    <LifeBuoy className="h-4 w-4" />
                    <span>Contact Support</span>
                </button>
                <button onClick={() => setIsFeedbackModalOpen(true)} className="flex items-center gap-x-1 text-primary hover:underline focus:outline-none text-sm">
                    <Bug className="h-4 w-4" />
                    <span>Send Feedback / Report Bug</span>
                </button>
                <div className="flex items-center gap-x-1 text-primary hover:underline focus:outline-none text-sm">
                    <Download className="h-4 w-4" />
                    {renderPWAInstallUI()}
                </div>
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
