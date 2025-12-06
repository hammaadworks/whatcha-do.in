'use client';

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import { useTheme } from 'next-themes'; // New import for theme management
import { AnimatedThemeTogglerRef } from '@/components/ui/animated-theme-toggler'; // New import for the ref type

interface KeyboardShortcutsContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggleShortcutsModal: () => void;
    isInsightsOpen: boolean; // Exposed Insights state
    toggleInsightsModal: () => void; // Exposed Insights toggler
    isSettingsOpen: boolean; // Exposed Settings state
    toggleSettingsModal: () => void; // Exposed Settings toggler
    themeTogglerRef: React.RefObject<AnimatedThemeTogglerRef | null>; // Expose the ref for AnimatedThemeToggler, allowing null
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isInsightsOpen, setInsightsOpen] = useState(false); // New state for Insights
    const [isSettingsOpen, setSettingsOpen] = useState(false); // New state for Settings
    const [isMac, setIsMac] = useState(false);
    const router = useRouter(); // Initialize useRouter
    const { user } = useAuth(); // Get user from useAuth
    const { theme } = useTheme(); // Use the theme hook (setTheme is no longer needed directly here)
    const themeTogglerRef = useRef<AnimatedThemeTogglerRef>(null); // Create ref for AnimatedThemeToggler

    useEffect(() => {
        console.log('KeyboardShortcutsProvider useEffect running: Attaching keydown listener'); // Added log
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

            const handleKeyPress = (event: KeyboardEvent) => {
              // console.log('Keyboard Event:', event); // Added by me for debugging
              const isModifierPressed = event.altKey || event.metaKey; // Check for Alt/Option/Command
              const isSlashPressed = event.code === 'Slash'; // Use event.code for physical key detection
              const isPPressed = event.key === 'p' || event.key === 'P'; // Check for 'P' key
              const isIPressed = event.key === 'i' || event.key === 'I'; // Check for 'I' key
              const isSPressed = event.key === 's' || event.key === 'S'; // Check for 'S' key
              const isCPressed = event.key === 'c' || event.key === 'C'; // Check for 'C' key

              if (isModifierPressed && isSlashPressed) {
                event.preventDefault();
                setIsOpen((prev) => !prev);
              } else if (isModifierPressed && isPPressed) {
                event.preventDefault();
                if (user?.username) {
                    router.push(`/${user.username}`);
                }
              } else if (isModifierPressed && isIPressed) { // Handle Alt + I
                event.preventDefault();
                if (user?.username) { // Only open if user is logged in
                    setInsightsOpen((prev) => !prev);
                }
              } else if (isModifierPressed && isSPressed) { // Handle Alt + S for Settings
                event.preventDefault();
                setSettingsOpen((prev) => !prev);
              } else if (isModifierPressed && isCPressed) { // Handle Alt + C for Theme Toggle
                event.preventDefault();
                themeTogglerRef.current?.toggle(); // Call the exposed toggle function
              }
            };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            console.log('KeyboardShortcutsProvider useEffect cleanup: Removing keydown listener'); // Added log
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [user, router, theme]); // theme is still a dependency for the handleKeyPress logic

    const toggleShortcutsModal = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const toggleInsightsModal = useCallback(() => { // New toggler for Insights
        setInsightsOpen((prev) => !prev);
    }, []);

    const toggleSettingsModal = useCallback(() => { // New toggler for Settings
        setSettingsOpen((prev) => !prev);
    }, []);

    return (<KeyboardShortcutsContext.Provider value={{
        isOpen,
        setIsOpen,
        toggleShortcutsModal,
        isInsightsOpen, // Provide Insights state
        toggleInsightsModal, // Provide Insights toggler
        isSettingsOpen, // Provide Settings state
        toggleSettingsModal, // Provide Settings toggler
        themeTogglerRef // Provide the ref
    }}>
            {children}
            <KeyboardShortcutsModal open={isOpen} onOpenChange={setIsOpen}/>
            {/* Removed direct rendering of InsightsTrigger */}
        </KeyboardShortcutsContext.Provider>);
};

export const useKeyboardShortcuts = () => {
    const context = useContext(KeyboardShortcutsContext);
    if (context === undefined) {
        throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
    }
    return context;
};
