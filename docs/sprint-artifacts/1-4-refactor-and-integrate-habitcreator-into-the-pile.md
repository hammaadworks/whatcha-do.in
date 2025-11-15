# Story 1.4: Refactor and Integrate HabitCreator into The Pile

Status: ready-for-dev

## Story

As a user,
I want to be able to see and interact with the habit creation input field within "The Pile" column,
So that I can understand how to add new habits to my list.

## Acceptance Criteria

1.  **Given** the dashboard layout is present (Story 1.2) and a sample `HabitCard` is integrated (Story 1.3),
2.  **When** I view "The Pile" column,
3.  **Then** I see the `HabitCreator` component (input field and "+ Add Goal" button) integrated at the top or bottom of "The Pile" column.
4.  **And** the `HabitCreator` is styled correctly and appears integrated into the layout.
5.  **And** `npm run dev` shows this integrated component.
6.  **And** basic interaction (typing in the input field) does not cause errors.

## Tasks / Subtasks

-   [ ] **Task 1 (AC: 1, 3, 5): Refactor `HabitCreator.tsx` for integration**
    -   [ ] Review `components/habits/HabitCreator.tsx` to ensure it's a standalone, reusable component.
    -   [ ] Make any necessary refactoring to accept props for initial state or callbacks for interaction.
    -   **Testing:** Unit test `HabitCreator` in isolation.
-   [ ] **Task 2 (AC: 1, 3, 4, 5): Integrate `HabitCreator` into `app/(main)/dashboard/page.tsx`**
    -   [ ] Import `HabitCreator.tsx` into the dashboard page component.
    -   [ ] Place the `HabitCreator` component within "The Pile" section of the dashboard layout.
    -   [ ] Ensure it's styled correctly using Tailwind CSS and `shadcn/ui` components.
    -   **Testing:** E2E test to verify `HabitCreator` is rendered in the correct location.
-   [ ] **Task 3 (AC: 6): Verify basic interaction**
    -   [ ] Ensure typing in the input field does not cause console errors.
    -   [ ] Visually confirm the "+ Add Goal" button appears/disappears as expected (if that logic is already in `HabitCreator`).
    -   **Testing:** Manual testing of input field interaction.
-   [ ] **Task 4 (AC: All): Ensure responsiveness and accessibility**
    -   [ ] Verify `HabitCreator` component adapts correctly to different screen sizes.
    -   [ ] Ensure basic accessibility (e.g., keyboard navigation, ARIA attributes for input).
    -   **Testing:** Manual testing across devices/browsers. Accessibility audit.

## Dev Notes

-   **Relevant architecture patterns and constraints:**
    -   Next.js App Router for routing and page structure.
    -   Tailwind CSS for styling.
    -   `shadcn/ui` for foundational UI components.
    -   `Aceternity UI` for potential future animations (though not directly in this story).
    -   Responsive design for desktop (two-row) and mobile (single-column, stacked).
    -   WCAG 2.1 Level AA accessibility compliance.
-   **Source tree components to touch:**
    -   `app/(main)/dashboard/page.tsx` (to integrate `HabitCreator`).
    -   `components/habits/HabitCreator.tsx` (for potential refactoring).
-   **Testing standards summary:**
    -   Unit tests for `HabitCreator` in isolation.
    -   E2E tests to verify `HabitCreator` integration and rendering.
    -   Manual testing for responsiveness, accessibility, and basic interaction.

### Project Structure Notes

-   Alignment with Next.js App Router conventions.
-   Feature-based organization for `app/` routes.
-   Colocation of related files.

### References

-   [Source: docs/epics.md#Story-1.4-Refactor-and-Integrate-HabitCreator-into-The-Pile]
-   [Source: docs/PRD.md#FR-2.1]
-   [Source: docs/architecture.md#Project-Structure]
-   [Source: docs/architecture.md#Code-Organization]
-   [Source: docs/architecture.md#Testing-Strategy]
-   [Source: docs/ux-design-specification.md#Main-Board-Layout-&-Interaction]
-   [Source: docs/ux-design-specification.md#User-Journey-Flows]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/1-4-refactor-and-integrate-habitcreator-into-the-pile.context.xml`

### Agent Model Used

Gemini 1.5 Flash

### Debug Log References

### Completion Notes List

### File List