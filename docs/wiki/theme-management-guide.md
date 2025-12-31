# Theme Management Guide

This document outlines the procedures for managing themes in the *whatcha-do.in* application. It covers both the engineering workflows for adding/modifying themes (Founder's View) and the user experience for discovering and applying them (Customer's View).

---

## 1. Founder's Perspective (Engineering & Admin)

The theme system is built on CSS variables and a centralized TypeScript registry. Adding a theme requires touching both the styling layer and the application logic layer.

### A. File Structure
*   **CSS Definitions:** `app/themes/*.css`
*   **Registry:** `lib/themes.ts` (Single Source of Truth)
*   **UI Components:** `components/settings/ThemeSelector.tsx` (Handles Preview & Unlock)
*   **Actions:** `lib/actions/theme.ts` (Unlock Logic & Lark Integration)

### B. Adding a New Theme

**Step 1: Create the CSS Definition**
Create a new CSS file in `app/themes/` (e.g., `app/themes/oceanic.css`). It must define a data-attribute selector and overrides for the full suite of standard CSS variables.

```css
/* app/themes/oceanic.css */
[data-theme="oceanic"] {
  --background: #e0f7fa;
  --foreground: #006064;
  --primary: #00bcd4;
  /* ... define ALL required variables including charts, sidebar, shadows ... */
}

/* Dark mode override (optional but recommended) */
[data-theme="oceanic"] .dark, .dark [data-theme="oceanic"] {
  --background: #006064;
  --foreground: #e0f7fa;
  /* ... */
}
```

**Step 2: Import the CSS**
Add the import to the main index file: `app/themes/index.css`.

```css
@import "./zenith.css";
@import "./monolith.css";
@import "./oceanic.css"; /* Added */
```

**Step 3: Register the Theme**
Add the theme metadata to the `THEMES` array in `lib/themes.ts`. This makes it visible in the UI.

You can configure the unlock mechanism using `unlockCondition` ('free' | 'payment' | 'social').

**Example 1: Paid Theme ($2.99)**
```typescript
{ 
  id: "oceanic", 
  name: "Oceanic", 
  description: "A calming deep sea blue theme.",
  colors: { 
      background: "#e0f7fa", 
      foreground: "#006064",
      // ... fill ALL color fields from CSS ...
  },
  isPro: true, 
  unlockCondition: 'payment',
  price: 299, 
  baseMode: 'light' // 'light' | 'dark'
},
```

**Example 2: Social Unlock (Twitter/X Post)**
```typescript
{ 
  id: "community-dark", 
  name: "Community Dark", 
  description: "Unlock by sharing your commitment on X!",
  colors: { ... },
  isPro: true, 
  unlockCondition: 'social',
  socialPlatform: 'twitter', // 'twitter' | 'github' | 'instagram' | 'youtube'
  baseMode: 'dark'
},
```

### C. Updating a Theme

*   **Visual Changes:** Edit the specific `.css` file in `app/themes/`. Changes propagate immediately upon reload.
*   **Metadata Changes:** Edit `lib/themes.ts` to change the name, description, price, or premium status.
    *   *Note:* Changing `isPro` from `false` to `true` will lock the theme for users who haven't purchased it (unless they are Premium users).

### D. Deleting a Theme

**Warning:** Deleting a theme that users are currently using requires a migration strategy.

1.  **Remove from Registry:** Remove the entry from `THEMES` in `lib/themes.ts`. It will no longer appear in the store.
2.  **Fallback Logic:** Ensure the `BrandThemeProvider` handles cases where a user's stored theme ID no longer exists in the registry (it currently defaults to `DEFAULT_THEME` aka "zenith").
3.  **Clean up CSS:** Remove the file from `app/themes/` and the import from `index.css`.

### E. Premium Logic

*   **Is Premium:** Defined by `isPro: true` in `lib/themes.ts`.
*   **Access Rules:**
    1.  **Pro User:** Has access to ALL themes automatically (`user.is_pro = true`).
    2.  **Purchased Theme:** A free user can purchase specific premium themes. This is stored in `user.purchased_themes` (array of theme IDs).
    3.  **Social Unlock:** A user can "purchase" a theme for free by verifying a social action (Post & Paste flow).
    4.  **Free Theme:** Accessible to everyone.

---

## 2. Customer's Perspective (User Experience)

The user interacts with themes primarily through the **Theme Selector Modal**.

### A. Accessing the Selector
1.  Open the **Settings Drawer** (Sidebar).
2.  Click the "Current Theme" card or "Themes" button.
3.  The **Theme Selector Modal** opens, showing a grid of all available themes.

### B. Browsing & Previewing
*   **Live Preview:** Clicking any card instantly updates the app's appearance (colors, mode) to preview the theme without saving.
*   **Lock Status:** Themes are marked with "PRO", "OWNED", or a price tag.
*   **Mode Switching:** Selecting a theme automatically switches the app to the theme's preferred Light/Dark mode (`baseMode`).

### C. Unlocking a Theme (Social - "Post & Paste")
This flow increases engagement and builds social proof ("Commitment Loop").

1.  User clicks **"Unlock with X"** (or other social platform).
2.  **Step 1:** A modal prompts them to "Share your commitment". Clicking "Open Tweet" opens a pre-filled tweet in a new tab: *"I'm leveling up my consistency with @whatchadoin_app 🚀..."*
3.  **Step 2:** The user posts the tweet and copies the link.
4.  **Step 3:** Back in the app, they paste the link into the verification input.
5.  **Step 4:** Clicking **"Verify & Unlock"** triggers the following:
    *   **Validation:** Regex checks if it's a valid link format.
    *   **Notification:** The app sends the link + user details to the Admin's Lark channel for audit.
    *   **Unlock:** The theme is *instantly* unlocked (optimistic verification) to reduce friction. Admin can revoke later if needed.

### D. Purchasing a Theme (Monetary)
For themes with `unlockCondition: 'payment'`:
1.  User clicks **"Buy for $X.XX"**.
2.  (Currently Simulated) The system processes the payment.
3.  On success, the theme is added to the user's `purchased_themes` list.
4.  The "Buy" button becomes an "Apply Theme" button.

### E. Applying a Theme
*   Click **"Apply Theme"** on any unlocked/owned theme.
*   The system saves the preference to LocalStorage (for speed) and syncs to the user profile (DB).
*   A notification confirms the change, with an optional "Refresh" button to ensure deep CSS variables are fully propagated if needed.