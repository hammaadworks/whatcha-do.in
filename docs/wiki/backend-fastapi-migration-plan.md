# Backend Migration Plan: Next.js to FastAPI (Python)

This document outlines the assessment, effort, and detailed plan for migrating the backend logic of the current Next.js application to a new Python FastAPI service, with the goal of converting the Next.js application into a purely client-side frontend.

## 1. Executive Summary

The current Next.js application leverages advanced server-side features including Next.js Server Actions, API Routes, and extensive server-side data fetching within Server Components (RSCs). A significant portion of the application's business logic, authentication mechanisms, and database interactions (via Supabase) resides on the Next.js server.

Migrating this logic to a separate Python FastAPI backend is a **major undertaking**. It involves translating substantial TypeScript/JavaScript server-side code to Python, re-architecting the data access layer, reimplementing authentication, and refactoring the Next.js frontend to consume the new FastAPI APIs.

## 2. Current Backend Components Identified

The following areas currently house backend logic within the Next.js project:

*   **Server Actions (`lib/actions/`):**
    *   `auth-qr.ts`: Contains complex QR code-based magic link authentication flow, utilizing Supabase admin privileges and Realtime features.
    *   `theme.ts`: Handles social unlock and theme purchase logic, interacting with Supabase and sending notifications via Lark.
    *   Other potential server actions not explicitly reviewed but indicated by directory structure.
*   **API Routes (`app/api/`):**
    *   `feedback/route.ts`: A traditional Next.js API endpoint for feedback submission.
*   **Database/Supabase Interaction (`lib/supabase/*.server.ts`):**
    *   `user.server.ts`, `actions.server.ts`, `habit.server.ts`, `journal.server.ts`, `identities.server.ts`, `targets.server.ts`: These files contain the core server-side data fetching and manipulation functions, heavily used by Server Components.
    *   `admin.ts`: Utilizes the Supabase admin client, likely for privileged database operations.
    *   `server.ts`: Provides the base for creating server-side Supabase client instances.
*   **Business Logic (`lib/logic/`):**
    *   `JournalActivityService.ts`, `targetLifecycle.ts`, `actions/lifecycle.ts`, `habits/habitLifecycle.ts`: These modules encapsulate critical domain-specific business rules and algorithms.
*   **Authentication Hooks/Providers (`hooks/useAuth.tsx`, `components/auth/AuthProvider`):**
    *   While `useAuth.tsx` is client-side, its underlying `AuthProvider` and related Supabase client-side logic manage user sessions and will need to integrate with the new FastAPI authentication system.
*   **External Integrations (`lib/lark.ts`):**
    *   Contains utility functions for interacting with the Lark messaging platform, used for notifications (e.g., social unlock, theme purchase).
*   **Server-Side Rendering (SSR) in Page Components:**
    *   `app/[username]/page.tsx` (ProfilePage): This Server Component performs extensive data fetching on the server using the `lib/supabase/*.server.ts` functions and passes this data as props to client components. This approach will need to be refactored.
*   **Middleware:** No `middleware.ts` was found, which simplifies migration by removing edge middleware logic.

## 3. Overall Effort Assessment

This migration is a **very significant undertaking**, requiring substantial development effort. The application's heavy reliance on Next.js server-side capabilities means that the migration is not merely about exposing existing functions via new API endpoints, but rather a fundamental re-architecture of how data is accessed, business logic is executed, and authentication is handled.

*   **High Effort Areas:**
    *   Translating and re-implementing the comprehensive data access layer (`lib/supabase/*.server.ts`) to Python, likely involving a Python Supabase client or an ORM.
    *   Re-implementing the complex QR code authentication flow from `lib/actions/auth-qr.ts` in FastAPI.
    *   Porting all core business logic from `lib/logic/` to Python.
    *   Designing and implementing a robust, secure authentication system in FastAPI.
    *   Refactoring existing Next.js Server Components that currently perform data fetching to become client components that fetch data from the new FastAPI backend.
*   **Medium Effort Areas:**
    *   Migrating the theme-related server actions (`lib/actions/theme.ts`) to FastAPI endpoints.
    *   Updating the client-side `AuthProvider` to correctly manage authentication state with the new FastAPI auth.
*   **Low Effort Areas:**
    *   Porting the simple API route (`app/api/feedback/route.ts`) to a FastAPI endpoint.
    *   Translating the `lib/lark.ts` utility to Python.

**Estimated Timeframe:** This migration could take several weeks to a few months for a dedicated developer, depending on the intricacies of the existing business logic and the test coverage required.

## 4. Detailed Migration Plan (Tasks)

The migration process should be broken down into the following logical steps:

1.  **FastAPI Project Setup:**
    *   Initialize a new Python FastAPI project.
    *   Configure environment variables (e.g., `.env`).
    *   Install necessary Python libraries (`uvicorn`, `fastapi`, `supabase-py` or appropriate ORM/DB drivers).

2.  **Database Layer Migration:**
    *   **Schema Understanding:** Thoroughly understand the existing Supabase schema and `lib/supabase/types.ts`.
    *   **Data Access Layer (DAL) Implementation:** Develop a Python-based DAL within FastAPI to interact with the Supabase PostgreSQL database. This could use `supabase-py`, a standard ORM (e.g., SQLAlchemy), or raw SQL.
    *   **Port Server-Side Functions:** Re-implement all `lib/supabase/*.server.ts` functions (e.g., `getUserByUsernameServer`, `fetchPublicActionsServer`, `fetchPublicHabitsServer`, etc.) as Python functions within FastAPI.
    *   **Supabase Admin Client:** Securely migrate operations relying on `lib/supabase/admin.ts` to use a Supabase service role key within FastAPI, ensuring proper access control.

3.  **Authentication System Migration:**
    *   **FastAPI Auth Design:** Design and implement an authentication system within FastAPI (e.g., using JWT tokens).
    *   **QR Magic Link Flow:** Replicate the complex QR code-based magic link authentication flow from `lib/actions/auth-qr.ts` in FastAPI. This involves generating links, handling Supabase Realtime equivalents (if still needed), and verifying sessions.
    *   **User Management:** Decide if user management remains in Supabase Auth or is fully migrated to FastAPI. Integrate FastAPI's auth with Supabase if applicable.
    *   **Auth Endpoints:** Create FastAPI endpoints for user registration, login, token refreshing, and session management.

4.  **Business Logic Migration:**
    *   **Translation:** Carefully translate and re-implement all core business logic from `lib/logic/` (e.g., `JournalActivityService`, `targetLifecycle`, `actions/lifecycle.ts`, `habits/habitLifecycle.ts`) into Python services or modules within the FastAPI application.

5.  **API Endpoint Creation:**
    *   **Server Actions:** Create FastAPI endpoints for all Next.js Server Actions, including:
        *   `/api/v1/auth/qr/...` (for magic link generation, session authorization)
        *   `/api/v1/theme/verify-social-unlock`
        *   `/api/v1/theme/purchase`
        *   Other server actions as they are identified.
    *   **Existing API Routes:** Create a FastAPI endpoint for `/api/v1/feedback` (migrating `app/api/feedback/route.ts`).
    *   **Data Endpoints:** Create FastAPI endpoints for all data fetching needs currently handled by `lib/supabase/*.server.ts` functions (e.g., `/api/v1/users/{username}`, `/api/v1/habits`, `/api/v1/journal`).

6.  **External Integrations:**
    *   **Lark Utility:** Port the `lib/lark.ts` utility functionality to a Python module within FastAPI.
    *   Ensure `LARK_WEBHOOK_URL` and any other external API keys are securely configured in the FastAPI environment.

7.  **Next.js Frontend Refactoring (Client-Side Conversion):**
    *   **Server Component Conversion:** Modify server components (e.g., `app/[username]/page.tsx`) to become client components (using `"use client"`) or purely static pages that fetch dynamic data.
    *   **API Consumption:** Update all client components and pages to fetch data from the new FastAPI backend endpoints using standard `fetch` API calls or a client-side library (e.g., `axios`, `swr`, `react-query`).
    *   **Auth Provider Integration:** Refactor the `AuthProvider` (`components/auth/AuthProvider`) to manage client-side authentication state and interact with the FastAPI authentication endpoints.
    *   **Remove Server-Side Dependencies:** Eliminate all direct imports and usage of `lib/supabase/*.server.ts` and `lib/actions/*.ts` from the Next.js frontend codebase.

8.  **Testing:**
    *   **FastAPI Backend Tests:** Implement comprehensive unit, integration, and API tests for the new FastAPI service.
    *   **Frontend Tests:** Update existing Next.js frontend tests and create new ones to validate interactions with the new FastAPI APIs.

9.  **Deployment:**
    *   **FastAPI Deployment Strategy:** Plan and implement the deployment strategy for the FastAPI service (e.g., on a cloud platform, containerized with Docker, serverless functions).
    *   **Next.js Static Export:** If the goal is a purely static frontend, configure Next.js to output static HTML/CSS/JS (`output: 'export'` in `next.config.js`) and plan its deployment (e.g., on GitHub Pages, Vercel Static, S3).

## 5. Next Steps

This detailed plan provides a roadmap for the migration. The next logical step is to begin with the FastAPI project setup, followed by incrementally migrating components of the data access layer and authentication.
