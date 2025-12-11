'use client';

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import { useTheme } from 'next-themes'; // New import for theme management
import { AnimatedThemeTogglerRef } from '@/components/ui/animated-theme-toggler'; // New import for the ref type
import InsightsTrigger from '@/components/shared/InsightsTrigger'; // Import InsightsTrigger
import { toast } from 'sonner'; // Import toast for debugging
import {
    LOCAL_STORAGE_ME_FOLDED_KEY,
    LOCAL_STORAGE_ACTIONS_FOLDED_KEY,
    LOCAL_STORAGE_JOURNAL_FOLDED_KEY,
    LOCAL_STORAGE_TARGETS_FOLDED_KEY
} from '@/lib/constants';

interface KeyboardShortcutsContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggleShortcutsModal: () => void;
    isInsightsOpen: boolean; // Exposed Insights state
    toggleInsightsModal: () => void; // Exposed Insights toggler
    isSettingsOpen: boolean; // Exposed Settings state
    toggleSettingsModal: () => void; // Exposed Settings toggler
    themeTogglerRef: React.RefObject<AnimatedThemeTogglerRef | null>; // Expose the ref for AnimatedThemeToggler, allowing null
    isMeFolded: boolean; // New state for 'Me' section folding
    toggleMeFold: () => void; // New toggler for 'Me' section folding
    isActionsFolded: boolean; // New state for 'Actions' section folding
    toggleActionsFold: () => void; // New toggler for 'Actions' section folding
    isJournalFolded: boolean; // New state for 'Journal' section folding
    toggleJournalFold: () => void; // New toggler for 'Journal' section folding
    isTargetsFolded: boolean; // New state for 'Targets' section folding
    toggleTargetsFold: () => void; // New toggler for 'Targets' section folding
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isInsightsOpen, setInsightsOpen] = useState(false); // Re-added state for Insights
    const [isSettingsOpen, setSettingsOpen] = useState(false); // New state for Settings

    const [isMeFolded, setIsMeFolded] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LOCAL_STORAGE_ME_FOLDED_KEY);
            return saved ? JSON.parse(saved) : true; // Default to folded
        }
        return true;
    });
    const [isActionsFolded, setIsActionsFolded] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LOCAL_STORAGE_ACTIONS_FOLDED_KEY);
            return saved ? JSON.parse(saved) : true; // Default to folded
        }
        return true;
    });
    const [isJournalFolded, setIsJournalFolded] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LOCAL_STORAGE_JOURNAL_FOLDED_KEY);
            return saved ? JSON.parse(saved) : true; // Default to folded
        }
        return true;
    });
    const [isTargetsFolded, setIsTargetsFolded] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LOCAL_STORAGE_TARGETS_FOLDED_KEY);
            return saved ? JSON.parse(saved) : true; // Default to folded
        }
        return true;
    });

    const [isMac, setIsMac] = useState(false);
    const router = useRouter(); // Initialize useRouter
    const { user } = useAuth(); // Get user from useAuth
    const { theme } = useTheme(); // Use the theme hook (setTheme is no longer needed directly here)
    const themeTogglerRef = useRef<AnimatedThemeTogglerRef>(null); // Create ref for AnimatedThemeToggler

    const toggleShortcutsModal = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const toggleInsightsModal = useCallback(() => { // Re-added toggler for Insights
        setInsightsOpen((prev) => !prev);
    }, []);

    const toggleSettingsModal = useCallback(() => { // New toggler for Settings
        setSettingsOpen((prev) => !prev);
    }, []);

    const toggleMeFold = useCallback(() => { // New toggler for 'Me' section folding
        setIsMeFolded((prev: boolean) => !prev);
    }, []);

    const toggleActionsFold = useCallback(() => { // New toggler for 'Actions' section folding
        setIsActionsFolded((prev: boolean) => !prev);
    }, []);

    const toggleJournalFold = useCallback(() => { // New toggler for 'Journal' section folding
        setIsJournalFolded((prev: boolean) => !prev);
    }, []);

    const toggleTargetsFold = useCallback(() => { // New toggler for 'Targets' section folding
        setIsTargetsFolded((prev: boolean) => !prev);
    }, []);

    useEffect(() => {
        console.log('KeyboardShortcutsProvider useEffect running: Attaching keydown listener'); // Added log
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

            const handleKeyPress = (event: KeyboardEvent) => {
              const isModifierPressed = event.altKey || event.metaKey; // Check for Alt/Option/Command
              const isShiftPressed = event.shiftKey; // New check for Shift
              const isSlashPressed = event.code === 'Slash'; // Use event.code for physical key detection
              const isPPressed = event.code === 'KeyP'; // Check for 'P' key
              const isIPressed = event.code === 'KeyI'; // Check for 'I' key
              const isSPressed = event.code === 'KeyS'; // Check for 'S' key
              const isCPressed = event.code === 'KeyC'; // Check for 'C' key
              const isMPressed = event.code === 'KeyM'; // Check for 'M' key
              // Check for 'A' key: KeyA code OR char 'a'/'A' OR Mac special chars 'å' (Opt+A) / 'Å' (Opt+Shift+A)
              const isAPressed = event.code === 'KeyA' || event.key === 'a' || event.key === 'A' || event.key === 'å' || event.key === 'Å';
              const isJPressed = event.code === 'KeyJ'; // Check for 'J' key
              const isTPressed = event.code === 'KeyT'; // Check for 'T' key

              if (isModifierPressed && isSlashPressed) {
                event.preventDefault();
                setIsOpen((prev) => !prev);
              } else if (isModifierPressed && isPPressed) {
                event.preventDefault();
                if (user?.username) {
                    router.push(`/${user.username}`);
                }
              } else if (isModifierPressed && isIPressed) { // Handle Alt + I - Re-added
                event.preventDefault();
                if (user?.username) { // Only open if user is logged in
                    setInsightsOpen((prev) => !prev);
                }
              } else if (isModifierPressed && isSPressed) { // Handle Alt + S for Settings
                event.preventDefault();
                setSettingsOpen((prev) => !prev);
              } else if (isModifierPressed && isCPressed) { // Handle Alt + C for Theme Toggle
                event.preventDefault();
                themeTogglerRef.current?.toggle();
              } else if (isModifierPressed && isShiftPressed && isMPressed) { // Alt + Shift + M
                event.preventDefault();
                toggleMeFold();
              } else if (isModifierPressed && isShiftPressed && isAPressed) { // Alt + Shift + A
                // console.log('Alt+Shift+A detected!');
                // toast("Actions Fold Toggled"); // Visual feedback
                event.preventDefault();
                toggleActionsFold();
              } else if (isModifierPressed && isShiftPressed && isJPressed) { // Alt + Shift + J
                event.preventDefault();
                toggleJournalFold();
              } else if (isModifierPressed && isShiftPressed && isTPressed) { // Alt + Shift + T
                event.preventDefault();
                toggleTargetsFold();
              }
            };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            console.log('KeyboardShortcutsProvider useEffect cleanup: Removing keydown listener'); // Added log
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [user, router, theme, toggleMeFold, toggleActionsFold, toggleJournalFold, toggleTargetsFold, setInsightsOpen]); // Re-add setInsightsOpen to dependency array

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_ME_FOLDED_KEY, JSON.stringify(isMeFolded));
        }
    }, [isMeFolded]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_ACTIONS_FOLDED_KEY, JSON.stringify(isActionsFolded));
        }
    }, [isActionsFolded]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_JOURNAL_FOLDED_KEY, JSON.stringify(isJournalFolded));
        }
    }, [isJournalFolded]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_TARGETS_FOLDED_KEY, JSON.stringify(isTargetsFolded));
        }
    }, [isTargetsFolded]);

    return (<KeyboardShortcutsContext.Provider value={{
        isOpen,
        setIsOpen,
        toggleShortcutsModal,
        isInsightsOpen, // Provided Insights state
        toggleInsightsModal, // Provided Insights toggler
        isSettingsOpen, // Provide Settings state
        toggleSettingsModal, // Provide Settings toggler
        themeTogglerRef, // Provide the ref
        isMeFolded, // Provide 'Me' section folding state
        toggleMeFold, // Provide 'Me' section folding toggler
        isActionsFolded, // Provide 'Actions' section folding state
        toggleActionsFold, // Provide 'Actions' section folding toggler
        isJournalFolded, // Provide 'Journal' section folding state
        toggleJournalFold, // Provide 'Journal' section folding toggler
        isTargetsFolded, // Provide 'Targets' section folding state
        toggleTargetsFold, // Provide 'Targets' section folding toggler
    }}>
            {children}
            <KeyboardShortcutsModal open={isOpen} onOpenChange={setIsOpen}/>
        </KeyboardShortcutsContext.Provider>);
};

export const useKeyboardShortcuts = () => {
    const context = useContext(KeyboardShortcutsContext);
    if (context === undefined) {
        throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
    }
    return context;
};