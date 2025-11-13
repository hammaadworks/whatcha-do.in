# BMM Phase 4: Implementation Workflow (Strict)

**Author:** hammaadworks (Verified & Enhanced by Gemini)
**Version:** 2.0

---

## 0. Pre-requisites

- **Phase 1-3 Complete:** `PRD.md`, `architecture.md`, and other planning documents are finalized.
- **`sprint-planning` Complete:** The `.bmad-ephemeral/sprint-status.yaml` file exists and is populated with all epics and stories for the sprint.

**Core Principle:** Follow this lifecycle for **one story at a time**. Do not start the next story until the current one is `DONE`.

---

## 4.1. Epic Kick-off (Run Once Per Epic)

Start here for each new epic in your sprint.

1.  **`epic-tech-context` (Required)**
    *   **Agent:** `SM` (Scrum Master)
    *   **Purpose:** Creates the just-in-time technical specification for all stories within the current epic, ensuring a consistent implementation approach.

2.  **`test-design` (Required)**
    *   **Agent:** `TEA` (Test Architect)
    *   **Purpose:** Creates the comprehensive test plan for the epic, assessing risks and defining the quality strategy (unit, integration, E2E).

---

## 4.2. Story Cycle (Repeat for Each Story in the Epic)

This is the development loop for a single story.

3.  **`create-story` (Required)**
    *   **Agent:** `SM` (Scrum Master)
    *   **Purpose:** Drafts the next story from the queue in `sprint-status.yaml` and creates its corresponding `.md` file.

4.  **`validate-create-story` (Optional)**
    *   **Agent:** `SM` (Scrum Master)
    *   **Purpose:** Performs an independent validation of the story draft against a quality checklist.

5.  **`story-context` (Required)**
    *   **Agent:** `SM` (Scrum Master)
    *   **Purpose:** Assembles a dynamic context file (`-context.xml`) for the developer by pulling information from the PRD, architecture, epic-tech-context, and codebase.
    *   **Alternative:** For very simple stories, you can use `story-ready-for-dev` to skip context generation.

6.  **`validate-story-context` (Optional)**
    *   **Agent:** `SM` (Scrum Master)
    *   **Purpose:** Validates the generated context file for completeness and accuracy.

7.  **`atdd` (Optional)**
    *   **Agent:** `TEA` (Test Architect)
    *   **Purpose:** Implements the "red" phase of TDD by generating failing acceptance tests (e.g., Playwright specs) that the developer will then make pass.

8.  **`develop-story` (Required)**
    *   **Agent:** `DEV` (Developer)
    *   **Purpose:** The primary implementation workflow. The DEV agent reads the story and its context, then writes the necessary code and associated tests to meet all acceptance criteria.

9.  **`automate` (Optional)**
    *   **Agent:** `TEA` (Test Architect)
    *   **Purpose:** Expands test coverage for the completed story by adding automated regression tests and other quality checks.

10. **`code-review` (Required)**
    *   **Agent:** `DEV` (Developer)
    *   **Purpose:** Performs a senior-level quality review of the code and tests. If issues are found, the story returns to the `develop-story` step for fixes.

11. **`test-review` (Optional)**
    *   **Agent:** `TEA` (Test Architect)
    *   **Purpose:** Audits the quality of the tests written during the `develop-story` and `automate` steps against the knowledge base patterns.

12. **`trace` (Optional)**
    *   **Agent:** `TEA` (Test Architect)
    *   **Purpose:** Refreshes the requirements traceability matrix to show updated test coverage for the completed story.

13. **`story-done` (Required)**
    *   **Agent:** `DEV` (Developer)
    *   **Purpose:** Marks the story as complete in `sprint-status.yaml`. This officially concludes the work on the current story and advances the queue.

---

## 4.3. Epic Close-out (Run Once Per Epic)

Run this after the last story in the epic is `DONE`.

14. **`epic-retrospective` (Required)**
    *   **Agent:** `SM` (Scrum Master)
    *   **Purpose:** Facilitates a "lessons learned" session for the completed epic, capturing insights that can be applied to the next one.

---

## Minimum Required Workflow ("Happy Path")

For maximum speed, the absolute minimum required steps for a story are:

1.  `create-story` (SM)
2.  `story-context` (SM)
3.  `develop-story` (DEV)
4.  `code-review` (DEV)
5.  `story-done` (DEV)