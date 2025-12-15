# Database Schema & Architecture Guide

This document provides a comprehensive overview of the **Supabase (PostgreSQL)** database schema for *whatcha-do.in*. It
is designed to help developers understand the data models, relationships, and security policies that power the
application.

---

## 1. Core Architecture Principles

* **User-Centric:** Almost every table is strictly scoped to a `user_id`.
* **Postgres + NoSQL Hybrid:** We use standard relational tables for structured data (Habits, Profiles) and `JSONB` for
  recursive/unstructured data (Actions Tree, Targets).
* **Security First:** **Row Level Security (RLS)** is enabled on ALL tables. Users can *only* CRUD their own data.
* **Timezone Aware:** While all timestamps are stored in **UTC** (`timestamptz`), logic often relies on the user's
  stored `timezone` preference.

---

## 2. Table Reference

### `public.users`

**Role:** The central profile table. Syncs with `auth.users` (Supabase Auth).
**One-to-One** with `auth.users`.

| Column                        | Type          | Nullable | Description                                              |
|:------------------------------|:--------------|:---------|:---------------------------------------------------------|
| `id`                          | `uuid`        | NO       | **PK, FK**. Linked to `auth.users.id`.                   |
| `username`                    | `text`        | NO       | Unique handle for profile URLs (e.g. `/hammaad`).        |
| `bio`                         | `text`        | YES      | User's markdown bio.                                     |
| `timezone`                    | `text`        | NO       | **Critical.** Defaults to `'UTC'`. Used for daily logic. |
| `motivations`                 | `jsonb`       | YES      | Array of motivational quotes.                            |
| `grace_screen_shown_for_date` | `date`        | YES      | Tracks if the "Grace Period" screen was shown today.     |
| `created_at`                  | `timestamptz` | NO       | Account creation time.                                   |
| `updated_at`                  | `timestamptz` | YES      | Last update time.                                        |

*Note: The `email` column was removed to enhance privacy and security.*

---

### `public.habits`

**Role:** Stores the definition and streak state of a recurring habit.

| Column           | Type          | Description                                                  |
|:-----------------|:--------------|:-------------------------------------------------------------|
| `id`             | `uuid`        | **PK**. Auto-generated.                                      |
| `user_id`        | `uuid`        | **FK** to `users`.                                           |
| `name`           | `text`        | Habit title.                                                 |
| `current_streak` | `int`         | Current active streak count.                                 |
| `last_streak`    | `int`         | The streak value before the last reset (for motivation).     |
| `habit_state`     | `text`        | Lifecycle state: `NULL` (Active), `'lively'`, or `'junked'`. |
| `junked_at`      | `timestamptz` | When it moved to the "Junked" pile.                          |
| `is_public`      | `bool`        | Visibility flag.                                             |
| `goal_value`     | `numeric`     | Numeric goal target.                                         |
| `goal_unit`      | `text`        | Unit for the goal (e.g., 'pages', 'mins').                   |
| `created_at`     | `timestamptz` | Creation timestamp.                                          |

---

### `public.habit_completions`

**Role:** An append-only log of every time a user completes a habit. Used for history, charts, and "Grace Period"
recovery.

| Column                | Type          | Description                                |
|:----------------------|:--------------|:-------------------------------------------|
| `id`                  | `uuid`        | **PK**.                                    |
| `habit_id`            | `uuid`        | **FK** to `habits`.                        |
| `user_id`             | `uuid`        | **FK** to `users`.                         |
| `completed_at`        | `timestamptz` | When the button was clicked.               |
| `mood_score`          | `int`         | 0-100 score (Fuel Meter).                  |
| `work_value`          | `numeric`     | Actual value recorded.                     |
| `goal_at_completion`  | `numeric`     | Goal value at the time of completion.      |
| `duration_value`      | `numeric`     | Duration recorded.                         |
| `duration_unit`       | `text`        | Unit for duration.                         |
| `notes`               | `text`        | Optional reflection.                       |

---

### `public.actions` (Replaces Todos)

**Role:** Stores the user's **entire Action Tree** as a single document.
**Pattern:** "Document Store" (One row per user).

| Column    | Type    | Description                                              |
|:----------|:--------|:---------------------------------------------------------|
| `id`      | `uuid`  | **PK**.                                                  |
| `user_id` | `uuid`  | **FK** to `users`. **UNIQUE constraint**.                |
| `data`    | `jsonb` | **The Tree.** Contains the nested array of action nodes. |

**Why JSONB?**
* Unlimited deep nesting.
* Single fast query.
* Atomic updates.

---

### `public.identities`

**Role:** Stores the user's "Identity Statements" (e.g., "I am a runner").

| Column        | Type   | Description                                 |
|:--------------|:-------|:--------------------------------------------|
| `id`          | `uuid` | **PK**.                                     |
| `user_id`     | `uuid` | **FK** to `users`.                          |
| `title`       | `text` | The core statement (e.g., "I am a writer"). |
| `description` | `text` | Optional richer description/motivation.     |
| `is_public`   | `bool` | Visibility flag.                            |

---

### `public.habit_identities`

**Role:** Many-to-Many join table linking Habits to Identities.

| Column        | Type   | Description                                      |
|:--------------|:-------|:-------------------------------------------------|
| `habit_id`    | `uuid` | **PK, FK** to `habits`.                          |
| `identity_id` | `uuid` | **PK, FK** to `identities`.                      |
| `user_id`     | `uuid` | **FK** to `users`. Denormalized for simpler RLS. |

---

### `public.targets`

**Role:** Stores monthly target lists (structured like Actions but partitioned by month).
**Pattern:** "Document Store" (One row per user per month).

| Column        | Type          | Description                                                    |
|:--------------|:--------------|:---------------------------------------------------------------|
| `id`          | `uuid`        | **PK**.                                                        |
| `user_id`     | `uuid`        | **FK** to `users`.                                             |
| `target_date` | `date`        | `NULL` = Future/Backlog. `YYYY-MM-01` = Specific Month Bucket. |
| `data`        | `jsonb`       | The nested tree of target items (same schema as Actions).      |
| `created_at`  | `timestamptz` | Creation timestamp.                                            |

**Constraint:** `UNIQUE(user_id, target_date)` ensures only one list per month per user.

---

### `public.journal_entries`

**Role:** Daily text entries. One entry per date per user.

| Column           | Type          | Description                                                    |
|:-----------------|:--------------|:---------------------------------------------------------------|
| `id`             | `uuid`        | **PK**.                                                        |
| `user_id`        | `uuid`        | **FK** to `users`.                                             |
| `entry_date`     | `date`        | The logical date of the entry.                                 |
| `content`        | `text`        | Markdown content.                                              |
| `is_public`      | `bool`        | Default `false`.                                               |
| `activity_log`   | `jsonb`       | **Read-only.** Stores array of structured activity objects.    |
| `created_at`     | `timestamptz` | Creation timestamp.                                            |

**Constraint:** `UNIQUE(user_id, entry_date, is_public)` - *Note: Recent migration changed the unique constraint to include `is_public`, potentially allowing multiple entries if visibility differs (though likely intended to fix a constraint issue).*

---

## 3. Security Policies (RLS)

**The Golden Rule:**
> `USING ((select auth.uid()) = user_id)`

This subquery optimization ensures Postgres executes the auth check **once** per query, not per row.

**Policies applied to ALL tables:**

1. **SELECT:** Can view own data.
   * *Exception:* `public.users` is readable by everyone (Application layer filters sensitive fields).
2. **INSERT:** Can insert with own `user_id`.
3. **UPDATE:** Can update own rows.
4. **DELETE:** Can delete own rows.

---

## 4. Triggers & Functions

### `handle_new_user`
* **Trigger:** `AFTER INSERT ON auth.users`
* **Action:** Automatically creates a row in `public.users`.
* **Logic:** Generates a unique `username` (e.g. `john_doe_123`) derived from the email, but does **not** store the email in `public.users`.

### `update_updated_at_column`
* **Trigger:** `BEFORE UPDATE` (On `users`, `actions`, `habits`, `identities`, `targets`)
* **Action:** Sets `updated_at = now()`.

---

## 5. Data Lifecycle Strategy

1.  **Completion & Real-Time Logging:** When an item (Action, Habit, Target) is marked complete, its details are immediately logged to the `activity_log` JSONB array of the `journal_entry` for the current day.
2.  **Unmarking:** If an Action or Target is unmarked, its entry is deleted from the `activity_log`.
3.  **Next Day Clearing:**
    *   **Actions/Targets:** Completed items are cleared from the active lists (`actions.data`, `targets.data`) after the day ends.
    *   **Habits:** Habits persist but change state/streak based on the "Two-Day Rule" and "Grace Period".