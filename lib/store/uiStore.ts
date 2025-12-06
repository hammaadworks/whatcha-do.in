// lib/store/uiStore.ts
import { create } from 'zustand';

interface UiState {
    isUsernameSticky: boolean;
    stickyUsername: string | null;
    setUsernameSticky: (isSticky: boolean) => void;
    setStickyUsername: (username: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
    isUsernameSticky: false,
    stickyUsername: null,
    setUsernameSticky: (isSticky) => set({ isUsernameSticky: isSticky }),
    setStickyUsername: (username) => set({ stickyUsername: username }),
}));
