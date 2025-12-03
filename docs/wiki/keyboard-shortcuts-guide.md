# Keyboard Shortcuts Guide for whatcha-doin

This guide establishes conventions for implementing keyboard shortcuts across the *whatcha-doin* application. Adhering to these rules ensures a consistent, accessible, and non-conflicting user experience for all keyboard users, while respecting the diverse ways users interact with our app.

---

## 1. Core Principles

*   **Consistency is Key:** All application-specific shortcuts must follow a predictable pattern.
*   **Avoid Conflicts:** Shortcuts *must not* interfere with browser-native or operating system shortcuts.
*   **Accessibility First:** Keyboard shortcuts are an enhancement, not the primary means of interaction. All functionalities must be fully accessible via mouse/touch/other input methods.
*   **Contextual Relevance:** Shortcuts should be logical and intuitive for the action they perform.
*   **Touchscreen Exclusivity:** Keyboard shortcuts are irrelevant for touchscreen users (mobile, tablets). They *must not* be displayed on such devices and are not a substitute for touch-friendly UI.

---

## 2. Shortcut Pattern: The "Application Specific" Modifier

To prevent conflicts with browser and OS-level shortcuts, all application-specific keyboard shortcuts will use the `Alt` (or `Option` on Mac) as the primary modifier key.

**Pattern:** `[Platform Modifier] + [Key]`

*   **Mac Users:** `⌥ (Option) + [Key]`
*   **Windows/Linux Users:** `Alt + [Key]`

This pattern is chosen because:
*   It's a widely accepted convention for application-specific actions.
*   It significantly reduces the likelihood of conflicts with common browser shortcuts (e.g., `Cmd/Ctrl + 1-9` for tabs, `Cmd/Ctrl + P` for print).
*   It provides a shorter, more concise key combination compared to `Cmd/Ctrl + Shift + [Key]`.

---

## 3. Key Selection Guidelines `([Key])`

When choosing the `[Key]` part of the shortcut:

*   **Prioritize First Letter:** Whenever possible, use the first letter of the action (e.g., `P` for Profile, `I` for Insights, `K` for Keyboard Shortcuts).
*   **Memorability:** Choose keys that are easy to remember and associate with the action.
*   **Avoid Overlap:** Ensure the chosen `[Key]` doesn't create conflicting application-specific shortcuts.
*   **Special Characters:** Use sparingly. If a special character is highly intuitive (e.g., `/` for search, `?` for help), it can be considered (e.g., `Alt + ?`).

---

## 4. Implementation Guidelines

### A. Dynamic Display & OS Detection

*   **Use a Helper Component:** Implement a reusable `KeyboardShortcut` component (or similar utility) that dynamically detects the user's operating system (Mac vs. Windows/Linux) to display the correct modifier key (`⌘` vs. `Ctrl`).
*   **Conditional Rendering:** This helper component *must* also conditionally render itself, *hiding* the shortcut display for touchscreen/mobile users. This prevents visual clutter and confusion for users who cannot utilize keyboard shortcuts.

    **Example (`KeyboardShortcut` component logic):**
    ```typescript
    // In components/utils/KeyboardShortcut.tsx (or similar)
    const KeyboardShortcut: React.FC<{ keys: string[]; isMac: boolean; isMobile: boolean }> = ({ keys, isMac, isMobile }) => {
      if (isMobile) return null; // Hide on mobile

      const modifier = isMac ? "⌥" : "Alt"; // Option for Mac, Alt for others
      return (
        <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="kbd kbd-sm bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm">{modifier}</kbd>
          {keys.map((key, index) => (
            <kbd key={index} className="kbd kbd-sm bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm">{key}</kbd>
          ))}
        </span>
      );
    };
    ```

### B. Event Handling

*   **Global Listeners (Use with Caution):** For top-level menu items (like in `UserMenuPopover`), global keyboard event listeners (e.g., on `document`) can be used. Ensure these listeners:
    *   Are added and removed correctly (e.g., using `useEffect` in React).
    *   Check for the appropriate modifier key (`Alt`/`Option`).
    *   `e.preventDefault()` should be called only if the shortcut is handled to prevent browser defaults.
*   **Component-Specific Listeners:** For actions within a focused component (like `ActionItem.tsx`), use `onKeyDown` handlers directly on the focusable element. This limits the scope of the shortcut and prevents unintended global activation.

### C. Keeping the Shortcuts Modal Updated

The `KeyboardShortcutsModal.tsx` component serves as the central hub for documenting all keyboard shortcuts available within the application. It is crucial that this modal is always up-to-date.

**Rule:** Any time a new keyboard shortcut is introduced, or an existing shortcut is modified or removed, the `KeyboardShortcutsModal.tsx` file *must* be updated accordingly to reflect these changes. This ensures users always have access to accurate and comprehensive shortcut information.

---

## 5. Examples from the App

### A. `UserMenuPopover.tsx` (Global Menu Navigation)

These shortcuts provide quick access to main sections of the user's dashboard.

*   **View Profile:** `Alt/Option + P`
*   **View Insights:** `Alt/Option + I`
*   **Keyboard Shortcuts (this very list):** `Alt/Option + /`

### B. `ActionItem.tsx` (In-Context Item Manipulation)

These shortcuts are active when an `ActionItem` is focused, allowing for efficient task management.

*   **Move Item Up:** `Alt/Option + ArrowUp`
*   **Move Item Down:** `Alt/Option + ArrowDown`
*   **Indent Item:** `Tab`
*   **Outdent Item:** `Shift + Tab`

---

## 6. Touchscreen User Experience

For users on mobile phones, tablets, or other touchscreen devices without a physical keyboard:

*   **No Shortcut Display:** The `KeyboardShortcut` component *must not* render.
*   **UI Alternatives:** All functionalities accessed via keyboard shortcuts *must* have clearly visible and easily tappable UI elements (buttons, icons, menu items) as their primary means of interaction. Never assume a keyboard is present.

By following this guide, we ensure that adding new keyboard shortcuts enhances the experience for power users without creating friction or confusion for others.
