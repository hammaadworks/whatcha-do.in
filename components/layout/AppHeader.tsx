'use client';

import React, {useEffect, useState, useCallback} from 'react';
import Link from 'next/link';
import {useAuth} from '@/hooks/useAuth';
import {AnimatedThemeToggler, AnimatedThemeTogglerRef} from '@/components/ui/animated-theme-toggler'; // Re-added import and new import for ref type
import UserMenuPopover from '@/components/auth/UserMenuPopover';
import {KeyRound, Settings} from "lucide-react";
import {cn} from "@/lib/utils";
import {usePathname} from 'next/navigation';
import {SettingsDrawer} from '@/components/layout/SettingsDrawer';
// Removed KeyboardShortcutsModal import as it's now handled by the provider
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useKeyboardShortcuts } from '@/components/shared/KeyboardShortcutsProvider'; // Import the new hook
import { useUiStore } from '@/lib/store/uiStore'; // Import the Zustand store
import { toast } from 'sonner'; // Import toast for user feedback

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components

interface AppHeaderProps {
    themeTogglerRef: React.RefObject<AnimatedThemeTogglerRef | null>;
}

const MAX_USERNAME_LENGTH = 12; // Define max length for username in header, adjust as needed

const AppHeader = ({ themeTogglerRef }: AppHeaderProps) => {
    const {user, loading} = useAuth();
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    // Removed isKeyboardShortcutsModalOpen state
    const { scrollY } = useScroll();
    const { toggleShortcutsModal, toggleSettingsModal } = useKeyboardShortcuts(); // Use the hook and add toggleSettingsModal
    const { isUsernameSticky, stickyUsername } = useUiStore(); // Access Zustand store state

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true, attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const handleCopyProfileLink = useCallback(() => {
        if (stickyUsername) {
            const profileLink = `${window.location.origin}/${stickyUsername}`;
            navigator.clipboard.writeText(profileLink).then(() => {
                toast.success(`'${stickyUsername}' profile link copied!`);
            }).catch((err) => {
                console.error('Failed to copy: ', err);
                toast.error('Failed to copy profile link.');
            });
        }
    }, [stickyUsername]);


    if (loading) {
        return null;
    }

    const logoSrc = isDark ? '/favicons/dark/logo-bg.png' : '/favicons/light/logo-bg.png';

    return (<React.Fragment>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 z-50 w-full flex justify-center pointer-events-none"
            >
                <div className={cn(
                    "pointer-events-auto flex items-center rounded-full transition-all duration-500 ease-in-out backdrop-blur-md w-[calc(100%-2rem)] max-w-5xl mt-4 border border-border/50",
                    isScrolled
                                                ? "px-4 py-1 sm:px-4 sm:py-2 bg-background/80 shadow-lg"
                                                : "px-6 py-1.5 sm:px-6 sm:py-3 bg-background/60 shadow-md"
                )}>
                    {/* Left Section: Logo and App Name */}
                    <div className="flex items-center space-x-2 min-w-max">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="relative overflow-hidden rounded-full p-1 transition-transform group-hover:scale-110">
                                <img src={logoSrc} alt="Whatcha Doin' Logo" className="h-8 w-auto"/>
                            </div>
                            <span className="text-muted-foreground/50">|</span>
                            <span className="text-base sm:text-lg font-bold tracking-tight text-foreground/90 transition-opacity duration-300 whitespace-nowrap">
                                whatcha-doin
                            </span>
                        </Link>
                    </div>

                    {/* Center Section: Sticky Username */}
                    <div className="flex-grow flex justify-center px-4"> {/* Added px-4 for some padding */}
                        {isUsernameSticky && stickyUsername && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className="text-xl font-extrabold text-primary cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis" // Added overflow-hidden and text-ellipsis
                                        onClick={handleCopyProfileLink}
                                    >
                                        {stickyUsername.length > MAX_USERNAME_LENGTH
                                            ? `${stickyUsername.substring(0, MAX_USERNAME_LENGTH)}...`
                                            : stickyUsername}
                                    </span>
                                </TooltipTrigger>
                                {stickyUsername.length > MAX_USERNAME_LENGTH && ( // Only show tooltip if truncated
                                    <TooltipContent>
                                        <p>{stickyUsername}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        )}
                    </div>

                    {/* Right Section: Theme Toggler, Settings, User Menu/Login */}
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-max">
                        <AnimatedThemeToggler ref={themeTogglerRef}/> {/* Pass the ref */}

                        {user && (
                            <button
                                onClick={toggleSettingsModal} // Call toggleSettingsModal directly
                                className={cn("relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
                            >
                                <Settings className="h-6 w-6" strokeWidth={2.5}/>
                                <span className="sr-only">Settings</span>
                            </button>
                        )}

                        {user ? (
                            <UserMenuPopover
                                user={user}
                                // onOpenKeyboardShortcuts={toggleShortcutsModal}
                            />
                        ) : (
                            <Link href="/me">
                                                                <button
                                                                    className={cn(
                                                                        "relative inline-flex h-9 items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                                                        "w-9 sm:w-auto px-0 sm:px-4", // Make it square on mobile, auto width & px-4 on sm+
                                                                        "bg-primary text-primary-foreground shadow-md hover:opacity-80" // Always primary themed
                                                                    )}
                                                                >
                                                                    <KeyRound className="h-4 w-4 sm:mr-2" strokeWidth={2.5}/>
                                                                    <span className="sr-only sm:not-sr-only">Login</span>
                                                                </button>                            </Link>
                        )}
                    </div>
                </div>            </motion.header>
            {/* Removed KeyboardShortcutsModal rendering from here */}
        </React.Fragment>);
};

export default AppHeader;
