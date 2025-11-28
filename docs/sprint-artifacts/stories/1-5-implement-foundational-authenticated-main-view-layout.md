# Story 1.5: Implement Foundational Authenticated Main View Layout

Status: done

## Story

As a user,
I want to see the basic layout of my private profile view at `/[username]`, including placeholders for my bio, todo list, and the three
habit columns ("Today", "Yesterday", and "The Pile"),
So that I have a clear structure for where my habits and todos will appear.

## Acceptance Criteria
*(Derived from PRD FR-4.1, FR-1.5, and UX Design Specification sections 4.2/4.3)*

1.  The `app/[username]/page.tsx` renders the basic layout for an authenticated user.
2.  The layout includes a placeholder for the user's bio.
3.  The layout includes a placeholder for the todo list ("Actions" Section).
4.  The layout includes three distinct column placeholders for habits: "Today", "Yesterday", and "The Pile".
5.  The layout is responsive, adapting to desktop (two-row) and mobile (single-column, stacked) views as described in UX Design Specification.

## Tasks / Subtasks

- [x] **Task 1: Implement basic layout structure in `app/[username]/page.tsx` (AC: #1, #2, #3, #4, #5)**
  - [x] Subtask 1.1: Create `app/[username]/layout.tsx` to wrap the `page.tsx` with user-specific layout. (AC: #1)
  - [x] Subtask 1.2: Define a root container for the main view. (AC: #1)
  - [x] Subtask 1.3: Add a placeholder for the user's bio (e.g., a `div` or component with a descriptive comment). (AC: #2)
  - [x] Subtask 1.4: Add a placeholder for the "Actions" section (Todos). (AC: #3)
  - [x] Subtask 1.5: Add a container for the three habit columns ("Today", "Yesterday", "The Pile"). (AC: #4)
  - [x] Subtask 1.6: Implement basic CSS for the three habit columns to demonstrate desktop (two-row) and mobile (stacked) layouts using Tailwind CSS. (AC: #5)
- [x] **Task 2: Integrate `AppHeader` into `app/[username]/layout.tsx` (or parent layout if appropriate) (AC: #1)**
  - [x] Subtask 2.1: Ensure the `AppHeader` (created in Story 1.4) is correctly displayed at the top of the authenticated view. (This might involve adjusting `app/layout.tsx` if `app/[username]/layout.tsx` takes over more responsibility). (AC: #1)
- [x] **Task 3: Basic UI Component Usage (AC: #1)**
  - [x] Subtask 3.1: Utilize `shadcn/ui` components for basic structural elements where appropriate (e.g., `Card` for column containers). (AC: #1)
- [x] **Task 4: Create basic unit/integration tests (AC: #1, #2, #3, #4, #5)**
  - [x] Subtask 4.1: Create a test file `tests/unit/AuthenticatedMainViewLayout.test.tsx`. (AC: #1)
  - [x] Subtask 4.2: Write a test to ensure the bio placeholder is rendered. (AC: #2)
  - [x] Subtask 4.3: Write a test to ensure the todo list placeholder is rendered. (AC: #3)
  - [x] Subtask 4.4: Write tests to ensure the three habit column placeholders are rendered. (AC: #4)
  - [x] Subtask 4.5: (Optional) Write a basic test to verify responsive layout classes (e.g., flex directions or grid setups). (AC: #5)

## Dev Notes

-   The layout will be implemented within `app/[username]/page.tsx` and its corresponding `app/[username]/layout.tsx`.
-   The layout needs to integrate with the existing `AppHeader` component (created in Story 1.4).
-   Utilize `shadcn/ui` for basic structural elements and consider `Aceternity UI` for any micro-interactions if suitable for placeholders.
-   The layout must be responsive, adapting to desktop (two-row) and mobile (single-column, stacked) views.
-   The authentication bypass from Epic 1 is still in effect; a mock user will be injected via `AuthProvider` in `app/(main)/layout.tsx`.
-   Server-side username validation on the `/[username]` route (implemented in Story 1.4) means the layout will only render if a valid username exists.

### Project Structure Notes

-   New files: `app/[username]/layout.tsx`
-   Modified files: `app/[username]/page.tsx`

### References

-   [Source: `docs/epics.md#Story-1.5` (Story Details)](../../epics.md#story-15-implement-foundational-authenticated-main-view-layout)
-   [Source: `docs/PRD.md#FR-4.1` (Main Interface Layout)](../../PRD.md#fr-41-main-interface-core-logic)
-   [Source: `docs/PRD.md#FR-1.5` (Public Profile Content)](../../PRD.md#fr-15-the-public-profile-page-must-display-the-user's-bio-all-public-habits-all-public-todos-and-the-public-journal)
-   [Source: `docs/architecture.md#ADR-017` (Dynamic Root Routing)](../../architecture.md#adr-017-dynamic-root-routing-for-user-profiles)
-   [Source: `docs/ux-design-specification.md#4.2` (Overall Page Structure)](../../ux-design-specification.md#42-overall-page-structure)
-   [Source: `docs/ux-design-specification.md#4.3` (Main Board Layout & Interaction)](../../ux-design-specification.md#43-main-board-layout-interaction)
-   [Source: `docs/sprint-artifacts/1-4-implement-default-username-generation-at-signup.md` (Previous Story Learnings)]({{story_dir}}/1-4-implement-default-username-generation-at-signup.md)
-   [Source: `docs/sprint-artifacts/tech-spec-epic-1.md` (Epic 1 Technical Specification)]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log
