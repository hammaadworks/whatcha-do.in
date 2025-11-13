# Epic Technical Specification: User & Profile Management

Date: 2025-11-13
Author: hammaadworks
Epic ID: 1
Status: Draft

---

## Overview

This epic establishes the foundational identity and authentication layer for the 'whatcha-doin' application. It covers the entire user lifecycle from account creation via passwordless Magic Link to session management and the establishment of a basic public presence. The primary goal is to create a secure, simple, and effective way for users to join the platform and begin personalizing their experience.

## Objectives and Scope

**In Scope:**
- User account creation using Supabase Auth's Magic Link feature.
- Secure user login and logout.
- A simple, editable text bio within the user's profile.
- A shareable, public-facing profile page that displays the user's bio and is ready to host future public content (habits, todos, journal entries).
- The database schema for the `users` table, including columns for profile information like `bio` and `timezone`.

**Out of Scope:**
- Any form of social or third-party login (e.g., Google, GitHub).
- Password-based authentication.
- Advanced profile customization (e.g., avatars, themes, banners).
- Displaying any data on the public profile beyond the bio (this will be handled in subsequent epics).

## System Architecture Alignment

This epic directly implements the User Management and Authentication components of the architecture defined in `docs/architecture.md`. It will leverage **Supabase Auth** for the Magic Link functionality and **Supabase PostgreSQL** for storing user profile data in the `users` table. All security and data access will be governed by the **Row Level Security (RLS)** policies and **JWT-based authentication** outlined in the architecture. The public profile page will be a **Server-Side Rendered (SSR)** or **Static Site Generated (SSG)** Next.js page to ensure fast load times, adhering to NFR-1.1.

## Detailed Design

### Services and Modules

| Service/Module | Responsibility | Inputs/Outputs | Owner |
| :--- | :--- | :--- | :--- |
| **Supabase Auth** | Handles user sign-up, login (Magic Link), logout, and session management. | Input: User email. Output: JWT session token. | Supabase |
| **User Profile Service** (`lib/supabase/user.ts`) | Provides an abstraction layer for interacting with the `users` table. | Functions to get/update user profile data (e.g., `getUserProfile`, `updateUserBio`). | Dev Team |
| **Auth UI Component** (`components/auth/Login.tsx`) | Renders the UI for email input and handles the call to Supabase Auth for sending the Magic Link. | Input: User email. Output: Triggers auth flow. | Dev Team |
| **Public Profile Page** (`app/(main)/profile/[userId]/page.tsx`) | Fetches and displays a user's public profile information. | Input: `userId` from URL. Output: Rendered public profile. | Dev Team |

### Data Models and Contracts

The `users` table will be the primary data model for this epic. It will be created via a Supabase migration.

**`users` table schema:**
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  timezone VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```
[Source: `docs/architecture.md#Data-Architecture`]

### APIs and Interfaces

This epic will primarily use the auto-generated PostgREST API from Supabase. No custom API routes are required.

**Key Supabase Client Interactions:**
- `supabase.auth.signInWithOtp({ email })`: To initiate the Magic Link login.
- `supabase.auth.signOut()`: To log the user out.
- `supabase.from('users').select('*').eq('id', userId).single()`: To fetch a user's profile.
- `supabase.from('users').update({ bio: newBio }).eq('id', userId)`: To update a user's bio.

### Workflows and Sequencing

**1. User Sign-up / Login Flow:**
1.  User enters their email into the `Auth UI Component`.
2.  The component calls `supabase.auth.signInWithOtp()` with the user's email.
3.  Supabase sends a Magic Link to the user's email address.
4.  User clicks the link in their email.
5.  The application receives the session token, and the user is authenticated.
6.  A trigger on the `auth.users` table will create a corresponding entry in the `public.users` table.

**2. Profile Edit Flow:**
1.  Authenticated user navigates to their profile editing page.
2.  User modifies their bio in a form.
3.  On submit, the frontend calls the `updateUserBio` function in the `User Profile Service`.
4.  The service calls `supabase.from('users').update(...)` to persist the change.
5.  The UI is updated to reflect the new bio.

## Non-Functional Requirements

### Performance

- **NFR-1.1:** Public profile pages must achieve a fast load time. To meet this, these pages will be rendered using Next.js SSR or SSG, leveraging Vercel's CDN.
[Source: `docs/PRD.md#NFR-1.1`]

### Security

- **NFR-2.1:** The Magic Link authentication tokens must be single-use and expire within a short timeframe (Supabase default is 1 hour, which is acceptable for MVP).
- **NFR-2.2:** A strict separation between public and private data must be enforced. This will be achieved via PostgreSQL Row Level Security (RLS) policies on the `users` table.
[Source: `docs/PRD.md#NFR-2.1`, `docs/PRD.md#NFR-2.2`]

### Reliability/Availability

- The authentication and user profile services are dependent on Supabase's uptime. As a managed service, Supabase provides high availability, which is sufficient for the MVP. No custom reliability measures are required for this epic.

### Observability

- Authentication-related errors (e.g., failed Magic Link delivery) will be logged in Supabase's internal logs.
- Client-side errors during login or profile updates will be captured by Sentry.
- Critical failures in the authentication flow will trigger an alert to the Lark chat webhook as defined in the architecture.
[Source: `docs/architecture.md#Error-Handling`]

## Dependencies and Integrations

**External Dependencies:**
- **Supabase:** This epic is heavily dependent on the Supabase platform for authentication and database services.
- **Vercel:** The application will be deployed on Vercel.

**Internal Dependencies:**
- This epic has no dependencies on other epics. It is a foundational epic.

**NPM Packages:**
- The `package.json` file has not yet been created. The following key packages will be installed during project initialization:
  - `@supabase/supabase-js`: The official Supabase client library.
  - `next`: The Next.js framework.
  - `react`: The React library.
  - `tailwindcss`: For styling.
  - `shadcn/ui`: For UI components.
  - `zod`: For validation.
[Source: `docs/architecture.md#Project-Initialization`]

## Acceptance Criteria (Authoritative)

1.  **AC-1.1:** A user can enter their email address and receive a Magic Link to that address. (FR-1.1)
2.  **AC-1.2:** Clicking the Magic Link authenticates the user and redirects them to the main application. (FR-1.1)
3.  **AC-1.3:** A logged-in user can successfully log out, terminating their session. (FR-1.2)
4.  **AC-1.4:** An authenticated user can view and edit a simple text bio on their profile page. (FR-1.3)
5.  **AC-1.5:** A public profile page exists at a shareable URL (e.g., `/profile/[userId]`). (FR-1.4)
6.  **AC-1.6:** The public profile page correctly displays the user's bio. (FR-1.5)
7.  **AC-1.7:** The `users` table is created in the database with the correct schema, and RLS is enabled. (Data Models)
8.  **AC-1.8:** A new user signing up for the first time results in a new entry in both `auth.users` and `public.users`. (Workflows)

## Traceability Mapping

| Acceptance Criterion | PRD Requirement(s) | Spec Section(s) | Component(s) / API(s) | Test Idea |
| :--- | :--- | :--- | :--- | :--- |
| **AC-1.1** | FR-1.1 | Workflows, APIs | `Auth UI Component`, `supabase.auth.signInWithOtp` | E2E: Enter email, check for email delivery. |
| **AC-1.2** | FR-1.1 | Workflows | Supabase Auth Redirect | E2E: Click Magic Link, verify user is logged in. |
| **AC-1.3** | FR-1.2 | APIs | `supabase.auth.signOut` | E2E: Click logout, verify user is logged out. |
| **AC-1.4** | FR-1.3 | Data Models, APIs | `User Profile Service`, `supabase.from('users').update` | Integration: Update bio, verify change in DB. |
| **AC-1.5** | FR-1.4 | System Arch. | `Public Profile Page` | E2E: Navigate to profile URL, verify page loads. |
| **AC-1.6** | FR-1.5 | Data Models | `Public Profile Page` | E2E: View public profile, verify bio is displayed. |
| **AC-1.7** | N/A | Data Models | Supabase Migration | Integration: Run migration, inspect DB schema. |
| **AC-1.8** | FR-1.1 | Workflows | Supabase Auth Trigger | Integration: Sign up new user, check for entry in `public.users`. |

## Risks, Assumptions, Open Questions

- **Risk:** Email deliverability for Magic Links could be an issue (e.g., emails going to spam).
  - **Mitigation:** For MVP, we will rely on Supabase's default email provider. If issues arise, we will configure a custom SMTP provider with better deliverability.
- **Assumption:** The default Supabase trigger for creating a public user profile from an auth user is sufficient and does not require custom logic.
  - **Mitigation:** This will be verified during implementation. If custom logic is needed (e.g., to populate default values), a custom Supabase Database Function will be created.
- **Question:** What should be the default `timezone` for a new user?
  - **Answer:** For now, it can be null. The client-side application will be responsible for detecting and prompting the user to set their timezone.

## Test Strategy Summary

The testing strategy for this epic will follow the lean MVP approach defined in the architecture.
- **Unit Tests (Vitest):**
  - Test any utility functions in `lib/supabase/user.ts`.
  - Test the `Auth UI Component` in isolation to ensure it renders correctly and calls the auth function on submit.
- **Integration Tests (Vitest):**
  - Test the full sign-up flow by calling the Supabase client, mocking the email delivery, and verifying that a user is created in the database.
  - Test the RLS policies on the `users` table to ensure users can only access their own data.
- **E2E Tests (Playwright):**
  - A single 'golden path' test will cover the full user journey: sign up, log in, edit bio, and log out.
[Source: `docs/architecture.md#Testing-Strategy`]

## Post-Review Follow-ups

- Note: Consider enhancing E2E tests to cover the full magic link flow (email receipt, click, redirect) if a test email service or advanced mocking becomes available. This would provide more comprehensive coverage for AC 4 and AC 5. (Story 1.1)
- Note: Ensure `tests/e2e/auth.spec.ts` is correctly configured to run within the Playwright setup, as it was failing due to server startup issues. This might involve ensuring `npm run build` completes before `npm run e2e` is executed, or configuring Playwright's `webServer` to wait for the server to be ready. (Story 1.1)
