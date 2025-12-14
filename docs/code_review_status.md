# Code Review & Refactoring Master Plan

## 👋 Welcome, Architect. Here is your Mission.

You are stepping into the role of the **Lead Senior Developer** and **Code Quality Guardian** for the *whatcha-do.in* project. We are currently in a "Code Review & Optimization" phase. We have written a lot of feature code, but it is starting to smell. It lacks documentation, has redundant logic, and inconsistent file structures.

The project is currently in a **Code Review & Optimization** phase. Feature development has outpaced structural rigor, resulting in:

- Redundant logic
- Inconsistent file structures
- Underdocumented behavior
- Drift risk across modules

This document is the **single source of truth** for the review effort.

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

## 📊 Progress Tracker (Phase 1 & 2)

**Legend:**
- ✅ **Completed:** Refactored, Documented, and Tested.
- 🚧 **In Progress:** Currently being worked on / Broken.
- ⏳ **Pending:** Needs review.
- ❌ **Skipped/Deleted:** File removed or not applicable.
- 🛑 **Do Not Touch:** 3rd Party Code (shadcn/ui, etc).

```text
/codespace/whatcha-do.in/
├── app/
│   ├── ✅ layout.tsx (Refactored & Documented)
│   ├── ✅ page.tsx (Refactored & Documented)
│   ├── ✅ [username]/page.tsx (Refactored & Documented)
│   ├── ✅ logins/page.tsx (Documented)
│   ├── ✅ me/page.tsx (Documented)
│   ├── ✅ not-found.tsx (Refactored)
│   └── ⏳ ... (Other routes)
├── components/
│   ├── auth/
│   │   ├── ✅ AuthProvider.tsx (Refactored & Performant)
│   │   └── ⏳ ...
│   ├── habits/
│   │   ├── ✅ EditHabitModal.tsx (Documented)
│   │   ├── ✅ HabitChipPrivate.tsx (Refactored & Documented)
│   │   ├── ✅ HabitChipPublic.tsx (Documented)
│   │   ├── ✅ HabitColumn.tsx (Created & Tested)
│   │   ├── ✅ HabitCompletionModal.tsx (Documented)
│   │   ├── ✅ HabitCreator.tsx (Documented)
│   │   ├── ✅ HabitCreatorModal.tsx (Documented)
│   │   ├── ✅ HabitInfoModal.tsx (Documented)
│   │   └── ✅ SortableHabit.tsx (Documented)
│   ├── journal/
│   │   └── ⏳ ...
│   ├── landing/
│   │   ├── ✅ PWASection.tsx (Refactored & Documented)
│   │   └── ⏳ ...
│   ├── layout/
│   │   └── ⏳ ...
│   ├── not-found/
│   │   ├── ⏳ NotFoundLayout.tsx
│   │   ├── ⏳ PageNotFoundContent.tsx
│   │   └── ⏳ UserNotFoundContent.tsx
│   ├── profile/
│   │   ├── ✅ PrivatePage.tsx (Refactored & Documented)
│   │   └── ⏳ ...
│   ├── providers/
│   │   └── ⏳ ...
│   ├── shared/
│   │   ├── ✅ ActionItem.tsx (Refactored & Documented)
│   │   ├── ✅ ActionsList.tsx (Refactored & Documented)
│   │   ├── ✅ AddActionForm.tsx (Refactored & Documented)
│   │   ├── ✅ AddTargetForm.tsx (Refactored & Documented)
│   │   ├── ✅ BaseModal.tsx (Verified)
│   │   ├── ✅ ContactSupportModal.tsx (Refactored & Documented)
│   │   ├── ✅ FeedbackModal.tsx (Refactored & Documented)
│   │   ├── ✅ KeyboardShortcut.tsx (Refactored & Documented)
│   │   └── ⏳ ...
│   └── ui/
│       ├── ✅ button.tsx (Refactored & Documented)
│       ├── ✅ card.tsx (Refactored & Documented)
│       ├── ✅ checkbox.tsx (Refactored & Documented)
│       ├── ✅ dialog.tsx (Refactored & Documented)
│       ├── ✅ input.tsx (Refactored & Documented)
│       └── 🛑 (All other files are 3rd party - Do Not Touch)
├── hooks/
│   ├── ✅ useActions.ts (Refactored & Typed & Tested)
│   ├── ✅ useAuth.tsx (Refactored & Documented)
│   ├── ✅ useConfettiColors.ts (Refactored & Tested)
│   ├── ✅ useDebounce.ts (Refactored & Tested)
│   ├── ✅ useHabitDnd.ts (Created & Tested)
│   ├── ✅ useMediaQuery.ts (Refactored & Tested)
│   ├── ✅ usePWAInstall.tsx (Refactored & Tested)
│   ├── ✅ useTargets.ts (Refactored & Tested)
│   └── ✅ useTreeStructure.ts (Refactored & Tested)
└── lib/
    ├── templates/
    │   └── ⏳ magic-link.html (Pending Move from email-templates/)
    ├── logger/
    │   └── ⏳ ...
    ├── logic/
    │   ├── actions/
    │   │   ├── ✅ lifecycle.ts (Tested)
    │   │   ├── ✅ processors.ts (Tested)
    │   │   └── ✅ tree-utils.ts (Tested)
    │   └── ⏳ ...
    ├── store/
    │   └── ⏳ ...
    ├── supabase/
    │   ├── ✅ actions.server.ts (Refactored & Logged)
    │   ├── ✅ actions.ts (Refactored & Logged)
    │   ├── ✅ habit.server.ts (Refactored & Tested)
    │   ├── ✅ habit.ts (Refactored & Tested)
    │   ├── ✅ identities.server.ts (Refactored & Logged)
    │   ├── ✅ identities.ts (Refactored & Logged)
    │   ├── ✅ journal.server.ts (Refactored & Logged)
    │   ├── ✅ journal.ts (Refactored & Logged)
    │   ├── ✅ targets.server.ts (Refactored & Logged)
    │   ├── ✅ targets.ts (Refactored & Logged)
    │   ├── ✅ user.client.ts (Reviewed & Logged)
    │   └── ⏳ ...
    ├── time/
    │   ├── ✅ format.ts
    │   ├── ✅ logic.ts
    │   └── ✅ physics.ts
    ├── ✅ constants.ts (Documented)
    ├── ✅ date.ts (Refactored: Facade)
    ├── ✅ enums.ts (Documented)
    ├── ✅ lark.ts (Documented)
    ├── ✅ mock-data.ts (Refactored & Typed)
    └── ✅ utils.ts (Documented)
```

---

## 👨‍💻 Protocol for the Next Agent

1.  **Fix the Build:** Execute the "Immediate First Step" defined above.
2.  **Phase 2 Start (UI Components):**
    *   **Goal:** Ensure all components are accessible, performant, and consistently styled.
    *   **Restriction:** **DO NOT** refactor files in `components/ui/` as they are external library code.
    *   **Task:** Check for hardcoded logic that should be moved to hooks.
    *   **Task:** Add/Update unit tests for every component touched ("Test What You Touch").
3.  **Verify:** Run `npx tsc --noEmit` to ensure type safety after any changes.
4.  **Refactor:** Apply Google-style docstrings to all exported components and hooks.
5.  **Update this Doc:** Keep this file alive. It is our map.

**Prompt to Trigger Retirement:**
When you have completed a significant chunk of work (e.g., refactored a component directory like components/shared), use the following prompt to hand over to the next session:

> "I have completed my session. I have [list what you fixed]. The current status of the codebase is [Stable/Unstable]. Please update @docs/code_review_status.md with my latest progress, list any hanging tasks for the next person, and provide a handover prompt similar to the one I received. Then you may retire."

---