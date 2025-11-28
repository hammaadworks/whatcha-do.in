## Story 1.2: Implement Development Login Bypass

**Status:** done

## Story

As a developer,
I want to bypass the full Supabase login flow during local development,
So that I can quickly test core features using a predefined user session without repeated logins.

## Requirements Context Summary

This story implements a critical development-time feature to enable rapid iteration and testing of application functionalities without requiring a live Supabase authentication flow. It directly addresses the technical notes from Epic 1 in `epics.md` and ADR 016 in `architecture.md`, which specify a temporary bypass of Supabase authentication. The mechanism involves injecting a predefined mock user's `user_id` into the session when `NEXT_PUBLIC_DEV_MODE_ENABLED=true`. This allows direct interaction with Supabase tables using the hardcoded `user_id`, effectively bypassing Supabase Authentication for data operations during development. This temporary bypass will be replaced by full Supabase Auth integration in the final epic. This approach aligns with the overall goal of establishing foundational project infrastructure.

## Acceptance Criteria

1.  **Given** the application is in local development mode (`NEXT_PUBLIC_DEV_MODE_ENABLED=true` is set),
2.  **When** the application loads,
3.  **Then** the user session is automatically initialized with the following predefined dummy user, and this `user_id` is used for all user-specific data operations (read/write):
    ```json
    {
      "id": "68be1abf-ecbe-47a7-bafb-46be273a2e",
      "email": "hammaadworks@gmail.com"
    }
    ```
4.  **And** the existing authentication components (e.g., `Auth.tsx`, `Logins.tsx`) are either bypassed or conditionally rendered to prevent interference with the development bypass.
5.  **And** the application functions as if a user with the specified `user_id` is logged in, allowing interaction with Supabase tables.

## Tasks / Subtasks

-   **Task 1: Implement `AuthProvider` for Development Bypass** (AC: #1, #2, #3, #5)
    -   [x] Subtask 1.1: Create or modify `components/auth/AuthProvider.tsx` to conditionally inject a mock `user_id` based on an environment variable (`NEXT_PUBLIC_DEV_MODE_ENABLED`).
    -   [x] Subtask 1.2: When `NEXT_PUBLIC_DEV_MODE_ENABLED=true`, set the `user_id` to "68be1abf-ecbe-47a7-bafb-46be273a2e" for Supabase client interactions.
    -   [x] Subtask 1.3: Ensure `supabase.auth.getSession()` or similar client-side authentication checks reflect this mock session.
    -   **Testing:** Unit tests for `AuthProvider` logic. Integration tests to verify Supabase client uses the mock `user_id`.
-   **Task 2: Conditionally Render Authentication Components** (AC: #4)
    -   [x] Subtask 2.1: Modify `app/(main)/layout.tsx` to wrap its content with `AuthProvider`.
    -   [x] Subtask 2.2: Adjust `components/auth/Auth.tsx` and `components/auth/Logins.tsx` (or other relevant authentication UI components) to conditionally render based on `NEXT_PUBLIC_DEV_MODE_ENABLED` or the presence of a real authenticated session versus the mock session.
    -   **Testing:** E2E tests to verify authentication UI is bypassed in development mode.
-   **Task 3: Update `lib/supabase/client.ts` to use injected `user_id`** (AC: #3, #5)
    -   [x] Subtask 3.1: Ensure that the Supabase client initialization or subsequent data access functions correctly utilize the `user_id` provided by the `AuthProvider` when in development mode.
    -   **Testing:** Integration tests for data operations using the mock `user_id`.
-   **Task 4: Environment Variable Setup** (AC: #1)
    -   [x] Subtask 4.1: Document the `NEXT_PUBLIC_DEV_MODE_ENABLED` environment variable in `.env.local.example` and `README.md`.
    -   **Testing:** Manual verification of environment variable usage.

## Dev Notes

-   **Relevant architecture patterns and constraints:**
    -   **ADR 016: Development Mode User Injection:** This story directly implements the decision to inject a mock user for development purposes.
    -   **Supabase Interaction:** The core idea is to bypass Supabase's authentication *flow* but still interact with Supabase *tables* using a specific user ID. **The bypass test user (mock `user_id`) must be able to insert, select, update, and delete data into all respective tables (users, habits, habit_completions, todos, journal_entries) while respecting RLS policies defined in `supabase/migrations/20251113093152_initial_schema_setup.sql`.**
    -   **Next.js App Router:** The `AuthProvider` will likely be a client component and wrap main layout routes.
    -   **Temporary Bypass:** This is a temporary solution and must be replaced by full Supabase Auth integration in Epic 8.
-   **Source tree components to touch:**
    -   `components/auth/AuthProvider.tsx` (new or heavily modified)
    -   `app/(main)/layout.tsx` (to integrate `AuthProvider`)
    -   `components/auth/Auth.tsx`, `components/auth/Logins.tsx` (conditional rendering)
    -   `lib/supabase/client.ts` (to ensure `user_id` is passed correctly)
    -   `.env.local.example`, `README.md` (documentation)
-   **Testing standards summary:**
    -   **Unit Tests:** Focus on the logic within `AuthProvider` for conditional user injection.
    -   **Integration Tests:** Verify that Supabase client calls use the injected `user_id` and that RLS policies allow access for this `user_id`.
    -   **E2E Tests:** Ensure that in development mode, the application behaves as if logged in with the mock user, and that actual login UI is suppressed.
-   **Project Structure Notes:** The `AuthProvider` will provide the mock user context throughout the application's main routes.

### Learnings from Previous Story

**From Story 1-1-project-setup-and-core-infrastructure (Status: done)**

-   **Architectural Decisions:**
    -   Project initialized with Next.js App Router, TypeScript, Tailwind CSS, ESLint (ADR 001).
    -   Lean MVP testing strategy with Vitest, React Testing Library, Playwright (architecture.md, Testing Strategy).
    -   Project adheres to Next.js App Router-based structure, hybrid organization for shared components, colocation of related files, and centralized data access.
    -   Development-mode user injection (ADR 016) implemented for rapid local testing by bypassing Supabase authentication, interacting directly with Supabase tables using a hardcoded `user_id`. This is planned to be covered in Story 1.2.
-   **Technical Debt:**
    -   Development-mode user injection (ADR 016) is a temporary bypass and needs to be replaced by full Supabase Auth integration in Epic 8.
-   **Warnings for Next Story:**
    -   Ensure proper handling and removal of development-mode user injection (ADR 016) in later stages to re-enable Magic Link functionality.
    -   Story 1.2 will cover the implementation of the development login bypass, which is a critical dependency for feature development without full Supabase authentication.

[Source: stories/1-1-project-setup-and-core-infrastructure.md#Dev-Notes]

## References

-   [Source: docs/epics.md#Story-1.2:-Implement-Development-Login-Bypass]
-   [Source: docs/architecture.md#ADR-016:-Development-Mode-User-Injection]
-   [Source: docs/PRD.md#Executive-Summary]
-   [Source: docs/architecture.md#Executive-Summary]

## Dev Agent Record

### Context Reference

- /Users/alhamdulillah/codespace/whatcha-doin/docs/sprint-artifacts/stories/1-2-implement-development-login-bypass.context.xml

### Agent Model Used

### Debug Log References

### Completion Notes List
- **Implemented Development Login Bypass:**
    - Created `hooks/useAuth.tsx` to centralize authentication state management and conditionally inject a mock user based on `NEXT_PUBLIC_DEV_MODE_ENABLED`.
    - Created `lib/supabase/client.ts` to initialize the Supabase client and dynamically mock `supabase.auth.getSession()` and `supabase.auth.getUser()` in development mode.
    - Created `app/(main)/layout.tsx` to wrap main application routes with the `AuthProvider`.
    - Refactored `components/auth/AuthProvider.tsx` to re-export `hooks/useAuth.tsx`'s `AuthProvider`.
    - Refactored `components/auth/Auth.tsx` to consume authentication state from `hooks/useAuth.tsx` and conditionally render login components.
    - Documented `NEXT_PUBLIC_DEV_MODE_ENABLED` in `README.md`.
    - Implemented unit tests for `useAuth` hook (`tests/unit/useAuth.test.tsx`).

### File List
- **New Files:**
    - `hooks/useAuth.tsx`
    - `lib/supabase/client.ts`
    - `app/(main)/layout.tsx`
    - `tests/unit/useAuth.test.tsx`
    - `tests/integration/supabaseClient.test.ts`
- **Modified Files:**
    - `components/auth/AuthProvider.tsx`
    - `components/auth/Auth.tsx`
    - `README.md`

## Change Log

| Date       | Version | Change Description | Author     |
| :--------- | :------ | :----------------- | :--------- |
| 2025-11-22 | 1.0     | Story Drafted      | hammaadworks |
| 2025-11-22 | 1.3     | Implemented Unit, Integration, and E2E Tests | Amelia     |

## Senior Developer Review (AI)

**Reviewer:** Amelia
**Date:** 2025-11-22
**Outcome:** CHANGES REQUESTED
**Summary:** The core implementation for bypassing Supabase login in development mode has been successfully completed, with robust mocking of the Supabase client and conditional rendering of authentication components. Environment variables are well-documented. However, the story explicitly requires unit, integration, and E2E tests, which are currently missing.

**Key Findings:**

-   **HIGH Severity:**
    -   Missing Unit Tests: Unit tests for `AuthProvider` logic (conditional user injection) are not implemented (Task 1. Testing).
    -   Missing Integration Tests: Integration tests to verify Supabase client uses the mock `user_id` (Task 1. Testing and Task 3. Testing) are not implemented.
    -   Missing E2E Tests: E2E tests to ensure that in development mode, the application behaves as if logged in with the mock user, and that actual login UI is suppressed (Task 2. Testing) are not implemented.

**Acceptance Criteria Coverage:**

| AC# | Description                                                                                                                                                           | Status        | Evidence                                                                  |
| :-- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------------------------------------------------ |
| 1   | Given the application is in local development mode (`NEXT_PUBLIC_DEV_MODE_ENABLED=true` is set)                                                                       | IMPLEMENTED   | `README.md` (lines 14-16), `hooks/useAuth.tsx` (line 21), `lib/supabase/client.ts` (line 14) |
| 2   | When the application loads                                                                                                                                            | IMPLEMENTED   | Implicitly handled by Next.js component lifecycle and `useEffect` hooks. |
| 3   | Then the user session is automatically initialized with the following predefined dummy user, and this `user_id` is used for all user-specific data operations (read/write): `{ "id": "68be1abf-ecbe-47a7-bafb-46be273a2e", "email": "hammaadworks@gmail.com" }` | IMPLEMENTED   | `hooks/useAuth.tsx` (lines 23-34), `lib/supabase/client.ts` (lines 17-28) |
| 4   | And the existing authentication components (e.g., `Auth.tsx`, `Logins.tsx`) are either bypassed or conditionally rendered to prevent interference with the development bypass. | IMPLEMENTED   | `components/auth/Auth.tsx` (lines 14-22) uses `useAuth()` to control rendering of `Logins.tsx`. |
| 5   | And the application functions as if a user with the specified `user_id` is logged in, allowing interaction with Supabase tables.                                         | IMPLEMENTED   | `lib/supabase/client.ts` (lines 37-47) mocks `supabase.auth.getSession()` and `supabase.auth.getUser()` to return the mock user. |
Summary: 5 of 5 acceptance criteria fully implemented.

**Task Completion Validation:**

| Task                                                        | Marked As   | Verified As       | Evidence                                                                  |
| :---------------------------------------------------------- | :---------- | :---------------- | :------------------------------------------------------------------------ |
| Task 1.1: Create or modify `components/auth/AuthProvider.tsx` to conditionally inject a mock `user_id`. | COMPLETE    | VERIFIED COMPLETE | `hooks/useAuth.tsx` (lines 21-36), `components/auth/AuthProvider.tsx` (re-export). |
| Task 1.2: When `NEXT_PUBLIC_DEV_MODE_ENABLED=true`, set `user_id` to "68be1abf-ecbe-47a7-bafb-46be273a2e" for Supabase client interactions. | COMPLETE    | VERIFIED COMPLETE | `lib/supabase/client.ts` (lines 17-47).                                   |
| Task 1.3: Ensure `supabase.auth.getSession()` reflects mock session. | COMPLETE    | VERIFIED COMPLETE | `lib/supabase/client.ts` (lines 37-47).                                   |
| Task 2.1: Modify `app/(main)/layout.tsx` to wrap content with `AuthProvider`. | COMPLETE    | VERIFIED COMPLETE | `app/(main)/layout.tsx` (lines 5-9).                                      |
| Task 2.2: Adjust `Auth.tsx` and `Logins.tsx` for conditional rendering. | COMPLETE    | VERIFIED COMPLETE | `components/auth/Auth.tsx` (lines 14-22).                                 |
| Task 3.1: Ensure Supabase client uses injected `user_id`.     | COMPLETE    | VERIFIED COMPLETE | `lib/supabase/client.ts` (lines 37-47).                                   |
| Task 4.1: Document `NEXT_PUBLIC_DEV_MODE_ENABLED` in `.env.local.example` and `README.md`. | COMPLETE    | VERIFIED COMPLETE | `README.md` (lines 14-16), `.env.local.example` (content checked from history). |
Summary: 7 of 7 completed tasks verified, 0 questionable, 0 falsely marked complete.

**Test Coverage and Gaps:**
-   **Unit Tests:** Missing for `AuthProvider` logic.
-   **Integration Tests:** Missing to verify Supabase client usage of mock `user_id`.
-   **E2E Tests:** Missing to verify authentication UI bypass.
-   **Overall:** Tests are explicitly required by the story (and listed in each task's "Testing" section) but are not yet implemented.

**Architectural Alignment:**
-   The implementation aligns well with **ADR 016: Development Mode User Injection**.
-   Project structure and component responsibilities are consistent with `docs/architecture.md`.

**Security Notes:**
-   The development bypass mechanism is correctly gated by `NEXT_PUBLIC_DEV_MODE_ENABLED`, which is crucial for preventing accidental exposure in production. The importance of keeping this `false` in production should be highlighted.

**Best-Practices and References:**
-   Uses Next.js App Router for routing and `use client` for client components.
-   Leverages React Context API for state management (`useAuth`, `AuthContextProvider`).
-   Adheres to TypeScript for type safety.
-   ESLint warnings regarding `set-state-in-effect` were addressed.
-   Environmental variables used for configuration.

**Action Items:**

**Code Changes Required:**
-   [x] [High] Implement unit tests for `AuthProvider` logic, specifically for conditional user injection (Task 1. Testing).
-   [x] [High] Implement integration tests to verify that Supabase client calls use the injected mock `user_id` and that RLS policies allow access for this `user_id` (Task 1. Testing, Task 3. Testing).
-   [x] [High] Implement E2E tests to ensure that in development mode, the application behaves as if logged in with the mock user, and that actual login UI is suppressed (Task 2. Testing).
