# Story 1.2: Implement Foundational Dashboard Layout

Status: ready-for-dev

## Story

As a user,
I want to see the basic layout of my private dashboard, including placeholders for my bio, todo list, and the three habit columns ("Today", "Yesterday", "The Pile"),
So that I have a clear structure for where my habits and todos will appear.

## Acceptance Criteria

1.  **Given** the application is running (`npm run dev`),
2.  **When** I navigate to the dashboard (e.g., `/dashboard`),
3.  **Then** I see a visually distinct area for "Bio", "Todos", "Today", "Yesterday", and "The Pile".
4.  **And** these areas are laid out according to the desktop design (two-row: "Today" and "Yesterday" side-by-side, full-width "The Pile" below).
5.  **And** these areas are responsive for mobile (single-column, stacked layout).
6.  **And** the layout uses placeholder content (e.g., "Your Bio Here", "Your Todos Here", "Today's Habits", etc.).

## Tasks / Subtasks

-   [ ] **Task 1 (AC: 1, 3): Implement basic dashboard page structure**
    -   [ ] Create `app/(main)/dashboard/page.tsx` for the dashboard route.
    -   [ ] Define the main container for the dashboard layout.
    -   [ ] Add placeholder components/divs for "Bio", "Todos", "Today", "Yesterday", and "The Pile".
    -   [ ] Ensure `npx tsc --noEmit` displays the basic page.
    -   **Testing:** Unit test for component rendering. E2E test for page navigation.
-   [ ] **Task 2 (AC: 4): Implement Desktop Layout (Two-row)**
    -   [ ] Apply Tailwind CSS classes to implement the two-row layout:
        -   [ ] Top row: "Today" and "Yesterday" side-by-side.
        -   [ ] Bottom row: Full-width "The Pile".
    -   **Testing:** Visual regression test for desktop layout.
-   [ ] **Task 3 (AC: 5): Implement Mobile Layout (Single-column)**
    -   [ ] Apply Tailwind CSS responsive classes to implement the single-column, stacked layout for mobile: "Today", then "Yesterday", then "The Pile".
    -   **Testing:** Visual regression test for mobile layout.
-   [ ] **Task 4 (AC: 6): Add Placeholder Content**
    -   [ ] Add static placeholder text (e.g., "Your Bio Here", "Your Todos Here", "Today's Habits") to the respective layout areas.
    -   **Testing:** Unit test to confirm placeholder text is rendered.
-   [ ] **Task 5 (AC: All): Ensure responsiveness and accessibility**
    -   [ ] Verify layout adapts correctly to different screen sizes.
    -   [ ] Ensure basic accessibility (e.g., semantic HTML, keyboard navigation for placeholders).
    -   **Testing:** Manual testing across devices/browsers. Accessibility audit (e.g., Lighthouse).

## Dev Notes

-   **Relevant architecture patterns and constraints:**
    -   Next.js App Router for routing and page structure.
    -   Tailwind CSS for styling.
    -   `shadcn/ui` for foundational UI components.
    -   `Aceternity UI` for potential future animations (though not directly in this story).
    -   Responsive design for desktop (two-row) and mobile (single-column, stacked).
    -   WCAG 2.1 Level AA accessibility compliance.
-   **Source tree components to touch:**
    -   `app/(main)/dashboard/page.tsx` (new file for dashboard page).
    -   Potentially new components in `components/common/` for generic layout elements.
-   **Testing standards summary:**
    -   Unit tests for component rendering.
    -   E2E tests for page navigation.
    -   Visual regression tests for desktop and mobile layouts.
    -   Manual testing for responsiveness and accessibility.

### Project Structure Notes

-   Alignment with Next.js App Router conventions.
-   Feature-based organization for `app/` routes.
-   Colocation of related files.

### References

-   [Source: docs/epics.md#Story-1.2-Implement-Foundational-Dashboard-Layout]
-   [Source: docs/PRD.md#FR-4.1]
-   [Source: docs/architecture.md#Project-Structure]
-   [Source: docs/architecture.md#Code-Organization]
-   [Source: docs/architecture.md#Testing-Strategy]
-   [Source: docs/ux-design-specification.md#Main-Board-Layout-&-Interaction]
-   [Source: docs/ux-design-specification.md#Responsive-Design-&-Accessibility]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/1-2-implement-foundational-dashboard-layout.context.xml`

### Agent Model Used

Gemini 1.5 Flash

### Debug Log References

### Completion Notes List

### File List