# Architecture

## Executive Summary

**NOTE:** For development purposes, Supabase authentication is temporarily bypassed. The application is configured to directly interact with Supabase tables using a hardcoded test user's `user_id` for all feature development. This is achieved by injecting the `user_id` via the `AuthProvider` component in `app/(main)/layout.tsx` when `NEXT_PUBLIC_DEV_MODE_ENABLED=true`. Full Supabase authentication will be integrated in the final epic. To re-enable Magic Link functionality for testing the final epic, set `NEXT_PUBLIC_DEV_MODE_ENABLED=false` in `.env.local` (or remove it) and set `enable_signup = true` in `supabase/config.toml` under both `[auth]` and `[auth.email]` sections.

This document outlines the architectural decisions for 'whatcha-doin', a Next.js application leveraging Supabase for its backend services (PostgreSQL, Authentication, Realtime, Storage, and PostgREST API) and deployed on Vercel with GitHub Actions for CI/CD. The architecture prioritizes frugality, scalability, and a robust user experience, implementing novel UX patterns through a hybrid client-side/Supabase Database Function approach for critical logic like the Grace Period and "Two-Day Rule" enforcement. Key cross-cutting concerns such as error handling, logging, date/time management, API response formats, and a lean testing strategy have been defined to ensure consistency and maintainability.
## Project Structure

The project will adopt a Next.js App Router-based structure, designed for clear separation of concerns, maintainability, and efficient development. This structure accommodates our chosen technologies and facilitates collaboration.

```
whatcha-doin/
├── .github/                     # GitHub Actions workflows for CI/CD
├── app/                         # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/                  # Authentication related routes/components (logins, signup)
│   ├── api/                     # Next.js API Routes (if any custom serverless functions are needed beyond Supabase)
│   ├── [username]/              # Dynamic route for user profiles and private dashboard
│   │   ├── habits/              # Private habits page
│   │   ├── journal/             # Private journal page
│   │   ├── actions/             # Private todos/actions page
│   │   ├── grace-period/        # Private grace period page
│   │   ├── page.tsx             # Renders public profile or private dashboard based on auth
│   │   └── layout.tsx           # Layout for all user-specific routes
│   └── layout.tsx               # Root layout
├── components/                  # Reusable React components (UI, shared)
│   ├── ui/                      # shadcn/ui components (customized)
│   ├── common/                  # General purpose components
│   └── habits/                  # Habit-specific components (e.g., HabitCard)
├── lib/                         # Utility functions, helpers, Supabase client initialization
│   ├── supabase/                # Supabase client setup, database types
│   ├── utils.ts                 # General utilities
│   └── date.ts                  # Date/time utilities (e.g., timezone handling)
├── hooks/                       # Custom React hooks
├── styles/                      # Tailwind CSS configuration, global styles
├── public/                      # Static assets
├── types/                       # Global TypeScript types/interfaces
├── tests/                       # Test files (unit, integration, E2E)
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── supabase/                    # Supabase specific configurations, migrations, database functions
│   ├── migrations/              # Database schema migrations
│   ├── functions/               # Supabase Database Functions (PostgreSQL functions)
│   └── seed.sql                 # Seed data
├── .env.local                   # Environment variables
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── package.json                 # Project dependencies and scripts
├── README.md
└── docs/                        # Project documentation (PRD, UX Spec, Architecture)
    ├── PRD.md
    ├── ux-design-specification.md
    └── architecture.md
```

**Key Architectural Boundaries:**
*   **Frontend (Next.js `app/`):** Handles all UI rendering, client-side logic, and interaction. The `app/[username]` directory contains all user-specific views, both public and private.
*   **Shared Logic (`lib/`, `hooks/`, `components/`):** Reusable code that can be used across the frontend.
*   **Backend (Supabase `supabase/`):** The primary backend, handling data persistence, authentication, real-time, and server-side business logic via PostgreSQL functions.
*   **CI/CD (`.github/`):** Automated testing and deployment.

## Project Initialization

The project will be initialized using the `npx create-next-app@latest` command, which provides a robust and modern foundation for our Next.js application.

**Initialization Command:**
```bash
npx create-next-app@latest whatcha-doin --typescript --tailwind --eslint --app
```

**Starter-Provided Architectural Decisions:**
This starter template provides the following foundational architectural decisions:
*   **Language:** TypeScript
*   **Styling Solution:** Tailwind CSS
*   **Linting/Formatting:** ESLint
*   **Routing:** Next.js App Router
*   **Build Tooling:** Next.js (utilizing its integrated Webpack/Turbopack)
*   **Initial Project Structure:** Adheres to Next.js App Router conventions.

This approach accelerates development by leveraging established best practices and a well-maintained ecosystem. The first implementation story will involve executing this command to set up the project.

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Data Persistence | Supabase (PostgreSQL) | 2.80.0 | All data-related epics (Habits, Todos, Journal, User Management) | Managed PostgreSQL, built-in Auth (Magic Link), Real-time, File Storage, scalability, rapid development, aligns with free-tier MVP. |
| Authentication | Supabase Auth (Magic Link) | 2.80.0 | Security and User Management epics | Built-in with Supabase, supports Magic Link as required, simplifies auth implementation. |
| Real-time | Supabase Realtime | 2.80.0 | Real-time synchronization of user data | Built-in with Supabase, provides efficient live updates for habits/todos. |
| Email Service | Rely on Supabase Auth's built-in email | N/A | User Management (authentication) | Frugality, simplicity, Supabase Auth handles core requirement for MVP; defer dedicated service for future needs. |
| Deployment Target | Vercel | N/A | All epics | Optimized for Next.js, generous free tier for MVP, seamless integration with GitHub for CI/CD (GitHub Actions). |
| Search Solution | Deferred | N/A | Journal | PRD updated to remove search requirement (FR-5.8); journal navigation is via date picker only for MVP. |
| Background Jobs | Hybrid: Client-side trigger + Supabase Database Functions (PostgreSQL) | N/A | Habit Management, Grace Period | Client-side (Next.js) triggers Grace Period on app open/logins for local timezone. Supabase Database Functions (PostgreSQL) enforce "Two-Day Rule" and validate state changes server-side, handling multi-day absences and ensuring data integrity. Grace screen appears once per day, and this is the most frugal/cleanest solution for MVP. |
| Error Handling Strategy | User-facing: Inline/Toast/Error Page; Internal: Sentry (frontend), Supabase logs (backend), Lark webhook (critical alerts) | N/A | All epics | Aligns with UX principles, ensures proactive monitoring, and leverages cost-effective solutions. |
| Logging Approach | Structured logging with standard levels; Supabase logs (backend), Sentry (frontend), Lark webhook (critical alerts) | N/A | All epics | Ensures maintainability, debuggability, and centralized visibility of application health. |
| Date/Time Handling | Store UTC in DB, transmit ISO 8601 UTC strings, client converts for local display/input, server-side calculations use UTC with user's stored timezone. | N/A | All epics | Ensures data integrity, avoids timezone bugs, provides correct local user experience, and maintains server as source of truth. |
| API Response Format | Standard JSON with `data` for success, `error` for failures (message, code, details), optional `metadata`/`pagination`. | N/A | All epics | Ensures predictable client-side parsing, simplifies error handling, and provides a clear contract for custom API endpoints. |
| Testing Strategy | Lean MVP strategy: Unit (Vitest + React Testing Library), Integration (Vitest), E2E (Playwright). All integrated with GitHub Actions. | N/A | All epics | Provides strong safety net for core features, ensures data integrity, validates UX without overkill, and aligns with pragmatic MVP development. |
| Naming Conventions | Database tables: `snake_case_plural`; Columns: `snake_case`; Frontend components: `PascalCase` (files/names), `kebab-case` (folders); TS variables/functions: `camelCase`, types/interfaces: `PascalCase`. | N/A | All epics | Ensures consistency, readability, and aligns with industry best practices for the chosen stack. |
| Code Organization | Hybrid: Feature-based for `app/` routes, type-based for generic shared components, feature-based for specific components. Colocation of related files. Centralized data access. Tailwind CSS for styling. | N/A | All epics | Most accepted industry-wide solution for Next.js, promotes clarity, maintainability, and scalability. |
| Data Modeling (Habits & Completions) | Extend `habits` table with `current_goal_value`, `goal_unit`, `goal_type`, `last_recorded_intensity`. Create new `habit_completions` table for each completion instance (including `intensity_score`, `actual_value_achieved`, `goal_at_completion`). | N/A | Habit & Todo Management, Journaling & Daily Interaction | Supports new PRD requirements (FR-2.6, FR-2.7, FR-2.8, FR-5.1.1, FR-5.1.2) for quantitative goals, intensity tracking, and habit granularity. Ensures data integrity for streak continuity and historical analysis. |

## Consistency Rules

### Naming Conventions

*   **Database Table Naming:** `snake_case_plural` (e.g., `users`, `habits`, `journal_entries`). This aligns with PostgreSQL and Supabase conventions.
*   **Database Column Naming:** `snake_case` (e.g., `user_id`, `created_at`, `habit_name`). Consistent with table naming.
*   **Frontend Component Naming (React/Next.js):** `PascalCase` for component files and names (e.g., `HabitCard.tsx`, `UserAvatar.tsx`).
*   **Frontend Component Folder Naming:** `kebab-case` for directories containing components (e.g., `habit-card/`).
*   **Frontend Variable/Function Naming (TypeScript):** `camelCase` for variables and functions (e.g., `userName`, `getHabits`).
*   **Frontend Type/Interface Naming (TypeScript):** `PascalCase` for types and interfaces.
*   **Username Naming:** `kebab-case` for user-chosen usernames. Must consist only of alphanumeric characters (a-z, A-Z, 0-9), hyphens (-), and underscores (_).

### Code Organization

*   **Feature-Based Organization for Routes (`app/`):** The `app/` directory will be structured primarily by feature (e.g., `app/habits`, `app/journal`), leveraging Next.js App Router's conventions.
*   **Hybrid Organization for Shared Elements:**
    *   `components/ui/`: For `shadcn/ui` components.
    *   `components/common/`: For general-purpose, reusable components.
    *   `components/features/[feature-name]/`: For components specific to a feature but reusable within it.
*   **Colocation of Related Files:** Tightly coupled files (component, types, tests) will be kept together.
*   **Centralized Data Access Layer:** Supabase client initialization and data fetching logic will be centralized within `lib/supabase/` or `lib/data/`.
*   **Styling:** Primarily use Tailwind CSS utility classes. Custom CSS/global styles in `styles/`.

### Error Handling

*   **User-Facing Errors:**
    *   **Inline Validation:** For form inputs, consistent with `shadcn/ui` patterns.
    *   **Toast Notifications:** For non-critical success/failure feedback, aligning with the 'Professional, tech-savvy, out-of-the-box wow design' aesthetic.
    *   For critical, unrecoverable errors, a clear, user-friendly **error page** with guidance, designed to be empathetic and minimize user frustration.
*   **Internal Error Reporting:**
    *   **Frontend (Next.js):** Sentry (free tier) for capturing unhandled exceptions and providing detailed stack traces.
    *   **Supabase Functions (PostgreSQL):** Errors logged to Supabase's internal logs.
    *   **Centralized Alerts:** All significant errors from both frontend and Supabase functions will be forwarded to the provided Lark chat webhook for real-time notification.

### Logging Strategy

*   **Structured Logging:** Implement a consistent, structured logging mechanism across the application.
*   **Log Levels:** Utilize standard log levels (DEBUG, INFO, WARN, ERROR, FATAL) to control verbosity.
*   **Frontend:** Use a structured logging approach (e.g., `console.log` with structured objects for MVP, or a library like `pino` if needed) to include relevant context (user ID, session ID, component name).
*   **Supabase Functions (PostgreSQL):** Leverage PostgreSQL's `RAISE NOTICE` or `RAISE WARNING` for structured logging within functions, appearing in Supabase logs.
*   **Alerting:** Critical errors will trigger alerts via the Lark chat webhook.

### Date/Time Handling

*   **Storage (Supabase PostgreSQL):** All dates and times will be stored in **UTC (Coordinated Universal Time)** using PostgreSQL's `TIMESTAMP WITH TIME ZONE` type.
*   **Transmission (API/Functions):** Dates and times will always be transmitted as **ISO 8601 strings** (e.g., `2025-11-12T10:30:00Z`).
*   **Client-Side (Next.js Frontend):** The frontend will detect the user's local timezone, convert UTC times from the database to the user's local timezone for display, and convert user input back to UTC ISO 8601 strings for transmission.
*   **Calculations (Supabase Functions/PostgreSQL):** All core logic and calculations will be performed server-side using **UTC timestamps**, considering the user's stored timezone offset (user's preferred timezone will be stored in their profile).

### Testing Strategy

*   **Unit Tests:**
    *   **Focus:** Critical business logic, utility functions, isolated React components.
    *   **Frameworks:** Vitest (for speed) with React Testing Library (for components).
    *   **Coverage:** Prioritize high coverage for core logic.
*   **Integration Tests:**
    *   **Focus:** Key interactions between Next.js frontend and Supabase (e.g., user logins, habit creation, grace period flow).
    *   **Frameworks:** Vitest, direct testing of Supabase Database Functions.
    *   **Coverage:** Focus on important data flows.
*   **End-to-End (E2E) Tests:**
    *   **Focus:** Critical user journeys (e.g., signup, habit creation, streak update).
    *   **Framework:** Playwright.
    *   **Coverage:** Small, curated set of 'golden path' tests.
*   **CI/CD Integration:** All tests will be integrated into GitHub Actions pipeline.

## Novel Architectural Patterns

For the MVP, entirely novel architectural patterns are not required. The unique UX patterns identified (e.g., 'Positive Urgency' UI, 'Teleport-to-Journal' animation, and the nuanced Grace Period handling) will be implemented using established architectural building blocks, primarily client-side logic within Next.js and server-side logic via Supabase Database Functions. This approach leverages existing, proven patterns to achieve novel user experiences, aligning with our pragmatic and frugal development philosophy.

## Data Architecture

The data architecture will be built upon **Supabase PostgreSQL**, leveraging its relational capabilities to ensure data integrity and support complex queries. Data models will be designed to reflect the core entities of the application: users, habits, todos, and journal entries.

*   **Users:** Will store user authentication details (managed by Supabase Auth) and profile information (e.g., `user_id`, `email`, `bio`, `timezone`, `grace_screen_shown_for_date`, `username`).
*   **Habits:** Will store recurring habit details (e.g., `habit_id`, `user_id`, `name`, `is_public`, `current_streak`, `last_streak`, `created_at`, `goal_value`, `goal_unit`, `last_recorded_mood`, `last_recorded_work_value`, `last_recorded_work_unit`, `pile_state`, `junked_at`).
*   **Habit Completions (NEW Table):** A new table `habit_completions` will store each instance of a habit being completed.
    *   `completion_id`: Unique identifier.
    *   `habit_id`: Foreign key to `habits`.
    *   `user_id`: Foreign key to `users`.
    *   `completed_at`: Timestamp of completion.
    *   `mood_score`: Value from the mood selector (FR-5.1.1).
    *   `work_value`: Quantitative value achieved (FR-5.1.2).
    *   `goal_at_completion`: The `goal_value` active when the habit was completed.
    *   `duration_value`: Duration value recorded (FR-5.1.5).
    *   `duration_unit`: Duration unit recorded (FR-5.1.5).
    *   `notes`: Free-form text notes for this completion (FR-5.1.5).
*   **Todos:** Will store one-off task details (e.g., `todo_id`, `user_id`, `parent_todo_id` for sub-todos, `description`, `is_public`, `is_completed`, `created_at`).
*   **Journal Entries:** Will store daily reflections and aggregated notes from completed items (e.g., `entry_id`, `user_id`, `entry_date`, `content`, `is_public`, `created_at`).
*   **Relationships:** Foreign keys will establish relationships between users and their habits, todos, and journal entries. Sub-todos will have a self-referencing relationship.

**Calculated Fields:** `weekly_average_intensity` and `monthly_average_intensity` will be derived from the `habit_completions` table, calculated on-demand via Supabase Database Functions or client-side for MVP.

**Row Level Security (RLS)** will be extensively used to enforce strict separation of user data and public/private content directly at the database level, preventing unauthorized access.

**Supabase Database Functions (PostgreSQL functions)** will encapsulate critical business logic, such as the enforcement of the "Two-Day Rule", the processing of grace period actions, and the calculation of streak continuity on goal changes, ensuring server-side validation and data integrity.

## API Contracts

The primary API will be provided by Supabase's auto-generated PostgREST API. For any custom logic, **Supabase Database Functions (PostgreSQL functions)** will be used and invoked from the client via `supabase.rpc()`. Per project constraints, **Supabase Edge Functions are to be avoided**. For any custom Database Functions that return data to the client, a consistent JSON response format will be adhered to:

*   **Standard JSON Structure:** All responses will be JSON.
*   **Data Payload:** For successful responses, the primary data will be nested under a `data` key.
*   **Error Payload:** For error responses, a consistent `error` object will be returned, containing:
    *   `message`: A user-friendly error message.
    *   `code`: An internal error code (optional, but useful for debugging).
    *   `details`: More specific technical details (optional, for internal use, not always exposed to users).
*   **Pagination/Metadata:** For list endpoints, `metadata` or `pagination` objects (e.g., `count`, `next_page_token`) can be included at the top level alongside `data`.

**Example Success Response:**
```json
{
  "data": {
    "id": "habit-123",
    "name": "Drink Water",
    "streak": 5
  },
  "metadata": {}
}
```

**Example Error Response:**
```json
{
  "error": {
    "message": "Habit not found.",
    "code": "HABIT_NOT_FOUND",
    "details": "No habit found with ID 'habit-123' for user 'user-abc'."
  }
}
```

## Security Architecture

The security architecture for 'whatcha-doin' will be built upon the robust features provided by Supabase, ensuring data protection and user privacy.

*   **Authentication:** Supabase Auth will handle user authentication, specifically implementing **Magic Link logins** (FR-1.1, FR-6.3). This includes configuring tokens to be single-use and to expire within a short timeframe (NFR-2.1).
*   **Authorization (Row Level Security - RLS):** Strict separation between public and private data will be enforced using **PostgreSQL Row Level Security (RLS)** (NFR-2.2). RLS policies will be defined to ensure:
    *   Users can only access and modify their own private data.
    *   Public data is accessible to all, but only modifiable by the owner.
    *   Unauthorized access to private information is prevented at the database level.
    *   **Development Note on RLS:** During development with Supabase authentication bypassed (ADR 016), RLS policies relying on `auth.uid()` or `auth.role()` will need to be temporarily adjusted or temporarily set to permissive mode for the hardcoded `user_id` to allow direct table interactions. A dedicated development policy using `check_dev_mode_enabled()` function is recommended.
*   **Data Encryption:** Supabase PostgreSQL inherently provides encryption at rest for data stored in the database. Data in transit will be secured using **TLS/SSL** for all communication between the client, Vercel, and Supabase.
*   **API Security:** Supabase's PostgREST API is secured by JWTs issued by Supabase Auth. All requests will require valid authentication tokens.
*   **Server-Side Validation:** Critical business logic, such as the "Two-Day Rule" and grace period processing, will be executed within **Supabase Database Functions**. This server-side execution prevents client-side manipulation and ensures the integrity of core application rules.
*   **Reserved Slugs Enforcement:** A mechanism will be implemented to prevent users from registering `usernames` that conflict with system routes (e.g., `auth`, `dashboard`, `journal`, `grace-period`, `api`, `profile`). This ensures the integrity of core application navigation.
*   **Environment Variables:** Sensitive information (e.g., Supabase API keys) will be stored securely using **Vercel Environment Variables** and accessed only on the server-side where necessary. Client-side environment variables will be public.

## Performance Considerations

Performance is a key Non-Functional Requirement (NFR-1) for 'whatcha-doin', particularly for public profile page load times and real-time data synchronization. Our architectural choices inherently support strong performance:

*   **Next.js Optimizations:**
    *   **SSR/SSG for Public Profiles (NFR-1.1):** Next.js allows for Server-Side Rendering (SSR) or Static Site Generation (SSG) of public profile pages, ensuring fast initial load times, especially beneficial for mobile devices and in-app browsers.
    *   **Image Optimization:** Next.js's `Image` component will be used for automatic image optimization (lazy loading, responsive images, modern formats).
    *   **Code Splitting & Lazy Loading:** Next.js automatically splits JavaScript bundles and supports lazy loading components, reducing initial load times.
*   **Vercel Deployment:** Vercel is highly optimized for Next.js, providing global CDN caching and edge deployments that reduce latency for users worldwide.
*   **Supabase Performance:**
    *   **Optimized Database:** PostgreSQL is a high-performance database. We will ensure efficient indexing for frequently queried columns (NFR-3.2) and optimize queries.
    *   **Real-time Synchronization (NFR-1.2):** Supabase Realtime is designed for low-latency data synchronization. Optimistic UI updates will be implemented on the frontend to enhance perceived performance.
    *   **Database Functions:** Encapsulating complex logic in PostgreSQL functions reduces network round-trips and executes logic efficiently close to the data.
*   **Client-Side Caching:** Data fetched from Supabase can be cached client-side using libraries like React Query or SWR to minimize redundant API calls and improve responsiveness.
*   **Minimal Custom Backend:** By avoiding a custom backend API for the MVP, we reduce the number of network hops and potential bottlenecks.

## Deployment Architecture

The application will be deployed on **Vercel**. This choice is driven by its deep integration and optimization for Next.js applications, offering a streamlined deployment experience and excellent performance. Vercel's generous free tier is well-suited for the MVP, and its serverless architecture provides inherent scalability.

## Development Environment

## Development Environment

### Prerequisites

To set up the development environment for 'whatcha-doin', developers will need the following:

*   **Node.js:** Latest LTS version (e.g., v20.x).
*   **pnpm:** A package manager.
*   **Git:** Version control system.
*   **Docker Desktop:** For local Supabase development (optional, but recommended for mirroring production environment).
*   **Code Editor:** VS Code with recommended extensions (e.g., ESLint, Prettier, Tailwind CSS IntelliSense, PostgreSQL extensions).
*   **Supabase Account:** A free-tier account for cloud deployment and management.

### Setup Commands

The project can be initialized and set up using the following commands:

1.  **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd whatcha-doin
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Initialize Supabase locally (optional, for local development):**
    ```bash
    supabase init
    supabase start
    ```
4.  **Link to Supabase project (for cloud deployment):**
    ```bash
    supabase logins
    supabase link --project-ref [your-project-ref]
    ```
5.  **Set up environment variables:**
    Create a `.env.local` file based on `.env.example` (to be provided) and fill in your Supabase API keys and other necessary variables.
6.  **Run migrations:**
    ```bash
    supabase db push
    ```
7.  **Start the development server:**
    ```bash
    pnpm dev
    ```

### CI/CD

*   **Platform:** GitHub Actions
*   **Purpose:** Automate testing, building, and deployment to Vercel.

## Architecture Decision Records (ADRs)

This section summarizes the key architectural decisions made during this workflow, providing context and rationale for each choice.

1.  **ADR 001: Project Initialization & Core Stack**
    *   **Decision:** Use `npx create-next-app@latest whatcha-doin --typescript --tailwind --eslint --app` as the foundation.
    *   **Rationale:** Leverages Next.js's optimized framework, TypeScript for type safety, Tailwind CSS for utility-first styling, ESLint for code quality, and the App Router for modern routing. This provides a robust, industry-standard starting point.

2.  **ADR 002: Backend Services & Data Persistence**
    *   **Decision:** Supabase (PostgreSQL, Authentication, Realtime, Storage, PostgREST API) as the sole backend for all data persistence and authentication from day one.
    *   **Rationale:** Consolidates all data persistence, authentication (Magic Link), real-time capabilities, and file storage into a single, integrated, and scalable platform. Maximizes free-tier usage, simplifies development, and eliminates the need for rework by fully committing to Supabase early.

3.  **ADR 003: API Pattern**
    *   **Decision:** Leverage Supabase's auto-generated PostgREST API as the primary data access pattern directly from the Next.js frontend. Custom Next.js API routes will be implemented only for specific logic not directly covered by PostgREST or Supabase Database Functions. For example, server-side validation for unique usernames will be handled by a **Supabase Database Function** (PostgreSQL function) invoked via `supabase.rpc()`.
    *   **Rationale:** Supabase's PostgREST provides a fully functional RESTful API from the PostgreSQL schema, significantly reducing the need for custom backend API development for core CRUD operations. This reduces complexity, development time, and Vercel serverless function costs, while allowing flexibility for specific business logic.

4.  **ADR 004: Deployment & CI/CD**
    *   **Decision:** Deploy on Vercel with GitHub Actions for CI/CD.
    *   **Rationale:** Vercel offers deep optimization for Next.js, a generous free tier for MVP, and seamless integration with GitHub. GitHub Actions provides free and robust automation for testing, building, and deployment.

5.  **ADR 005: Email Service**
    *   **Decision:** Initially rely on Supabase Auth's built-in email capabilities for Magic Links; defer a dedicated email service.
    *   **Rationale:** Supabase Auth handles the core email requirement for MVP, aligning with frugality and simplicity. A dedicated service can be integrated if future needs for other transactional or marketing emails arise.

6.  **ADR 006: Search Solution**
    *   **Decision:** Deferred for MVP. Journal navigation will be via a date picker only; no text search functionality required.
    *   **Rationale:** Clarification of requirements removed the text search need for MVP, simplifying the architecture.

7.  **ADR 007: Background Jobs (Daily State Change & Grace Period)**
    *   **Decision:** Hybrid approach: Client-side (Next.js) triggers Grace Period on app open/logins for local timezone. Supabase Database Functions (PostgreSQL) enforce "Two-Day Rule" and validate state changes server-side.
    *   **Rationale:** Ensures local timezone accuracy, 'once per day' grace screen, server-side source of truth for streak logic (preventing abuse), handles multi-day absences gracefully, and is the most frugal/cleanest solution for MVP.

8.  **ADR 008: Error Handling Strategy**
    *   **Decision:** User-facing errors via inline validation/toast/error page (consistent with UX spec). Internal reporting via Sentry (frontend free tier), Supabase logs (backend), and Lark chat webhook for critical alerts.
    *   **Rationale:** Aligns with UX principles, ensures proactive monitoring, and leverages cost-effective solutions for issue detection and reporting.

9.  **ADR 009: Logging Approach**
    *   **Decision:** Structured logging with standard levels. Supabase logs for backend, Sentry for frontend, and Lark chat webhook for critical alerts.
    *   **Rationale:** Ensures maintainability, debuggability, and centralized visibility of application health.

10. **ADR 010: Date/Time Handling**
    *   **Decision:** Store UTC in DB (`TIMESTAMP WITH TIME ZONE`), transmit ISO 8601 UTC strings, client converts for local display/input, server-side calculations use UTC with user's stored timezone.
    *   **Rationale:** Ensures data integrity, avoids timezone bugs, provides correct local user experience, and maintains server as source of truth.

11. **ADR 011: API Response Format**
    *   **Decision:** Standard JSON structure with `data` for success, `error` for failures (message, code, details), and optional `metadata`/`pagination`.
    *   **Rationale:** Ensures predictable client-side parsing, simplifies error handling, and provides a clear contract for custom API endpoints (Supabase Functions).

12. **ADR 012: Testing Strategy**
    *   **Decision:** Lean MVP strategy: Unit tests (Vitest + React Testing Library) for core logic/components, Integration tests (Vitest) for key data flows, E2E tests (Playwright) for critical user journeys. All integrated with GitHub Actions.
    *   **Rationale:** Provides a strong safety net for core features, ensures data integrity, validates UX without overkill, and aligns with pragmatic MVP development.

13. **ADR 013: Project Structure**
    *   **Decision:** Next.js App Router-based structure with feature-based routing, hybrid organization for shared components, colocation of related files, and centralized data access.
    *   **Rationale:** Ensures maintainability, developer productivity, aligns with Next.js best practices, and accommodates Supabase integration.

14. **ADR 014: Novel Architectural Patterns**
    *   **Decision:** Not applicable for MVP. Novel UX patterns will be implemented using established architectural building blocks (client-side logic, Supabase Database Functions).
    *   **Rationale:** Focus on leveraging existing patterns for novel UX, aligning with MVP pragmatism.

15. **ADR 015: Data Storage for Intensity (Moving Average)**
    *   **Decision:** For historical trends of intensity, implement a moving average (e.g., 7-day and 30-day averages) rather than storing every single daily intensity entry. The `last_recorded_intensity` will be stored for immediate display.
    *   **Rationale:** Balances the need for historical context and trend analysis with concerns about database efficiency and storage. Provides valuable insights without overwhelming the database with granular daily entries.

16. **ADR 016: Development Mode User Injection**
    *   **Decision:** Implement an `AuthProvider` client component to directly inject a mock user's `user_id` into the session when `NEXT_PUBLIC_DEV_MODE_ENABLED=true` in `app/(main)/layout.tsx`. This allows for direct interaction with Supabase tables using the provided `user_id` for all data operations.
    *   **Rationale:** This strategy allows for seamless feature development and testing without requiring a live Supabase authentication flow, improving developer experience and enabling rapid iteration. It explicitly bypasses Supabase Auth for data operations in development, while Supabase tables are still used as the primary data store. This temporary bypass will be replaced by full Supabase Auth integration in the final epic.

*   **ADR 017: Dynamic Root Routing for User Profiles**
    *   **Decision:** Implement a unified routing model using a dynamic root segment `/[username]` (e.g., `whatcha-doin.com/hammaadworks`). This route serves as the single entry point for all of a user's content.
        - The root page (`app/[username]/page.tsx`) will dynamically render either the **private, editable dashboard** if the visitor is the authenticated owner, or the **public, read-only profile** for all other visitors.
        - All private feature pages (e.g., Habits, Journal, Todos) will be nested under this dynamic route (e.g., `/[username]/habits`, `/[username]/journal`). Access to these sub-routes will be restricted to the authenticated user.
        - If a `username` from the URL does not exist in the database, the application will render a custom 404 page (`app/four-o-four.tsx`).
    *   **Rationale:** This approach provides a clean, shareable, and user-friendly URL structure that serves as a single, predictable namespace for each user. It simplifies the mental model by unifying the public and private access points and scales well for future feature additions. This strategy necessitates a list of **reserved system usernames** (e.g., `auth`, `api`, `profile`, `settings`) that users cannot choose to prevent routing conflicts.

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-12_
_For: hammaadworks_
