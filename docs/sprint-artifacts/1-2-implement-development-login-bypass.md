## Story 1.2: Implement Development Login Bypass

**Status:** ready-for-dev

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
    -   [ ] Subtask 1.1: Create or modify `components/auth/AuthProvider.tsx` to conditionally inject a mock `user_id` based on an environment variable (`NEXT_PUBLIC_DEV_MODE_ENABLED`).
    -   [ ] Subtask 1.2: When `NEXT_PUBLIC_DEV_MODE_ENABLED=true`, set the `user_id` to "68be1abf-ecbe-47a7-bafb-46be273a2e" for Supabase client interactions.
    -   [ ] Subtask 1.3: Ensure `supabase.auth.getSession()` or similar client-side authentication checks reflect this mock session.
    -   **Testing:** Unit tests for `AuthProvider` logic. Integration tests to verify Supabase client uses the mock `user_id`.
-   **Task 2: Conditionally Render Authentication Components** (AC: #4)
    -   [ ] Subtask 2.1: Modify `app/(main)/layout.tsx` to wrap its content with `AuthProvider`.
    -   [ ] Subtask 2.2: Adjust `components/auth/Auth.tsx` and `components/auth/Logins.tsx` (or other relevant authentication UI components) to conditionally render based on `NEXT_PUBLIC_DEV_MODE_ENABLED` or the presence of a real authenticated session versus the mock session.
    -   **Testing:** E2E tests to verify authentication UI is bypassed in development mode.
-   **Task 3: Update `lib/supabase/client.ts` to use injected `user_id`** (AC: #3, #5)
    -   [ ] Subtask 3.1: Ensure that the Supabase client initialization or subsequent data access functions correctly utilize the `user_id` provided by the `AuthProvider` when in development mode.
    -   **Testing:** Integration tests for data operations using the mock `user_id`.
-   **Task 4: Environment Variable Setup** (AC: #1)
    -   [ ] Subtask 4.1: Document the `NEXT_PUBLIC_DEV_MODE_ENABLED` environment variable in `.env.local.example` and `README.md`.
    -   **Testing:** Manual verification of environment variable usage.

## Dev Notes

-   **Relevant architecture patterns and constraints:**
    -   **ADR 016: Development Mode User Injection:** This story directly implements the decision to inject a mock user for development purposes.
    -   **Supabase Interaction:** The core idea is to bypass Supabase's authentication *flow* but still interact with Supabase *tables* using a specific user ID.
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

## Change Log

| Date       | Version | Change Description | Author     |
| :--------- | :------ | :----------------- | :--------- |
| 2025-11-22 | 1.0     | Story Drafted      | hammaadworks |
