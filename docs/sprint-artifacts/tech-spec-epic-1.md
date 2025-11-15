# Epic Technical Specification: {{epic_title}}

Date: 2025-11-15
Author: hammaadworks
Epic ID: 1
Status: Draft

---

## Overview

This epic, "Core Application Foundation & Habit Integration," is the foundational phase of development for 'whatcha-doin'. Its primary goal is to establish the core UI "canvas" for the main dashboard and integrate the existing, already-developed habit management components. This approach, driven by the revised development strategy in the PRD, prioritizes creating a visible, tangible application structure early in the process, providing a stable foundation for all subsequent feature development.

## Objectives and Scope

**In Scope:**
- Initial project setup using `create-next-app` with TypeScript, Tailwind, and ESLint.
- Implementation of the foundational dashboard layout, including placeholder sections for Bio, Todos, and the three habit columns: "Today," "Yesterday," and "The Pile."
- Refactoring and integration of existing Epic 2 components (`HabitCard`, `EditHabitModal`, `HabitCreator`) into the new dashboard layout, specifically within "The Pile" column.
- Ensuring the integrated components are visible and functional when running the application via `npm run dev`.

**Out of Scope:**
- Implementation of the "Two-Day Rule" or "Grace Period" logic.
- Dynamic data fetching for habits (static/dummy data will be used for initial integration).
- User authentication flow integration (covered in Epic 2 integration).
- Any new feature development beyond the integration of existing components.

## System Architecture Alignment

This epic directly implements the foundational aspects of the architecture defined in `docs/architecture.md`. It establishes the **Next.js App Router-based structure** and the **feature-based organization** for the main dashboard. The integration of `shadcn/ui` and `Aceternity UI` for the layout aligns with the chosen design system. By creating the main "canvas," this epic prepares the ground for the subsequent integration of all other services and modules defined in the architecture, such as the Supabase client, authentication services, and custom hooks. It is the first step in realizing the "Frontend (Next.js `app/`)" architectural boundary.

## Detailed Design

### Services and Modules

| Service/Module | Responsibility | Inputs/Outputs | Owner |
| :--- | :--- | :--- | :--- |
| **DashboardLayout (React Component)** | Renders the main two-row, three-column layout for the dashboard. | Input: Child components for each section. Output: Rendered layout. | Dev Team |
| **HabitCard (React Component)** | Displays a single habit. (To be integrated). | Input: Static habit data. Output: Rendered habit card. | Dev Team |
| **HabitCreator (React Component)** | Provides an input for creating new habits. (To be integrated). | Input: N/A. Output: Triggers habit creation (mocked). | Dev Team |
| **EditHabitModal (React Component)** | Provides a modal for editing habits. (To be integrated). | Input: Static habit data. Output: Triggers habit update (mocked). | Dev Team |

### Data Models and Contracts

No new data models will be created in this epic. The focus is on integrating existing UI components with static or dummy data. The `habits` table schema defined in the architecture will be referenced but not modified.

### APIs and Interfaces

No new APIs or interfaces will be created. This epic does not involve backend integration; it focuses on the frontend UI structure and component integration.

### Workflows and Sequencing

**1. Initial Dashboard View:**
1.  User navigates to the main dashboard route (`/dashboard`).
2.  The `DashboardLayout` component renders the main structure with placeholders for Bio, Todos, Today, Yesterday, and The Pile.
3.  Within "The Pile" section, the `HabitCreator` input is displayed, and at least one `HabitCard` is rendered using static data.
4.  The user can visually confirm that the core layout is in place and that habit components are correctly integrated.

## Non-Functional Requirements

### Performance

- The initial load of the dashboard layout should be fast, with a target Largest Contentful Paint (LCP) of under 2.5 seconds.
- The layout should be responsive and render correctly on both desktop and mobile viewports.

### Security

- As this epic is focused on UI layout with static data, there are no specific security requirements beyond standard web security practices (e.g., preventing XSS in any placeholder content).

### Reliability/Availability

- The dashboard layout must render consistently and without errors across all supported browsers (Chrome, Firefox, Safari).

### Observability

- Any client-side errors that occur during the rendering of the layout or integrated components will be captured by Sentry, as defined in the main architecture document.

## Dependencies and Integrations

## Dependencies and Integrations

**External Dependencies:**
- **Vercel:** The application will be deployed on Vercel.
- **Supabase:** While not directly integrated in this epic, the components being integrated are designed to work with Supabase.

**Internal Dependencies:**
- This epic is a prerequisite for all other UI-based epics, as it creates the foundational layout.

**NPM Packages (`package.json`):**
- **Framework:** `next`, `react`, `react-dom`
- **UI & Styling:** `tailwindcss`, `shadcn/ui` (via `@radix-ui/*`), `tailwind-merge`, `clsx`, `lucide-react`
- **State Management:** `zustand`
- **Supabase Client:** `@supabase/supabase-js`, `@supabase/ssr`
- **Testing:** `vitest`, `@testing-library/react`, `playwright`, `jsdom`
- **Linting & Tooling:** `eslint`, `typescript`

## Acceptance Criteria (Authoritative)

1.  **AC-1.1:** The project can be successfully set up by running `pnpm install` (or equivalent), and the development server can be started with `pnpm dev`. (Story 1.1)
2.  **AC-1.2:** A basic CI/CD pipeline is configured in GitHub Actions to run linting and build checks on push/PR. (Story 1.1)
3.  **AC-1.3:** Navigating to the `/dashboard` route renders a page with visually distinct, placeholder sections for "Bio," "Todos," "Today," "Yesterday," and "The Pile." (Story 1.2)
4.  **AC-1.4:** The dashboard layout is responsive, displaying a two-row structure on desktop and a single-column, stacked structure on mobile. (Story 1.2)
5.  **AC-1.5:** At least one `HabitCard` component, populated with static/dummy data, is visible within "The Pile" column on the dashboard. (Story 1.3)
6.  **AC-1.6:** The `HabitCreator` input field and button are visible and integrated within "The Pile" column. (Story 1.4)
7.  **AC-1.7:** Basic interaction with the `HabitCreator` input field (i.e., typing) does not cause any console errors. (Story 1.4)

## Traceability Mapping

| Acceptance Criterion | Spec Section(s) | Component(s) / API(s) | Test Idea |
| :--- | :--- | :--- | :--- |
| **AC-1.1** | Dependencies | `package.json`, `next.config.js` | Manual: Follow setup instructions in README. |
| **AC-1.2** | Dependencies | `.github/workflows/` | Manual: Push a commit and verify Action runs. |
| **AC-1.3** | Detailed Design | `DashboardLayout` | E2E: Navigate to `/dashboard` and check for presence of placeholder elements. |
| **AC-1.4** | Detailed Design | `DashboardLayout` | E2E: Load `/dashboard` in desktop and mobile viewports and verify layout changes. |
| **AC-1.5** | Detailed Design | `HabitCard` | E2E: Check for the `HabitCard` component within "The Pile" section. |
| **AC-1.6** | Detailed Design | `HabitCreator` | E2E: Check for the `HabitCreator` component within "The Pile" section. |
| **AC-1.7** | Detailed Design | `HabitCreator` | Manual: Interact with the input and observe console for errors. |

## Risks, Assumptions, Open Questions

- **Risk:** The existing Epic 2 components (`HabitCard`, `HabitCreator`, etc.) may require more significant refactoring than anticipated to integrate cleanly into the new responsive dashboard layout.
  - **Mitigation:** Allocate a small time buffer for refactoring tasks. The developer responsible for integration should perform a quick analysis before starting implementation to identify potential challenges.
- **Assumption:** The existing components are sufficiently modular and self-contained for straightforward integration.
- **Question:** Are there specific performance budgets (e.g., for Time to Interactive) for the initial dashboard render, beyond the LCP target?
  - **Next Step:** For this epic, we will focus on the LCP target. More detailed performance budgets can be established in a later epic focused on optimization.

## Test Strategy Summary

The testing strategy for this epic will be heavily focused on visual and interactive validation, given its UI-centric nature.
- **Unit Tests (Vitest):** Minimal. Unit tests might be added for any new utility functions, but not for the layout components themselves.
- **Integration Tests (Vitest):** Not applicable for this epic, as there is no new backend integration.
- **E2E Tests (Playwright):** A new E2E test will be created to:
  1. Navigate to the `/dashboard` route.
  2. Verify that the main layout sections ("Bio," "Todos," "Today," "Yesterday," "The Pile") are present.
  3. Verify that a `HabitCard` and `HabitCreator` are rendered within "The Pile".
- **Manual Testing:** Significant manual testing will be required to verify the responsive layout on different screen sizes and browsers.
