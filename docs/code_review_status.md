# Code Review & Refactoring Master Plan

## 👋 Welcome, Architect. Here is your Mission.

You are stepping into the role of the **Lead Senior Developer** and **Code Quality Guardian** for the *whatcha-do.in* project. We are currently in a "Code Review & Optimization" phase. We have written a lot of feature code, but it is starting to smell. It lacks documentation, has redundant logic, and inconsistent file structures.

**Your mandate is to:**
1.  **Systematically Audit:** Go through the codebase directory by directory.
2.  **Enforce "Clean Code":** Modularize large files, remove dead code, and strictly separate "Business Logic" from "UI Components" or "Generic Utils".
3.  **Document Rigorously:** Every exported function MUST have a **Google-style docstring** explaining parameters, return values, and edge cases.
4.  **Add Tests:** Logic changes must be backed by Unit Tests (`vitest`/`jest`). We want a robust system, not a house of cards.
5.  **Optimize:** Look for performance bottlenecks or "time travel" logic gaps (we rely heavily on timezone-aware logic).

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

## 📊 Progress Tracker (Phase 1)

**Legend:**
- ✅ **Completed:** Refactored, Documented, and Tested.
- 🚧 **In Progress:** Currently being worked on / Broken.
- ⏳ **Pending:** Needs review.
- ❌ **Skipped/Deleted:** File removed or not applicable.

```text
/codespace/whatcha-do.in/
├── hooks/
│   ├── ⏳ useActions.ts
│   ├── ⏳ useAuth.tsx
│   ├── ⏳ useConfettiColors.ts
│   ├── ⏳ useDebounce.ts
│   ├── ⏳ useMediaQuery.ts
│   ├── ⏳ usePWAInstall.tsx
│   ├── ⏳ useTargets.ts (Likely broken by the move)
│   └── ⏳ useTreeStructure.ts (Likely broken by the move)
└── lib/
    ├── ⏳ constants.ts
    ├── ✅ date.ts (Refactored: Now a facade for lib/time/*)
    ├── ⏳ enums.ts
    ├── ⏳ mock-data.ts (Fixed imports)
    ├── ⏳ utils.ts (The generic UI utils - check if clean)
    ├── email-templates/
    │   └── ⏳ ...
    ├── lark/
    │   └── ⏳ ...
    ├── logger/
    │   └── ⏳ ...
    ├── logic/
    │   ├── 🚧 actions/
    │   │   ├── utils.ts
    │   │   ├── processors.ts
    │   │   ├── tree-utils.ts
    │   │   └── lifecycle.ts
    │   └── ⏳ ...
    ├── store/
    │   └── ⏳ ...
    ├── supabase/
    │   ├── ✅ actions.ts (Fixed imports)
    │   └── ⏳ ... (Check targets.ts, actions.server.ts)
    ├── time/
        ├── ✅ format.ts
        ├── ✅ logic.ts
        └── ✅ physics.ts

```

---

## 👨‍💻 Protocol for the Next Agent

1.  **Fix the Build:** Execute the "Immediate First Step" defined above.
2.  **Date/Time Logic Integration (Important):**
    *   I refactored `lib/date.ts` to use the new `lib/time/*` modules. It is now a facade.
    *   **Task:** You must update the app to **use the new capabilities**. Specifically, search for usages of date functions in `hooks/` or components (like `SettingsDrawer` or `useSystemTime`) and pass the `simulatedDate` (Time Travel) argument where available.
    *   **Task:** For new code, import directly from `@/lib/time/physics` or `@/lib/time/logic`.
3.  **Verify:** Run `npx tsc --noEmit` or a relevant test to ensure the refactor is stable.
4.  **Continue the Sweep:** Pick the next file in `lib/` (e.g., `lib/utils.ts` or `lib/supabase/user.ts`) or `hooks/` (e.g., `useAuth.tsx`).
5.  **Refactor:** Apply Google-style docstrings, strictly type everything, and extract complex logic into pure functions if possible.
6.  **Update this Doc:** Keep this file alive. It is our map.

**Prompt to Trigger Retirement:**
When you have completed a significant chunk of work (e.g., fixed the build and refactored 1-2 more modules), use the following prompt to hand over to the next session:

> "I have completed my session. I have [list what you fixed]. The current status of the codebase is [Stable/Unstable]. Please update @docs/code_review_status.md with my latest progress, list any hanging tasks for the next person, and provide a handover prompt similar to the one I received. Then you may retire."
