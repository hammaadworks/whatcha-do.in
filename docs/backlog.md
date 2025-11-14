# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story’s `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.

| Date | Story | Epic | Type | Severity | Owner | Status | Notes                                                                                                                                                         |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ |---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2025-11-13 | 0.1 | 0 | Advisory | Low | TBD | Open | No Epic Tech Spec was found for Epic 0. This did not impact the review of this foundational story, but it is noted for future reference.                      |
| 2025-11-13 | 1.2 | 1 | Bug | High | TBD | Open | Correct the import path for `supabase` in `components/auth/Auth.tsx` from `../lib/supabase/client` to `@/lib/supabase/client`.                                |
| 2025-11-13 | 1.2 | 1 | Bug | High | TBD | Open | Implement the skipped E2E tests in `tests/e2e/auth-flow.spec.ts` to verify authenticated user flows (e.g., seeing logout button, accessing protected routes). |
| 2025-11-13 | 1.2 | 1 | Refactor | Medium | TBD | Open | Refine the `proxy.ts` logic to be more specific about which routes require authentication, or adjust the `matcher` to explicitly list all protected routes.   |
| 2025-11-13 | 1.2 | 1 | Bug | Medium | TBD | Open | Add error handling to the `handleLogout` function in `components/auth/Auth.tsx`.                                                                              |
