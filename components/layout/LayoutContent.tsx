"use client";

import React from 'react';
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import { Toaster } from "sonner";
import { useKeyboardShortcuts } from '@/components/shared/KeyboardShortcutsProvider';
import { SettingsDrawer } from '@/components/layout/SettingsDrawer';
import { TooltipProvider } from '@/components/ui/tooltip'; // Import TooltipProvider

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isSettingsOpen, toggleSettingsModal, themeTogglerRef } = useKeyboardShortcuts();

    return (
        <TooltipProvider> {/* Wrap with TooltipProvider */}
            <SettingsDrawer isOpen={isSettingsOpen} onOpenChange={toggleSettingsModal} children={null} />
            <AppHeader themeTogglerRef={themeTogglerRef}/>
            <main className="flex-grow flex justify-center px-2 md:px-4 lg:px-8 pt-16 lg:pt-32 pb-4">
                {children}
            </main>
            <AppFooter/>
            <Toaster
                position="top-center"
                closeButton
                richColors
                theme="system"
            />
        </TooltipProvider>
    );
}
