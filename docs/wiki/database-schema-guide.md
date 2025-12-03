# Database Schema & Architecture Guide

This document provides a comprehensive overview of the **Supabase (PostgreSQL)** database schema for *whatcha-doin*. It is designed to help developers understand the data models, relationships, and security policies that power the application.

---

## 1. Core Architecture Principles

*   **User-Centric:** Almost every table is strictly scoped to a `user_id`.
*   **Postgres + NoSQL Hybrid:** We use standard relational tables for structured data (Habits, Profiles) and `JSONB` for recursive/unstructured data (Actions Tree).
*   **Security First:** **Row Level Security (RLS)** is enabled on ALL tables. Users can *only* CRUD their own data.
*   **Timezone Aware:** While all timestamps are stored in **UTC** (`timestamptz`), logic often relies on the user's stored `timezone` preference.

---

## 2. Table Reference

### `public.users`
**Role:** The central profile table. Syncs with `auth.users` (Supabase Auth).
**One-to-One** with `auth.users`.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | **PK, FK**. Linked to `auth.users.id`. |
| `email` | `text` | NO | User's email (Unique). |
| `username` | `text` | NO | Unique handle for profile URLs (e.g. `/hammaad`). |
| `bio` | `text` | YES | User's markdown bio. |
| `timezone` | `text` | NO | **Critical.** Defaults to `'UTC'`. Used for daily logic. |
| `grace_screen_shown_for_date` | `date` | YES | Tracks if the "Grace Period" screen was shown today. |
| `created_at` | `timestamptz` | NO | Account creation time. |

---

### `public.habits`
**Role:** Stores the definition and streak state of a recurring habit.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK**. Auto-generated. |
| `user_id` | `uuid` | **FK** to `users`. |
| `name` | `text` | Habit title. |
| `current_streak` | `int` | Current active streak count. |
| `last_streak` | `int` | The streak value before the last reset (for motivation). |
| `pile_state` | `text` | Lifecycle state: `NULL` (Active), `'lively'`, or `'junked'`. |
| `junked_at` | `timestamptz`| When it moved to the "Junked" pile. |
| `is_public` | `bool` | Visibility flag. |

---

### `public.habit_completions`
**Role:** An append-only log of every time a user completes a habit. Used for history, charts, and "Grace Period" recovery.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK**. |
| `habit_id` | `uuid` | **FK** to `habits`. |
| `user_id` | `uuid` | **FK** to `users`. |
| `completed_at` | `timestamptz`| When the button was clicked. |
| `mood_score` | `int` | 0-100 score (Fuel Meter). |
| `notes` | `text` | Optional reflection. |

---

### `public.actions` (Replaces Todos)
**Role:** Stores the user's **entire Action Tree** as a single document.
**Pattern:** "Document Store" (One row per user).

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK**. |
| `user_id` | `uuid` | **FK** to `users`. **UNIQUE constraint**. |
| `data` | `jsonb` | **The Tree.** Contains the nested array of action nodes. |

**Why JSONB?**
*   Allows **Unlimited Deep Nesting** (Parent -> Child -> Grandchild...).
*   Fetching is a single fast query (`select data from actions where user_id = ...`).
*   Updates are atomic (save the whole tree).

**JSON Structure Node:**
```json
{
  "id": "uuid",
  "description": "Buy Milk",
  "completed": true,
  "is_public": true,
  "completed_at": "2023-10-27T10:00:00Z",
  "children": [ ...recursive nodes... ]
}
```

---

### `public.journal_entries`
**Role:** Daily text entries. One entry per date per user.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK**. |
| `user_id` | `uuid` | **FK** to `users`. |
| `entry_date` | `date` | The logical date of the entry (e.g. '2023-10-27'). |
| `content` | `text` | Markdown content. |
| `is_public` | `bool` | Default `false`. |

---

## 3. Security Policies (RLS)

We use a highly optimized RLS strategy.

**The Golden Rule:**
> `USING ((select auth.uid()) = user_id)`

**Why the `(select ...)`?**
Standard RLS like `auth.uid() = user_id` runs the `auth.uid()` function for *every single row* scanned. By wrapping it in a subquery, Postgres executes it **once**, caches the ID, and reuses it. This is a massive performance optimization for scale.

**Policies applied to ALL tables:**
1.  **SELECT:** Can view own data.
2.  **INSERT:** Can insert with own `user_id`.
3.  **UPDATE:** Can update own rows.
4.  **DELETE:** Can delete own rows.

---

## 4. Triggers & Functions

### `handle_new_user`
*   **Trigger:** `AFTER INSERT ON auth.users`
*   **Action:** Automatically creates a row in `public.users` with the same ID and email.
*   **Logic:** Generates a unique `username` (e.g. `john_doe` or `john_doe_123` if taken).

### `update_updated_at_column`
*   **Trigger:** `BEFORE UPDATE` (On `users`, `actions`, `habits`)
*   **Action:** Sets `updated_at = now()`. Keeps timestamps fresh without client intervention.
