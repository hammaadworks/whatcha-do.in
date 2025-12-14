# Code Review & Refactoring Master Plan

## 👋 Welcome, Architect. Here is your Mission.

You are stepping into the role of the **Lead Senior Developer** and **Code Quality Guardian** for the *whatcha-do.in* project. We are currently in a "Code Review & Optimization" phase. We have written a lot of feature code, but it is starting to smell. It lacks documentation, has redundant logic, and inconsistent file structures.

**Your mandate is to:**
1.  **Systematically Audit:** Go through the codebase directory by directory.
2.  **Enforce "Clean Code":** Modularize large files, remove dead code, and strictly separate "Business Logic" from "UI Components" or "Generic Utils".
3.  **Document Rigorously:** Every exported function MUST have a **Google-style docstring** explaining parameters, return values, and edge cases.
4.  **Add Tests:** Logic changes must be backed by Unit Tests (`vitest`/`jest`). We want a robust system, not a house of cards.
5.  **Test What You Touch:** If you refactor or document a file, you **MUST** ensure a corresponding unit test exists and passes. If it doesn't exist, create it.
6.  **DO NOT ASSUME!!:** If you encounter any ambiguity in code logic, requirements, or expected behavior, **ASK** the user for clarification. Do not make assumptions. Better to ask than to break.
7.  **Optimize:** Look for performance bottlenecks or "time travel" logic gaps (we rely heavily on timezone-aware logic).
8.  **Understand:** Read the code and make intelligent review decisions avoid code duplication or rework. You can also read context from @docs/architecture.md and @docs/PRD.md.
9.  **Standardize Structure:** Follow the **Engineering Standards & Conventions** section below for naming and file placement.
10. Let's see @docs/wiki/strcutured_logging-guide.md to add relevant logs and clean up bad code.

---

## 📏 Engineering Standards & Conventions

To ensure long-term maintainability, we adhere to the following strict conventions.

### 1. File Naming
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

### 2. Directory Structure
*   **Feature-Based Grouping:** Prefer grouping by feature over type.
    *   *Good:* `components/habits/HabitList.tsx`
    *   *Bad:* `components/lists/HabitList.tsx`
*   **`lib/` vs `utils/`:**
    *   `lib/`: Domain-specific business logic and data access (e.g., `lib/supabase/`, `lib/time/`).
    *   `utils/` (or `lib/utils.ts`): Truly generic helpers (e.g., class name merger `cn()`, math helpers) that could be used in *any* project.

### 3. Code Style
*   **Exports:** Prefer **Named Exports** over Default Exports to ensure consistent naming across imports.
    *   *Exception:* Next.js Pages (`page.tsx`) must use Default Exports.
*   **Types:** Co-locate types if specific to a component. If shared, use `lib/types/` or `lib/supabase/types.ts`.

---

## 🗺️ The Roadmap (Expanded Scope)

We are tackling this in phases to ensure consistency across the entire stack.

### 🟢 Phase 1: Core Logic & State (Current)
*Focus: Data integrity, business rules, and shared utilities.*
*   **Directory:** `lib/`
    *   ✅ `lib/time/` (Date/Time Logic - Refactored & Tested)
    *   🚧 `lib/logic/actions/` (Action Domain - Refactoring in progress)
    *   ⏳ `lib/supabase/` (Data Access Layer)
*   **Directory:** `hooks/`
    *   ⏳ `useAuth.tsx`, `useActions.ts`, etc.

### 🟡 Phase 2: UI Components (Next)
*Focus: Separation of concerns, accessibility, and performance.*
*   **Directory:** `components/`
    *   Audit for hardcoded logic (extract to hooks).
    *   Standardize Tailwind usage.
    *   Ensure accessibility (ARIA).

### 🔴 Phase 3: Application Layer
*Focus: Routing, Server/Client boundaries, and API routes.*
*   **Directory:** `app/`
    *   Verify Server vs. Client component usage.
    *   Review `api/` route logic.

---

## 📊 Progress Tracker (Phase 1 & 2)

**Legend:**
- ✅ **Completed:** Refactored, Documented, and Tested.
- 🚧 **In Progress:** Currently being worked on / Broken.
- ⏳ **Pending:** Needs review.
- ❌ **Skipped/Deleted:** File removed or not applicable.

```text
/codespace/whatcha-do.in/
├── hooks/
│   ├── ✅ useActions.ts (Refactored & Typed & Tested)
│   ├── ⏳ useAuth.tsx (Refactored & Documented)
│   ├── ✅ useConfettiColors.ts (Refactored & Tested)
│   ├── ✅ useDebounce.ts (Refactored & Tested)
│   ├── ✅ useHabitDnd.ts (Created & Tested)
│   ├── ✅ useMediaQuery.ts (Refactored & Tested)
│   ├── ✅ usePWAInstall.tsx (Refactored & Tested)
│   ├── ✅ useTargets.ts (Refactored & Tested)
│   └── ✅ useTreeStructure.ts (Refactored & Tested)
└── components/
    └── habits/
        ├── ✅ EditHabitModal.tsx (Documented)
        ├── ✅ HabitChipPrivate.tsx (Refactored & Documented)
        ├── ✅ HabitChipPublic.tsx (Documented)
        ├── ✅ HabitColumn.tsx (Created & Tested)
        ├── ✅ HabitCompletionModal.tsx (Documented)
        ├── ✅ HabitCreator.tsx (Documented)
        ├── ✅ HabitCreatorModal.tsx (Documented)
        ├── ✅ HabitInfoModal.tsx (Documented)
        └── ✅ SortableHabit.tsx (Documented)
└── lib/
    ├── ✅ constants.ts (Documented)
    ├── ✅ date.ts (Refactored: Now a facade for lib/time/*)
    ├── ✅ enums.ts (Documented)
    ├── ✅ mock-data.ts (Refactored & Typed)
    ├── ⏳ utils.ts (The generic UI utils - check if clean)
    ├── email-templates/
    │   └── ⏳ ...
    ├── lark/
    │   └── ⏳ ...
    ├── logger/
    │   └── ⏳ ...
    ├── logic/
    │   ├── ✅ actions/
    │   │   ├── ✅ processors.ts (Tested)
    │   │   ├── ✅ tree-utils.ts (Tested)
    │   │   └── ✅ lifecycle.ts (Tested)
    │   └── ⏳ ...
    ├── store/
    │   └── ⏳ ...
    ├── supabase/
    │   ├── ⏳ actions.ts (Fixed imports)
    │   ├── ⏳ actions.server.ts (Refactored & Tested)
    │   ├── ✅ habit.ts (Refactored & Tested)
    │   ├── ✅ habit.server.ts (Refactored & Tested)
    │   ├── ⏳ identities.ts (Documented)
    │   ├── ⏳ identities.server.ts (Documented)
    │   ├── ⏳ journal.ts (Documented)
    │   ├── ⏳ journal.server.ts (Documented)
    │   ├── ⏳ targets.ts (Refactored & Documented)
    │   ├── ⏳ targets.server.ts (Documented)
    │   └── ⏳ user.client.ts / user.server.ts (Documented)
    ├── time/
        ├── ✅ format.ts
        ├── ✅ logic.ts
        └── ✅ physics.ts
├── app/
│   ├── ✅ page.tsx (Refactored & Documented)
│   ├── ✅ [username]/page.tsx (Refactored & Documented)
│   ├── ✅ logins/page.tsx (Documented)
│   ├── ✅ me/page.tsx (Documented)
│   ├── ✅ not-found.tsx (Refactored)
│   └── ⏳ ...
├── components/
    ├── auth/
    │   └── ⏳ ...
    ├── habits/
        ├── ✅ EditHabitModal.tsx (Documented)
        ├── ✅ HabitChipPrivate.tsx (Refactored & Documented)
        ├── ✅ HabitChipPublic.tsx (Documented)
        ├── ✅ HabitColumn.tsx (Created & Tested)
        ├── ✅ HabitCompletionModal.tsx (Documented)
        ├── ✅ HabitCreator.tsx (Documented)
        ├── ✅ HabitCreatorModal.tsx (Documented)
        ├── ✅ HabitInfoModal.tsx (Documented)
        └── ✅ SortableHabit.tsx (Documented)
    ├── journal/
    │   └── ⏳ ...
    ├── landing/
    │   ├── ✅ PWASection.tsx (Refactored & Documented)
    │   └── ⏳ ...
    ├── layout/
    │   └── ⏳ ...
    ├── not-found/
    │   ├── ✅ NotFoundLayout.tsx (Refactored & Documented)
    │   ├── ✅ PageNotFoundContent.tsx (Refactored & Documented)
    │   └── ✅ UserNotFoundContent.tsx (Refactored & Documented)
    ├── profile/
        ├── ✅ PrivatePage.tsx (Refactored & Documented)
        └── ⏳ ...
    ├── providers/
    │   └── ⏳ ...
    ├── shared/
    │   └── ⏳ ...
    ├── ui/
    │   └── ⏳ ...

```

---

## 👨‍💻 Protocol for the Next Agent

1.  **Fix the Build:** Execute the "Immediate First Step" defined above.
2.  **Phase 2 Start (UI Components):**
    *   **Goal:** Ensure all components are accessible, performant, and consistently styled.
    *   **Task:** Systematically audit `components/`. Start with `components/shared/` or `components/ui/` (the foundational blocks).
    *   **Task:** Standardize Tailwind usage (remove arbitrary values where possible, use `cn()` util).
    *   **Task:** Ensure `aria` attributes are present for accessibility.
    *   **Task:** Check for hardcoded logic that should be moved to hooks.
    *   **Task:** Add/Update unit tests for every component touched ("Test What You Touch").
3.  **Verify:** Run `npx tsc --noEmit` to ensure type safety after any changes.
4.  **Refactor:** Apply Google-style docstrings to all exported components and hooks.
5.  **Update this Doc:** Keep this file alive. It is our map.

**Prompt to Trigger Retirement:**
When you have completed a significant chunk of work (e.g., refactored a component directory like components/shared), use the following prompt to hand over to the next session:

> "I have completed my session. I have [list what you fixed]. The current status of the codebase is [Stable/Unstable]. Please update @docs/code_review_status.md with my latest progress, list any hanging tasks for the next person, and provide a handover prompt similar to the one I received. Then you may retire."
