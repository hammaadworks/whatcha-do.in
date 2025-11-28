# whatcha-doin UX Design Specification

_Created on 2025-11-12 by hammaadworks_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

**NOTE:** For development purposes, Magic Link authentication is temporarily disabled. The application is configured to use a hardcoded test user session for all feature development. This is achieved by injecting a mock user via the `AuthProvider` component in `app/(main)/layout.tsx` when `NEXT_PUBLIC_DEV_MODE_ENABLED=true`. To re-enable Magic Link, set `NEXT_PUBLIC_DEV_MODE_ENABLED=false` in `.env.local` (or remove it) and set `enable_signup = true` in `supabase/config.toml` under both `[auth]` and `[auth.email]` sections.

"whatcha-doin" is an identity-building toolkit focused on helping "The Ambitious Underachiever" build consistent habits. The core experience is about building identity through consistent actions, with a philosophy of "no friction, no stress, only pure productivity." It's the app where users build their identity with consistent habits one by one.

---

## 1. Design System Foundation

### 1.1 Design System Choice

The primary design system will be `shadcn/ui` for foundational components, complemented by `Aceternity UI` for animations and "wow" moments.

A dual-theme strategy will be implemented:
- **Light Mode:** "Zenith" theme (clean, energetic, pastel gradients).
- **Dark Mode:** "Monolith" theme (sharp, focused, bold accent).
A prominent Light/Dark Mode switcher will be a key feature.

---

## 2. Core User Experience

### 2.1 Defining Experience

The core experience of "whatcha-doin" is defined by the principle that "It's the app where you build your identity with consistent habits one by one." It functions as an "identity-building toolkit," emphasizing "no friction, no stress, only pure productivity." The primary focus is on empowering users to build and maintain consistent habits as a foundation for their identity.

### 2.2 Novel UX Patterns

Two key novel UX patterns have been identified to enhance user engagement and provide unique feedback:

1.  **"Positive Urgency" UI:**
    *   **Concept:** An "Ambient Animated Background" for the `Yesterday` column.
    *   **Visuals:** A slow, shifting gradient (cool colors transitioning to warm colors) will be used in the column's background.
    *   **Interaction:** A tooltip on hover will display the time remaining until the daily cut-off.
    *   **Rationale:** This provides a high-end, non-distracting "wow" factor that subtly encourages users to complete pending habits without creating undue stress.

2.  **"Teleport-to-Journal" Animation for Action Completion:**
    *   **Concept:** A unique animation sequence for completing "Actions" (Todos).
    *   **Interaction:** When an Action is marked complete, it will visually fade out from the "Actions" section. Simultaneously, it will fade in and "pop" into the "Completed Todos" section within the Journal.
    *   **Rationale:** This intuitive animation provides clear, delightful feedback, reinforcing the connection between completing tasks and building a journal of accomplishments, requiring no explicit teaching.

---

## 3. Visual Foundation

### 3.1 Color System

The application will feature a dual-theme color strategy to cater to user preferences and provide distinct visual experiences:

*   **Light Mode: "Zenith" Theme**
    *   **Aesthetic:** Clean, energetic, utilizing pastel gradients.
    *   **Purpose:** To provide a bright and uplifting user interface.

*   **Dark Mode: "Monolith" Theme**
    *   **Aesthetic:** Sharp, focused, with bold accents.
    *   **Purpose:** To offer a concentrated and visually striking user interface, reducing eye strain in low-light conditions.

A prominent Light/Dark Mode switcher will be available for users to easily toggle between these themes. The specific color palettes for each theme will be detailed in the interactive Color Theme Explorer.

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Aesthetic
The overall design aesthetic will be "Professional, tech-savvy, out-of-the-box wow design," incorporating gradients, artsy looks, and fluid animations. Inspiration is drawn from platforms like Framer, Motion, and `supermemory.ai`.

### 4.2 Overall Page Structure
The main interface is organized with the following top-to-bottom structure to provide a clear and logical user flow:
1.  User Info/Bio
2.  **"Actions" Section** (Todos)
3.  **"Habits" Section** (The Identity Momentum Board: Today, Yesterday, The Pile)
4.  **Journal Section** (Daily entry with date selector)
5.  Motivational Quote
6.  Footer (minimal)

### 4.3 Main Board Layout & Interaction

*   **Desktop Layout:**
    *   **Structure:** A two-row layout. The top row will feature `Today` and `Yesterday` columns side-by-side. The bottom row will be a full-width `The Pile` column.
    *   **Interaction:** `Drag-and-Drop` functionality will be supported for moving habits between columns.

*   **Mobile Layout:**
    *   **Structure:** A single-column, stacked layout. Habits will appear in the order: `Today`, then `Yesterday`, then `The Pile`.
    *   **Interaction:** `Tap-to-Move` will be implemented, where users tap a habit chip and then tap the destination column to move it.

### 4.4 Interactive Mockups

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

The application's core functionality revolves around several critical user journeys:

1.  **Habit Management (Identity Momentum Board):**
    *   **Habit Creation Flow:** To create a new habit, the user clicks an "add new" area in "The Pile", which reveals an inline input field for the habit's name. As the user types, a `+ Add Goal` button appears next to the input.
        *   If the user simply presses Enter, the habit is created without a goal.
        *   If the user clicks `+ Add Goal`, the area expands to show a `[number]` input and a `[unit]` dropdown. The dropdown contains a predefined list (`minutes`, `pages`, etc.) and a "Custom..." option, which converts the dropdown to a text field for a user-defined unit.
    *   **Core Principle:** The "True Two-Day Rule". A streak is only broken after two consecutive missed days.
    *   **State 1: Miss Day 1 → "Lively" State:** When a habit in "Yesterday" is missed, it moves to "The Pile" and becomes "Lively". It is visually distinct and prioritized at the top of The Pile.
    *   **"Lively" Recovery:** Rescuing a "Lively" habit by moving it to "Today" **continues the original streak uninterrupted.**
    *   **State 2: Miss Day 2 → "Junked" State:** If a "Lively" habit is ignored for another day, it transitions to a "Junked" state, appearing greyed out.
    *   **"Junked" Recovery:** Rescuing a "Junked" habit **resets its streak to 1.** The previously broken streak's value is saved as the `last_streak`.
    *   **"Junked" Counter:** A counter (e.g., "-7") appears on "Junked" habits to show how long they've been neglected.
    *   **Sorting (`The Pile`):** Habits are sorted first by state ("Lively" on top), then by public status, then by `last_streak` (descending), and finally by name (ascending).
    *   **Undo:** A long-press on a 'Today' chip allows users to undo the completion. This action reverts the streak count and moves the habit back based on its prior state: to "Yesterday" if the streak was > 1, or to "The Pile" if the streak was 1.
    *   **Deletion:** Habits can only be deleted when they are in "The Pile".
    *   **Habit Chip:** Displays name, streak badge, and `🌐 Public` / `🔒 Private` icon.
    *   **Habit Details View:** Clicking on a habit chip (that is not in an editing state) will trigger a modal dialog. This modal provides a read-only, 'at-a-glance' view of the habit's key properties, including its full name, streak, goal, privacy status, and the date it was created. This allows for quick inspection without entering an edit flow.
    *   **Habit Goal Adjustment (Upgrade/Downgrade):**
        *   Users can set and modify a quantitative goal for a habit (e.g., "Read 5 pages", "Do 20 pushups").
        *   When a habit's goal is upgraded or downgraded, the existing streak will **continue uninterrupted**. The new `goal_value` becomes the requirement for continuing the streak from the moment of change.
        *   **UI:** Clear confirmation dialogs will inform the user of the change and its impact on future requirements. The streak counter remains unchanged, but the displayed goal on the habit card immediately updates.
    *   **Habit Granularity:**
        *   The system will support both **broad habits** (e.g., "Workout") and **atomic habits** (e.g., "10 Pushups").
        *   **UI:** For broad habits, the completion modal will allow for logging details (e.g., reps, duration, specific activities) within the completion flow without requiring separate habit definitions. Users will be guided to choose the appropriate granularity based on their "why."

2.  **Habit Completion Flow & Data Entry:**
    *   **Trigger:** When a habit is marked complete, a modal appears.
    *   **Layout:** The modal features a streak update display, a "fuel meter" for `mood` selection, a central `work/goal` display with an "i" button for goal info, and structured inputs for `duration` and `notes`.
    *   **Streak Display:** Shows current streak and the projected new streak (e.g., "Streak: 5 → 6").
    *   **Mood Input:** The user taps one of six discrete segments on a semi-circular "fuel meter" to log their subjective `mood` (0-100).
    *   **Work Input:** The user taps the `work` number (e.g., the "25" in "25/30 pages") to type their quantitative achievement.
    *   **In-Modal Goal Editing:** The user can tap the `goal` number to update the habit's goal. An "i" button provides a pop-up explanation.
    *   **Duration Input:** Consists of a number field for the value and a dropdown for the unit ("minutes", "hours").
    *   **Data Recording:** The system records the `mood_score`, `work_value`, `duration_value`, `duration_unit`, `goal_value`, and `notes`.
    *   **Bypass:** Users can bypass detail entry by pressing `Enter` to log the item with default values.
    *   **Cancel Option:** A "Cancel" button is available to dismiss the modal without logging.
    *   **Pre-filling:** If a habit is re-recorded on the same day (e.g., after an undo), the modal will pre-fill with the last recorded `mood`, `work`, and `duration` values for that day.
    *   **Reference:** An interactive mockup of this modal is available in `docs/ux-completion-modal.html`.

3.  **Grace Period Feature:**
    *   **Tone:** "Gentle Reminder" (empathetic, non-judgmental).
    *   **Purpose:** To provide an empathetic "gentle reminder" for missed habits.
    *   **Screen:** An "End of Day Summary" screen appears if the user opens the app after 12 AM with pending habits from the previous day.
    *   **Interaction:** Users can tap to mark pending habits complete, or use a "+ Add another habit you completed" button to add from `The Pile` or create new for the previous day.
    *   **Confirmation:** A single `Finish & Start [New Day]` button concludes the grace period.

4.  **Actions (Todos) System:**
    *   **Location:** A separate section positioned above the Habits board.
    *   **Creation/Editing:** Utilizes an "Intelligent Notepad" concept with an inline input field at the bottom of the list. `Tab` allows for 2-level deep sub-todos. A `🌐/🔒` privacy toggle is available on hover.
    *   **Sorting:** Public first, then Creation Time (ASC).
    *   **Completion:** Features a "Teleport-to-Journal" animation, where the todo fades out from "Actions" and fades in/pops into "Completed Todos" in the Journal.

5.  **Journal System:**
    *   **Structure:** A "Two-Sided Journal" with distinct `[ 🌐 Public Journal ]` and `[ 🔒 Private Journal ]` tabs.
    *   **Content:** Each daily entry includes user-typed notes (Markdown editor). Completed Habits and Todos are automatically added as line items, displaying the habit's name, mood, work, and duration.
    *   **Privacy Logic:** The privacy of completed Habits/Todos notes is determined by their original status. Free-form notes' privacy is determined by the active tab. Absolute separation ensures public profiles only see `🌐 Public Journal` content.

---

## 6. Component Library

### 6.1 Component Strategy

The component strategy will leverage established UI libraries to ensure consistency, accessibility, and rapid development, while incorporating a specialized animation library for enhanced user experience.

*   **Foundational Components:** `shadcn/ui` will serve as the primary design system for core UI components (buttons, forms, modals, etc.). This choice provides a robust, accessible, and customizable foundation.
*   **Animation and Micro-interactions:** `Aceternity UI` will be integrated to deliver "wow" moments and fluid animations, enhancing the overall aesthetic and user delight. This library will be used for subtle transitions, visual feedback, and dynamic elements that contribute to the app's "out-of-the-box wow design" aesthetic.
*   **Additional UI Enhancements:** `Magic UI` components (https://magicui.design/docs/components) can be utilized for further visual enhancements and complex UI patterns, ensuring compatibility and adherence to the overall design aesthetic.

This dual-library approach allows for efficient development of standard UI elements while providing the flexibility to implement unique and engaging visual interactions. Custom components will be developed only when specific UI/UX requirements cannot be met by these libraries.

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

To ensure a cohesive and efficient user experience, the following UX pattern decisions will guide the application's design:

*   **Keyboard-First Interaction:**
    *   The application will adhere to a "keyboard-first" design philosophy, prioritizing robust navigation and interaction via `Tab`, `Space`, and `Enter` keys.
    *   Custom keyboard shortcuts will be implemented sparingly, reserved only for high-frequency actions to avoid cognitive overload.
    *   This ensures speed and efficiency for power users and enhances accessibility.

*   **Micro-interactions and Subtle Cues:**
    *   The interface will be rich with micro-interactions and subtle visual cues. These small, contextual animations and feedback mechanisms are paramount for conveying a blend of **empowerment, pride, focus, and positive urgency.**
    *   Examples include visual state changes when habits move between columns, and the "Teleport-to-Journal" animation for action completion.
    *   These elements provide clear feedback, make the experience feel alive, and contribute to the overall "wow" design aesthetic without being distracting.

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

The application will be designed to provide an optimal viewing and interaction experience across a wide range of devices, from desktop to mobile.

*   **Desktop Layout:**
    *   **Structure:** A two-row layout will be utilized. The top row will present `Today` and `Yesterday` columns side-by-side, while the bottom row will feature a full-width `The Pile` column.
    *   **Interaction:** `Drag-and-Drop` functionality will be the primary interaction method for moving habits.

*   **Mobile Layout:**
    *   **Structure:** A single-column, stacked layout will be implemented. Content will be ordered as `Today`, followed by `Yesterday`, and then `The Pile`.
    *   **Interaction:** `Tap-to-Move` will be the primary interaction for habit manipulation on mobile devices.

**Accessibility:**

The application will adhere to the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard**. This commitment ensures that the application is usable by individuals with a wide range of disabilities, covering aspects such as perceivability, operability, understandability, and robustness. Key considerations will include keyboard navigation, screen reader compatibility, color contrast, and touch target sizes.

---

## 9. Implementation Guidance

### 9.1 Completion Summary

This UX Design Specification outlines the foundational design decisions for the "whatcha-doin" application. Key aspects covered include:

*   **Project Vision & Core Philosophy:** Defined the project's purpose as an "identity-building toolkit" for "The Ambitious Underachiever," emphasizing "no friction, no stress, only pure productivity."
*   **Design System Foundation:** Established `shadcn/ui` as the primary design system and `Aceternity UI` for animations, alongside a dual-theme strategy ("Zenith" for light mode, "Monolith" for dark mode).
*   **Core User Experience:** Articulated the defining experience as building identity through consistent habits and identified novel UX patterns such as the "Positive Urgency" UI and "Teleport-to-Journal" animation.
*   **Visual Foundation:** Detailed the dual-theme color system, providing distinct aesthetic experiences for light and dark modes.
*   **Design Direction:** Outlined the "Professional, tech-savvy, out-of-the-box wow design" aesthetic and specified responsive layouts for desktop (two-row, drag-and-drop) and mobile (single-column, tap-to-move).
*   **User Journey Flows:** Summarized critical user paths for Habit Management, Grace Period, Actions System, and Journal System, including core logic, state changes, and interactions.
*   **Component Strategy:** Confirmed the use of `shadcn/ui` for foundational components and `Aceternity UI` for animations.
*   **UX Pattern Decisions:** Emphasized a "keyboard-first" interaction philosophy and the importance of micro-interactions and subtle cues for feedback and emotional engagement.
*   **Responsive Design & Accessibility:** Defined responsive layouts for desktop and mobile, and committed to WCAG 2.1 Level AA accessibility compliance.

These decisions provide a comprehensive guide for the subsequent design and development phases, ensuring a consistent, intuitive, and engaging user experience.

---

## Appendix

### Related Documents

- Product Requirements: `PRD.md`
- Brainstorming: `brainstorming-session-results-2025-11-10.md`

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: /Users/alhamdulillah/codespace/whatcha-doin/docs/ux-color-themes.html
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: /Users/alhamdulillah/codespace/whatcha-doin/docs/ux-design-directions.html
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Optional Enhancement Deliverables

_This section will be populated if additional UX artifacts are generated through follow-up workflows._

<!-- Additional deliverables added here by other workflows -->

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

### Version History

| Date     | Version | Changes                         | Author        |
| -------- | ------- | ------------------------------- | ------------- |
| 2025-11-12 | 1.0     | Initial UX Design Specification | hammaadworks |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._