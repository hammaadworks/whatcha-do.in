'use client';

import React from 'react';
import {usePWAInstall} from '@/hooks/usePWAInstall';

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
                        Install PWA
                    </button>);
            }
        }
    };

    return (<footer className="text-center p-4 bg-card border-t border-card-border text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} whatcha-doin. All rights reserved.

            <>
                <span className="mx-2">|</span>
                {renderPWAInstallUI()}
            </>

            {showInstallMessage && (<div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={closeInstallMessage} // Close when clicking outside
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center text-black"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <p className="mb-4">{installMessage}</p>
                        <button
                            onClick={closeInstallMessage}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none"
                        >
                            OK
                        </button>
                    </div>
                </div>)}
        </footer>);
};

export default AppFooter;
