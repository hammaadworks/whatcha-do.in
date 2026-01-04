# Security Strategy: Pro Status & Entitlements

## Vulnerability
The application previously used a "read-through" cache for the user profile in `localStorage`. If a user manually edited this storage to set `is_pro: true`, the client-side application would trust it and unlock Pro features (Themes, Media Uploads) in the UI.

## Mitigation Strategy

### 1. Trusted Source of Truth (Database)
We have modified the `AuthProvider` to **never trust the client-side cache** for entitlement checks (`is_pro`, `purchased_themes`).

- **Previous Logic:** Check Cache -> If exists, Return Cache -> Skip DB.
- **New Logic:** Always fetch from Supabase DB -> Update Cache -> Return DB Data.

This ensures that every time the user session initializes (page load/reload), the application queries the authoritative database state. If the user tampers with `localStorage`, it is ignored or overwritten immediately.

### 2. Fail-Closed Fallback
In the event of a database failure (offline/network error), the application falls back to the cache to allow basic functionality (displaying username/bio). However, for security:
- `is_pro` is forced to `false`.
- `purchased_themes` is forced to `[]`.

This "Fail-Closed" mechanism ensures that an offline attacker cannot spoof entitlements. Legitimate Pro users will need to be online to verify their status, which is a standard security tradeoff.

### 3. Server-Side Action Validation
Client-side checks are UX sugar. The real enforcement must happen on the server.
- **Media Uploads:** The `uploadJournalMedia` function (and underlying Storage Policies) must check `is_pro` column in the `users` table via RLS or function logic.
- **Theme Purchasing:** The `purchaseTheme` server action verifies the user session and logic on the server.

## Future Improvements
- **Signed Claims:** If offline Pro access is required, we could sign the `is_pro` claim with a server secret (JWT) and store that. The client can verify the signature. Currently, we rely on online verification.
