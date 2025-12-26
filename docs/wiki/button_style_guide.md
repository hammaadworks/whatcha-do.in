ccc# Button Style Guide

This document outlines the color styles for key interactive elements in the application header, detailing their appearance in both normal and hover states for the Zenith (light) and Monolith (dark) themes.

## 1. Settings Button in App Header: "Solid Hover"

*   **Description:** This button has a solid background that changes on hover to the accent color, and the foreground (icon) color also changes to the accent foreground color.
*   **Location in Code:** `components/layout/AppHeader.tsx` (button containing the `Settings` icon)
*   **CSS Classes:** `relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`

### Color Styles (Zenith - Light Theme)

*   **Normal State:**
    *   **Background:** `var(--background)` (resolves to `#FFFFFF`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)
*   **Hover State:**
    *   **Background:** `var(--accent)` (resolves to `#FF6B6B`)
    *   **Text/Icon Color:** `var(--accent-foreground)` (resolves to `#FFFFFF`)

### Color Styles (Monolith - Dark Theme)

*   **Normal State:**
    *   **Background:** `var(--background)` (resolves to `#161616`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)
*   **Hover State:**
    *   **Background:** `var(--accent)` (resolves to `#00F5A0`)
    *   **Text/Icon Color:** `var(--accent-foreground)` (resolves to `#000000`)

---

## 2. Settings Button in App Header: "Solid Ring"

*   **Description:** This button has a solid background, a theme-colored ring, and changes on hover to the accent color, with the foreground (icon) color also changing to the accent foreground color.
*   **Location in Code:** _(To be assigned to a component later)_
*   **CSS Classes:** `relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-offset-background transition-colors ring-2 ring-primary hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`

### Color Styles (Zenith - Light Theme)

*   **Normal State:**
    *   **Background:** `var(--background)` (resolves to `#FFFFFF`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)
    *   **Ring Color:** `var(--primary)` (resolves to `#FF6B6B`)
*   **Hover State:**
    *   **Background:** `var(--accent)` (resolves to `#FF6B6B`)
    *   **Text/Icon Color:** `var(--accent-foreground)` (resolves to `#FFFFFF`)
    *   **Ring Color:** `var(--primary)` (resolves to `#FF6B6B`)

### Color Styles (Monolith - Dark Theme)

*   **Normal State:**
    *   **Background:** `var(--background)` (resolves to `#161616`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)
    *   **Ring Color:** `var(--primary)` (resolves to `#00F5A0`)
*   **Hover State:**
    *   **Background:** `var(--accent)` (resolves to `#00F5A0`)
    *   **Text/Icon Color:** `var(--accent-foreground)` (resolves to `#000000`)
    *   **Ring Color:** `var(--primary)` (resolves to `#00F5A0`)

---

## 3. User Popover Menu Button in App Header: "Dim Hover"

*   **Description:** This button has a background of the primary theme color, and on hover, it becomes slightly dimmer while the foreground color remains the same.
*   **Location in Code:** `components/auth/UserMenuPopover.tsx` (button containing the `User` icon)
*   **CSS Classes:** `relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-shrink-0`

### Color Styles (Zenith - Light Theme)

*   **Normal State:**
    *   **Background:** `var(--primary)` (resolves to `#FF6B6B`)
    *   **Text/Icon Color:** `var(--primary-foreground)` (resolves to `#FFFFFF`)
*   **Hover State:**
    *   **Background:** `var(--primary)` at 90% opacity (effectively a slightly darker `#FF6B6B`)
    *   **Text/Icon Color:** `var(--primary-foreground)` (resolves to `#FFFFFF`)

### Color Styles (Monolith - Dark Theme)

*   **Normal State:**
    *   **Background:** `var(--primary)` (resolves to `#00F5A0`)
    *   **Text/Icon Color:** `var(--primary-foreground)` (resolves to `#000000`)
*   **Hover State:**
    *   **Background:** `var(--primary)` at 90% opacity (effectively a slightly darker `#00F5A0`)
    *   **Text/Icon Color:** `var(--primary-foreground)` (resolves to `#000000`)

---

## 4. User Clock Button: "Light Hover"

*   **Description:** This "pill" component displays the current time in the user's timezone. On hover, its background subtly changes to a semi-transparent accent color, while the text color remains constant.
*   **Location in Code:** `components/profile/UserClock.tsx` (the main `div` containing the clock display)
*   **CSS Classes:** `relative inline-flex items-center gap-2 px-3 py-1 rounded-full border border-transparent bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground shadow-sm hover:bg-accent/50 transition-colors cursor-pointer select-none`

### Color Styles (Zenith - Light Theme)

*   **Normal State:**
    *   **Background:** `var(--background)` at 80% opacity (resolves to `rgba(255, 255, 255, 0.8)`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)
*   **Hover State:**
    *   **Background:** `var(--accent)` at 50% opacity (resolves to `rgba(255, 107, 107, 0.5)`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)

### Color Styles (Monolith - Dark Theme)

*   **Normal State:**
    *   **Background:** `var(--background)` at 80% opacity (resolves to `rgba(22, 22, 22, 0.8)`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)
*   **Hover State:**
    *   **Background:** `var(--accent)` at 50% opacity (resolves to `rgba(0, 245, 160, 0.5)`)
    *   **Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)

---

## 5. Circular Progress Indicator

*   **Description:** This component displays a circular progress indicator, used for visualizing completion percentages for actions and targets. It shows a progress arc, a background circle, and a tick icon when 100% complete.
*   **Location in Code:** `components/ui/circular-progress.tsx`
*   **Usage Examples:** `profile/sections/ActionsSection.tsx`, `profile/sections/TargetsSection.tsx`, `shared/ActionItem.tsx`

### Color Roles:

*   **Progress Arc:** The segment of the circle representing the `progress` value.
*   **Background Circle:** The full circle behind the progress arc when not complete.
*   **Complete Fill:** The fill color of the entire circle when `progress` is 100% and `showTickOnComplete` is true.
*   **Complete Stroke:** The stroke color of the background circle when `progress` is 100% and `showTickOnComplete` is true.
*   **Tick Icon:** The checkmark icon displayed when `progress` is 100% and `showTickOnComplete` is true. Its `strokeWidth` is set to `3` for increased visibility.

### Color Styles (Zenith - Light Theme)

*   **Progress Arc (Default `color` - `text-primary`)**
    *   Resolved Value: `var(--primary)` (`#FF6B6B`)
*   **Background Circle (Default `bgColor` - `text-muted`)**
    *   Resolved Value: `var(--muted)` (`#F1F3F5`)
*   **Complete Fill (`completeCircleBgColor` - `var(--muted-foreground)`)**
    *   Resolved Value: `var(--accent)` (`#FF6B6B`)
*   **Complete Stroke (`completeStrokeColor` - `var(--accent)`)**
    *   Resolved Value: `var(--accent)` (`#FF6B6B`)
*   **Tick Icon Color (`text-primary-foreground`)**
    *   Resolved Value: `var(--muted)` (`#F1F3F5`)

### Color Styles (Monolith - Dark Theme)

*   **Progress Arc (Default `color` - `text-primary`)**
    *   Resolved Value: `var(--primary)` (`#00F5A0`)
*   **Background Circle (Default `bgColor` - `text-muted`)**
    *   Resolved Value: `var(--muted)` (`#2a2a2a`)
*   **Complete Fill (`completeCircleBgColor` - `var(--muted-foreground)`)**
    *   Resolved Value: `var(--accent)` (`#00F5A0`)
*   **Complete Stroke (`completeStrokeColor` - `var(--accent)`)**
    *   Resolved Value: `var(--accent)` (`#00F5A0`)
*   **Tick Icon Color (`text-primary-foreground`)**
    *   Resolved Value: `var(--muted)` (`#2a2a2a`)

---

## 6. Vibe Selector Buttons: "Interactive Toggle"

*   **Description:** This component allows users to switch between different view modes (e.g., Edit, Private, Public). It features a distinct style for the selected state and subtle hover effects for both selected and unselected states.
*   **Location in Code:** `components/profile/VibeSelector.tsx`
*   **CSS Classes (Container):** `flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4`
*   **CSS Classes (Base Button):** `px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center`

### Selected State (`currentViewMode === option.id`)

*   **CSS Classes:** `bg-primary text-primary-foreground hover:bg-primary/90`
*   **Zenith (Light Theme):**
    *   **Normal Background:** `var(--primary)` (resolves to `#FF6B6B`)
    *   **Normal Text/Icon Color:** `var(--primary-foreground)` (resolves to `#FFFFFF`)
    *   **Hover Background:** `var(--primary)` at 90% opacity (effectively a slightly darker `#FF6B6B`)
    *   **Hover Text/Icon Color:** `var(--primary-foreground)` (resolves to `#FFFFFF`)
*   **Monolith (Dark Theme):**
    *   **Normal Background:** `var(--primary)` (resolves to `#00F5A0`)
    *   **Normal Text/Icon Color:** `var(--primary-foreground)` (resolves to `#000000`)
    *   **Hover Background:** `var(--primary)` at 90% opacity (effectively a slightly darker `#00F5A0`)
    *   **Hover Text/Icon Color:** `var(--primary-foreground)` (resolves to `#000000`)

### Unselected State (`currentViewMode !== option.id`)

*   **CSS Classes:** `bg-background/80 text-muted-foreground hover:bg-accent/50`
*   **Zenith (Light Theme):**
    *   **Normal Background:** `var(--background)` at 80% opacity (resolves to `rgba(255, 255, 255, 0.8)`)
    *   **Normal Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)
    *   **Hover Background:** `var(--accent)` at 50% opacity (resolves to `rgba(255, 107, 107, 0.5)`)
    *   **Hover Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)
*   **Monolith (Dark Theme):**
    *   **Normal Background:** `var(--background)` at 80% opacity (resolves to `rgba(22, 22, 22, 0.8)`)
    *   **Normal Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)
    *   **Hover Background:** `var(--accent)` at 50% opacity (resolves to `rgba(0, 245, 160, 0.5)`)
    *   **Hover Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)

---

## 7. Journal Tab Buttons: "Public/Private Toggle"

*   **Description:** These buttons allow switching between public and private journal views for a specific date, now consistent in styling with the "Vibe Selector" component.
*   **Location in Code:** `components/journal/JournalPageContent.tsx` (public journal, private journal tab section)
*   **CSS Classes (Container):** `flex items-center bg-card rounded-full p-2 shadow-md border border-primary gap-x-4`
*   **CSS Classes (Base Button):** `px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center transition-all`

### Selected State (`activeTab === 'public'` or `activeTab === 'private'`)

*   **CSS Classes:** `bg-primary text-primary-foreground hover:bg-primary/90`
*   **Zenith (Light Theme):**
    *   **Normal Background:** `var(--primary)` (resolves to `#FF6B6B`)
    *   **Normal Text/Icon Color:** `var(--primary-foreground)` (resolves to `#FFFFFF`)
    *   **Hover Background:** `var(--primary)` at 90% opacity (effectively a slightly darker `#FF6B6B`)
    *   **Hover Text/Icon Color:** `var(--primary-foreground)` (resolves to `#FFFFFF`)
*   **Monolith (Dark Theme):**
    *   **Normal Background:** `var(--primary)` (resolves to `#00F5A0`)
    *   **Normal Text/Icon Color:** `var(--primary-foreground)` (resolves to `#000000`)
    *   **Hover Background:** `var(--primary)` at 90% opacity (effectively a slightly darker `#00F5A0`)
    *   **Hover Text/Icon Color:** `var(--primary-foreground)` (resolves to `#000000`)

### Unselected State (`activeTab !== 'public'` or `activeTab !== 'private'`)

*   **CSS Classes:** `bg-background/80 text-muted-foreground hover:bg-accent/50`
*   **Zenith (Light Theme):**
    *   **Normal Background:** `var(--background)` at 80% opacity (resolves to `rgba(255, 255, 255, 0.8)`)
    *   **Normal Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)
    *   **Hover Background:** `var(--accent)` at 50% opacity (resolves to `rgba(255, 107, 107, 0.5)`)
    *   **Hover Text/Icon Color:** `var(--muted-foreground)` (resolves to `#495057`)
*   **Monolith (Dark Theme):**
    *   **Normal Background:** `var(--background)` at 80% opacity (resolves to `rgba(22, 22, 22, 0.8)`)
    *   **Normal Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)
    *   **Hover Background:** `var(--accent)` at 50% opacity (resolves to `rgba(0, 245, 160, 0.5)`)
    *   **Hover Text/Icon Color:** `var(--muted-foreground)` (resolves to `#CCCCCC`)