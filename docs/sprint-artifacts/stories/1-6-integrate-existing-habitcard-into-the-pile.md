epic_id: "epic-1"
story_id: "1-6"
title: "Integrate Existing HabitCard into 'The Pile' Column"
user_story: |
  As a user,
  I want to see a sample habit card displayed within "The Pile" column on my main view,
  so that I can visualize how my habits will appear and confirm the basic integration of habit components.
acceptance_criteria:
  - "When navigating to the authenticated main view at `/[username]`, a `HabitCard` component is visibly rendered within 'The Pile' column."
  - "The `HabitCard` component displays placeholder content for a habit name (e.g., 'Sample Habit') and a placeholder streak count (e.g., '0')."
  - "The `HabitCard` component is integrated into `app/[username]/page.tsx` or its layout (`app/[username]/layout.tsx`)."
  - "The `HabitCard` component adheres to the project's foundational styling conventions (Tailwind CSS, `shadcn/ui` based)."
  - "The `HabitCard` component's visual style (padding, border-radius, background, text colors) must match the `habit-chip` examples in `docs/ux-color-themes.html` and `docs/ux-public-profile.html`."
  - "The streak badge within the `HabitCard` must be visually distinct, with appropriate background, text color, and border-radius as shown in the mockups."
  - "The `HabitCard` must dynamically adapt its styling for both Light ('Zenith') and Dark ('Monolith') themes as defined in `docs/ux-color-themes.html`."
  - "The `HabitCard` must display privacy indicators (🌐 for public, 🔒 for private) positioned as shown in `docs/ux-public-profile.html`."
tasks_subtasks:
  - "Task 1: Integrate `HabitCard` into 'The Pile' column in `PrivatePage.tsx` (AC: #1, #3)"
    - "Subtask 1.1: Locate the placeholder for 'The Pile' within `components/profile/PrivatePage.tsx`."
    - "Subtask 1.2: Import the `HabitCard` component from `components/habits/HabitCard.tsx`."
    - "Subtask 1.3: Render a `HabitCard` component within the 'The Pile' column."
  - "Task 2: Populate `HabitCard` with mock data (AC: #2)"
    - "Subtask 2.1: Create a mock `habit` object with `id`, `name` ('Sample Habit'), `is_public` (true), `pile_state` ('lively'), `current_streak` (0), `last_streak` (0), and null for `goal_value` and `goal_unit`."
    - "Subtask 2.2: Pass the mock `habit` object to the `habit` prop of `HabitCard`."
    - "Subtask 2.3: Provide dummy `onHabitUpdated` and `onHabitDeleted` functions to `HabitCard`."
  - "Task 3: (New) Enhance `HabitCard` visual design to match UX specifications (AC: #5, #6, #7, #8)"
    - "Subtask 3.1: Implement theme-aware styling for the `HabitCard` component (background, text color, border) using Tailwind CSS and CSS variables defined in the themes."
    - "Subtask 3.2: Style the streak badge within the `HabitCard` to match the mockups (distinct background, text, border-radius)."
    - "Subtask 3.3: Add conditional rendering for privacy icons (🌐 for public, 🔒 for private) within the `HabitCard`, ensuring proper positioning and styling."
    - "Subtask 3.4: Integrate `shadcn/ui` components (e.g., `Badge`, `Card`) or other appropriate components if they enhance the habit chip's design without adding unnecessary complexity, aligning with `UX Design Specification` component strategy."
  - "Task 4: Basic integration tests (AC: #1, #2, #5, #6, #7, #8)"
    - "Subtask 4.1: Create a test file `tests/integration/HabitCardIntegration.test.tsx`."
    - "Subtask 4.2: Write a test to ensure a `HabitCard` is rendered within 'The Pile' when `PrivatePage` is viewed."
    - "Subtask 4.3: Write a test to verify the mock content ('Sample Habit', '0' streak) is displayed in the `HabitCard`."
    - "Subtask 4.4: (New) Write a test to verify the `HabitCard` applies theme-aware styling correctly (e.g., by checking CSS classes or computed styles for light/dark modes)."
    - "Subtask 4.5: (New) Write a test to verify the streak badge is styled as per mockups."
    - "Subtask 4.6: (New) Write a test to verify privacy icons are displayed correctly for public/private habits."
technical_details:
  - "The `HabitCard` component is located at `components/habits/HabitCard.tsx`."
  - "The integration point for 'The Pile' column is within the authenticated user's main view, likely `app/[username]/page.tsx`, based on the `UX Design Specification` section '4.3 Main Board Layout & Interaction' and `Architecture.md` 'Project Structure'."
  - "For this story, the `HabitCard` should be populated with hardcoded/mock habit data to demonstrate its rendering and styling."
  - "Ensure the integration uses existing styling utilities (Tailwind CSS) and components (`shadcn/ui`) as per `Architecture.md` (ADR 001) and `UX Design Specification` ('1.1 Design System Choice')."
  - "The visual enhancements will involve modifying the `HabitCard`'s JSX and CSS classes to dynamically apply styles based on the active theme and to match the precise aesthetic from `docs/ux-color-themes.html` and `docs/ux-public-profile.html`."
  - "Refer to `UX Design Specification` section '4.1 Chosen Design Aesthetic' for the overall design direction ('Professional, tech-savvy, out-of-the-box wow design')."
dependencies:
  - "Story 1.4: Implement Default Username Generation at Signup (Status: Done)"
  - "Story 1.5: Implement Foundational Authenticated Main View Layout (Status: Done)"
testing_notes:
  unit_tests: |
    - No new unit tests specifically for this integration; existing `HabitCard` unit tests (if any) would cover its isolated functionality.
  integration_tests: |
    - Verify that navigating to a user's `/[username]` URL successfully renders the `HabitCard` within the 'The Pile' section of the layout.
    - Check the console for any errors related to `HabitCard` rendering or data props.
    - (New) Verify the `HabitCard` applies theme-aware styling correctly (e.g., by checking CSS classes or computed styles for light/dark modes).
    - (New) Verify the streak badge is styled as per mockups.
    - (New) Verify privacy icons are displayed correctly for public/private habits.
  e2e_tests: |
    - Manual verification by running the development server (`pnpm dev`) and navigating to `http://localhost:3000/someusername` (or an existing test username).
    - Visually confirm the `HabitCard` is present and correctly styled according to the light and dark themes.
    - Visually confirm the streak badge and privacy icons are rendered as per mockups.
file_path: "docs/sprint-artifacts/stories/1-6-integrate-existing-habitcard-into-the-pile.md"
status: "ready-for-dev"


## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/1-6-integrate-existing-habitcard-into-the-pile.context.xml`

### Agent Model Used