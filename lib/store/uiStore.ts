// lib/store/uiStore.ts
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

interface UiState {
  isUsernameSticky: boolean;
  stickyUsername: string | null;
  layoutMode: "card" | "section";
  setUsernameSticky: (isSticky: boolean) => void;
  setStickyUsername: (username: string | null) => void;
  setLayoutMode: (mode: "card" | "section") => void;
}

const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
  },
  removeItem: (name: string): void => {
    if (typeof document === "undefined") return;
    document.cookie = name + "=; Max-Age=-99999999; path=/;";
  }
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isUsernameSticky: false,
      stickyUsername: null,
      layoutMode: "card", // Default to card view
      setUsernameSticky: (isSticky) => set({ isUsernameSticky: isSticky }),
      setStickyUsername: (username) => set({ stickyUsername: username }),
      setLayoutMode: (mode) => set({ layoutMode: mode })
    }),
    {
      name: "ui-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ layoutMode: state.layoutMode }) // Persist layoutMode and activeTheme
    }
  )
);
