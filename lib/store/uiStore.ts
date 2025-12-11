// lib/store/uiStore.ts
import { create } from 'zustand';

interface UiState {
    isUsernameSticky: boolean;
    stickyUsername: string | null;
    layoutMode: 'card' | 'section';
    setUsernameSticky: (isSticky: boolean) => void;
    setStickyUsername: (username: string | null) => void;
    setLayoutMode: (mode: 'card' | 'section') => void;
}

export const useUiStore = create<UiState>((set) => ({
    isUsernameSticky: false,
    stickyUsername: null,
    layoutMode: 'card', // Default to card view
    setUsernameSticky: (isSticky) => set({ isUsernameSticky: isSticky }),
    setStickyUsername: (username) => set({ stickyUsername: username }),
    setLayoutMode: (mode) => set({ layoutMode: mode }),
}));
