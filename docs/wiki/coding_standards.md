# Coding Standards & Best Practices

This document serves as the **Source of Truth** for all software engineering work on the *whatcha-do.in* project. All developers (human and AI) must adhere to these standards to ensure maintainability, readability, and system stability.

---

## 1. Core Mandates

*   **Type Safety:** Strict TypeScript is mandatory. Avoid `any`. Use interfaces for Props and Data models.
*   **Immutability:** Treat state as immutable. Use `immer` (via `produce`) for complex state updates if necessary, or standard spread operators.
*   **Server/Client Boundary:** Explicitly mark Client Components with `"use client";`. Suffix server-only logic files with `.server.ts` to prevent accidental bundling.
*   **No Third-Party Refactoring:** Do **NOT** modify files in `components/ui/` (Shadcn/Magic UI) unless fixing a critical breaking bug. Treat them as external library code.

---

## 2. File & Naming Conventions

*   **React Components (`.tsx`):** Use `PascalCase`.
    *   *Example:* `UserProfile.tsx`, `SubmitButton.tsx`.
    *   *Why:* Matches the import and usage syntax (`<UserProfile />`).
*   **Hooks (`.ts` / `.tsx`):** Use `camelCase`, always starting with `use`.
    *   *Example:* `useAuth.ts`, `useWindowSize.ts`.
    *   *Why:* React standard for identifying hooks.
*   **Logic, Utils, & Libraries (`.ts`):** Use `kebab-case`.
    *   *Example:* `date-utils.ts`, `habit-logic.ts`, `api-client.ts`.
    *   *Why:* Standard in the JS ecosystem for non-component modules; avoids casing issues on different OS file systems.
*   **Server-Only Files:** Suffix with `.server.ts`.
    *   *Example:* `habit.server.ts`, `db.server.ts`.
    *   *Why:* Prevents accidental bundling of sensitive server code into client bundles.

---

## 3. Project Structure & File Placement Rules

Maintain a clean and predictable codebase by following these placement rules. **Do not create new top-level directories.**

### 📂 `/app` (Application Routing)
*   **Purpose:** Next.js App Router files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
*   **Rule:** Only put *routing-specific* logic here. Move complex UI and business logic to `components/` or `lib/`.
*   **Grouping:** Use Route Groups `(main)`, `(auth)` to organize routes without affecting the URL structure.

### 📂 `/components` (UI & Feature Components)
*   **Group by Feature, not Type:**
    *   ✅ `components/habits/HabitList.tsx` (Feature-based)
    *   ❌ `components/lists/HabitList.tsx` (Type-based)
*   **`/components/ui`**: **[READ-ONLY]** Dumb, reusable primitives (Buttons, Inputs, Dialogs) from Shadcn/Magic UI. Do not add business logic here.
*   **`/components/shared`**: Smart, reusable components used across *multiple* features (e.g., `FeedbackModal.tsx`, `BaseModal.tsx`).
*   **`/components/layout`**: App shell components (`AppHeader.tsx`, `Sidebar.tsx`).
*   **`/components/[feature]`**: Components specific to a domain (e.g., `auth/`, `habits/`, `journal/`).

### 📂 `/lib` (Business Logic & Data)
*   **Purpose:** Pure functions, data access, and core algorithms. Independent of UI.
*   **Avoid Single-File Folders:** Do not create a folder just to hold an `index.ts`.
    *   ✅ `lib/lark.ts`
    *   ❌ `lib/lark/index.ts`
*   **`/lib/supabase`**: Database interaction layer.
    *   `client.ts`: Client-side Supabase client.
    *   `server.ts`: Server-side Supabase client.
    *   `types.ts`: **Centralized Database Types**. All DB interfaces (User, Habit, Action) must be defined here.
    *   `[domain].ts`: Client-side data fetching functions (e.g., `habits.ts`).
    *   `[domain].server.ts`: Server-side data fetching functions (e.g., `habits.server.ts`).
*   **`/lib/logic`**: Complex domain algorithms (e.g., `actions/processors.ts` for tree traversal).
*   **`/lib/utils.ts`**: Truly generic helpers (class merging, math).
*   **`/lib/constants.ts`**: Global configuration constants (URLs, Limits, Keys).
*   **`/lib/templates`**: (Optional) HTML/Text templates for emails or generated content.

### 📂 `/hooks` (React State & Effects)
*   **Purpose:** Custom React hooks.
*   **Rule:** If a logic piece uses `useState`, `useEffect`, or other React hooks, it belongs here.
*   **Examples:** `useAuth.tsx`, `useMediaQuery.ts`, `useHabitDnd.ts`.

### 📂 `/public` (Static Assets)
*   **Purpose:** Images, fonts, icons, manifest.json.
*   **Rule:** Organize by type (e.g., `/images`, `/favicons`).

### 📂 `/tests` (Verification)
*   **Purpose:** Unit and integration tests.
*   **Rule:** Mirror the structure of the code being tested where possible.

---

## 4. Coding Style & Patterns

### Exports
*   **Prefer Named Exports:** Use `export const MyComponent = ...` instead of `export default`.
    *   *Why:* Enforces consistent naming across imports and helps with auto-refactoring.
    *   *Exception:* Next.js Pages (`page.tsx`, `layout.tsx`) **must** use `export default`.

### Props & Types
*   **Interface over Type:** Use `interface Props { ... }` for component props.
*   **Co-location:** Define specific interfaces in the same file as the component/function.
*   **Shared Types:** Domain entities (e.g., `User`, `Habit`) should be defined in `lib/supabase/types.ts` or `lib/types/` and imported.

### Logging
*   **Structured Logging:** Do not use `console.log`. Use the structured logging system.
*   **Wrapper (Server):** Use `withLogging` for server-side logic.
    ```typescript
    import { withLogging } from '@/lib/logger/withLogging';
    const _myFunc = async () => { ... };
    export const myFunc = withLogging(_myFunc, 'myFunc');
    ```
*   **See:** `docs/wiki/structured-logging-guide.md`

### Timezones
*   **User Preference First:** Never rely on `new Date()` (server time) or `Date.now()` for determining "Today" in business logic.
*   **Logic:** Always use the user's stored timezone from their profile.
*   **See:** `docs/wiki/timezone-handling-guide.md`

---

## 5. Documentation (JSDoc)

Every exported component and function must have a JSDoc block.

**For Components:**
```tsx
/**
 * Primary UI Button component.
 * Supports various visual variants and sizes.
 *
 * @param variant - Visual style (default, outline, ghost).
 * @param size - Button size (sm, default, lg).
 */
export const Button = ...
```

**For Functions:**
```typescript
/**
 * Fetches the user's habit streaks.
 *
 * @param userId - The UUID of the user.
 * @returns A promise resolving to the list of habits.
 * @throws Error if the DB connection fails.
 */
export async function getHabits(userId: string) { ... }
```

---

## 6. Testing

*   **"Test What You Touch":** If you refactor a file, ensure it has a corresponding test in `tests/` or create one.
*   **Unit Tests:** Focus on logic in `lib/` and hooks in `hooks/`.
*   **Integration Tests:** Ensure key user flows (e.g., "Complete a Habit") work end-to-end.

---

## 7. AI Agent Protocol

When an AI agent interacts with this codebase:
1.  **Read First:** Check `docs/architecture.md`, `docs/PRD.md`, and relevant `docs/wiki/*.md` files before writing code.
2.  **Plan:** Propose a plan for complex changes.
3.  **Refactor:** Apply these standards to any legacy code you touch ("Boy Scout Rule": Leave the code better than you found it).
4.  **Verify:** Run strict type checks (`npx tsc --noEmit`) before finishing.