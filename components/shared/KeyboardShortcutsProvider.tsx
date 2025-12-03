'use client';

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

interface KeyboardShortcutsContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggleShortcutsModal: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        console.log('KeyboardShortcutsProvider useEffect running: Attaching keydown listener'); // Added log
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

            const handleKeyPress = (event: KeyboardEvent) => {
              // console.log('Keyboard Event:', event); // Added by me for debugging
              const isModifierPressed = event.altKey; // Check for Alt/Option
              const isSlashPressed = event.code === 'Slash'; // Use event.code for physical key detection
        
              if (isModifierPressed && isSlashPressed) {
                event.preventDefault();
                setIsOpen((prev) => !prev);
              }
            };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            console.log('KeyboardShortcutsProvider useEffect cleanup: Removing keydown listener'); // Added log
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const toggleShortcutsModal = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (<KeyboardShortcutsContext.Provider value={{isOpen, setIsOpen, toggleShortcutsModal}}>
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
