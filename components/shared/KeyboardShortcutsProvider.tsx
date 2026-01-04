'use client';

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation'; // Import useRouter, useSearchParams
import {useAuth} from '@/packages/auth/hooks/useAuth'; // Import useAuth
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import {useTheme} from 'next-themes'; // New import for theme management
import {AnimatedThemeTogglerRef} from '@/components/ui/animated-theme-toggler'; // New import for the ref type
import { useUiStore } from "@/lib/store/uiStore";
import {
    LOCAL_STORAGE_ACTIONS_FOLDED_KEY,
    LOCAL_STORAGE_JOURNAL_FOLDED_KEY,
    LOCAL_STORAGE_ME_FOLDED_KEY
} from '@/lib/constants';

interface KeyboardShortcutsContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggleShortcutsModal: () => void;
    isSettingsOpen: boolean; // Exposed Settings state
    toggleSettingsModal: () => void; // Exposed Settings toggler
    isMeFolded: boolean; // New state for 'Me' section folding
    toggleMeFold: () => void; // New toggler for 'Me' section folding
    isActionsFolded: boolean; // New state for 'Actions' section folding
    toggleActionsFold: () => void; // New toggler for 'Actions' section folding
    isJournalFolded: boolean; // New state for 'Journal' section folding
    toggleJournalFold: () => void; // New toggler for 'Journal' section folding
    isInsightsOpen: boolean;
    toggleInsightsModal: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false); // New state for Settings
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);

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

    const [isMac, setIsMac] = useState(false);
    const router = useRouter(); // Initialize useRouter
    const searchParams = useSearchParams();
    const {user} = useAuth(); // Get user from useAuth
    const {theme} = useTheme(); // Use the theme hook (setTheme is no longer needed directly here)
    const { layoutMode, setLayoutMode } = useUiStore();
    const themeTogglerRef = useRef<AnimatedThemeTogglerRef>(null); // Create ref for AnimatedThemeToggler

    const toggleShortcutsModal = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const toggleSettingsModal = useCallback(() => { // New toggler for Settings
        setSettingsOpen((prev) => !prev);
    }, []);

    const toggleInsightsModal = useCallback(() => {
        setIsInsightsOpen((prev) => !prev);
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

    useEffect(() => {
        console.log('KeyboardShortcutsProvider useEffect running: Attaching keydown listener'); // Added log

        const handleKeyPress = (event: KeyboardEvent) => {
            const isShiftPressed = event.shiftKey; // New check for Shift
            const isSlashPressed = event.code === 'Slash'; // Use event.code for physical key detection
            const isPeriodPressed = event.code === 'Period'; // Profile
            const isCommaPressed = event.code === 'Comma'; // Settings
            const isSemicolonPressed = event.code === 'Semicolon'; // Vibe
            const isQuotePressed = event.code === "Quote"; // View
            const isBracketRightPressed = event.code === "BracketRight"; // Fold
            const is1Pressed = event.code === 'Key1'; // Me
            const is2Pressed = event.code === 'Key2'; // Actions
            const is3Pressed = event.code === 'Key3'; // Journal

            if (isShiftPressed && isSlashPressed) {
                event.preventDefault();
                setIsOpen((prev) => !prev);
            } else if (isShiftPressed && isPeriodPressed) {
                event.preventDefault();
                if (user?.username) {
                    router.push(`/${user.username}`);
                }
            } else if (isShiftPressed && isCommaPressed) {
                event.preventDefault();
                if (user?.username) { // Only open if user is logged in
                    setSettingsOpen((prev) => !prev);
                }
            } else if (isShiftPressed && isSemicolonPressed) {
                event.preventDefault();
                // vibe selector toggle
                const currentVibe = searchParams?.get('vibe') || 'edit';
                let nextVibe = 'edit';
                // Cycle: edit -> public -> private -> edit
                if (currentVibe === 'edit') nextVibe = 'public';
                else if (currentVibe === 'public') nextVibe = 'private';
                else nextVibe = 'edit';

                const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
                params.set('vibe', nextVibe);
                router.push(`?${params.toString()}`);

            } else if (isShiftPressed && isQuotePressed) {
                event.preventDefault();
                // view selector toggle
                const newMode = layoutMode === 'card' ? 'section' : 'card';
                setLayoutMode(newMode);

            } else if (isShiftPressed && isBracketRightPressed && is1Pressed) {
                event.preventDefault();
                toggleMeFold();
            } else if (isShiftPressed && isBracketRightPressed && is2Pressed) {
                event.preventDefault();
                toggleActionsFold();
            } else if (isShiftPressed && isBracketRightPressed && is3Pressed) {
                event.preventDefault();
                toggleJournalFold();
            }
        };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            console.log('KeyboardShortcutsProvider useEffect cleanup: Removing keydown listener'); // Added log
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [user, router, theme, toggleMeFold, toggleActionsFold, toggleJournalFold, searchParams, layoutMode, setLayoutMode]); // Re-add setInsightsOpen to dependency array

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

    return (<KeyboardShortcutsContext.Provider value={{
        isOpen, setIsOpen, toggleShortcutsModal, // Provided Insights state
        isSettingsOpen, // Provide Settings state
        toggleSettingsModal, // Provide Settings toggler
        isMeFolded, // Provide 'Me' section folding state
        toggleMeFold, // Provide 'Me' section folding toggler
        isActionsFolded, // Provide 'Actions' section folding state
        toggleActionsFold, // Provide 'Actions' section folding toggler
        isJournalFolded, // Provide 'Journal' section folding state
        toggleJournalFold, // Provide 'Journal' section folding toggler
        isInsightsOpen,
        toggleInsightsModal,
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
