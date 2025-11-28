# Story 1.1: Project Setup and Core Infrastructure

Status: done

## Story

As a developer,
I want the project to have a standardized setup with core dependencies, build system, and basic deployment pipeline,
So that all subsequent development can proceed efficiently and consistently.

## Acceptance Criteria

1.  **Given** a fresh clone of the repository, **When** `npm install` and `npm run dev` are executed, **Then** the application starts without errors and displays a blank page or a basic "Hello World" message.
2.  Essential development tools (ESLint, Prettier, TypeScript) are configured and working.


## Tasks / Subtasks

-   **Task 1: Initialize Next.js Project and Install Dependencies** (AC: #1)
    -   [x] Subtask 1.1: Execute `npx create-next-app@latest . --typescript --tailwind --eslint --app` to scaffold the project.
    -   [x] Subtask 1.2: Run `npm install` to install all required dependencies.
    -   [x] Subtask 1.3: Verify `npm run dev` starts the application without errors.
    -   [x] Subtask 1.4: Confirm a basic "Hello World" or blank page is displayed.
    -   **Testing:** Manual verification of application startup and initial display.
-   **Task 2: Configure Development Tools** (AC: #2)
    -   [x] Subtask 2.1: Verify `eslint.config.mjs` is present and configured.
    -   [x] Subtask 2.2: Verify `tailwind.config.ts` is present and configured.
    -   [x] Subtask 2.3: Verify `tsconfig.json` is present and configured for TypeScript.
    -   **Testing:** Run `npm run lint` and `npx tsc --noEmit` to ensure no errors.


## Dev Notes

-   **Relevant architecture patterns and constraints:**
    -   Project Initialization: Next.js App Router, TypeScript, Tailwind CSS, ESLint (`architecture.md`, ADR 001).
    -   Testing Strategy: Lean MVP with Vitest, React Testing Library, Playwright, integrated with GitHub Actions (`architecture.md`, Testing Strategy).
    -   SPA functionality (`PRD.md`, FR-6.3).
-   **Source tree components to touch:**
    
    -   `package.json`, `tsconfig.json`, `eslint.config.mjs`, `tailwind.config.ts` (verification/configuration).
    -   `next.config.ts`, `postcss.config.mjs` (default project setup).
-   **Testing standards summary:**
    -   Unit testing will use Vitest and React Testing Library.
    -   E2E testing will use Playwright.


### Project Structure Notes

-   **Next.js App Router:** The project adheres to a Next.js App Router-based structure, organizing code for clear separation of concerns, maintainability, and efficient development. This aligns with the overall architectural decision (ADR 001).
-   **Key Architectural Boundaries:** Frontend components will reside in `app/`, shared logic in `lib/`, `hooks/`, and `components/`, and Supabase-related backend configurations in `supabase/`.
-   **Code Organization:** A hybrid feature-based approach for `app/` routes and shared components is adopted, promoting colocation of related files and centralized data access through `lib/supabase/`. Styling is primarily managed via Tailwind CSS.
-   **Development Bypass (ADR 016):** As noted in `epics.md` and `PRD.md`, a development-mode user injection will be implemented (covered in Story 1.2) to facilitate rapid local testing by bypassing the full Supabase authentication flow, interacting directly with Supabase tables using a hardcoded `user_id`.

### References

-   [Source: docs/architecture.md#Project-Initialization]
-   [Source: docs/architecture.md#Testing-Strategy]
-   [Source: docs/architecture.md#ADR-001:-Project-Initialization-&-Core-Stack]
-   [Source: docs/architecture.md#ADR-016:-Development-Mode-User-Injection]
-   [Source: docs/epics.md#Story-1.1:-Project-Setup-and-Core-Infrastructure]
-   [Source: docs/PRD.md#FR-6.3:-SPA-Functionality]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/stories/1-1-project-setup-and-core-infrastructure.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

## Change Log

| Date       | Version | Change Description | Author     |
| :--------- | :------ | :----------------- | :--------- |
| 2025-11-20 | 1.0     | Story Drafted      | hammaadworks |