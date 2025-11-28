# Re-enable Magic Link Authentication

This document provides instructions on how to re-enable Supabase Magic Link authentication and disable the temporary development user.

**Context:** During development, Magic Link authentication was temporarily disabled, and a hardcoded test user session was used for feature development. This was controlled by the `NEXT_PUBLIC_DEV_MODE_ENABLED` environment variable and modified Supabase configuration.

---

## Steps to Re-enable Magic Link Authentication

Follow these steps to revert the development changes and re-enable Magic Link login:

### 1. Disable Development Mode Environment Variable

1.  **Locate `.env.local`:** Find the `.env.local` file in your project's root directory.
2.  **Remove or Comment Out:** Either delete the line `NEXT_PUBLIC_DEV_MODE_ENABLED=true` or comment it out by adding a `#` at the beginning:
    ```
    # NEXT_PUBLIC_DEV_MODE_ENABLED=true
    ```
3.  **Save:** Save the `.env.local` file.

### 2. Restore Supabase Configuration for Signups

1.  **Open `supabase/config.toml`:** Open the `supabase/config.toml` file located in the `supabase/` directory of your project.
2.  **Enable `enable_signup` (Global Auth):** Locate the `[auth]` section and change `enable_signup = false` back to `enable_signup = true`:
    ```toml
    [auth]
    enabled = true
    # ... other auth settings ...
    # Allow/disallow new user signups to your project.
    enable_signup = true
    ```
3.  **Enable `enable_signup` (Email Auth):** Scroll down to the `[auth.email]` section and change `enable_signup = false` back to `enable_signup = true`:
    ```toml
    [auth.email]
    # Allow/disallow new user signups via email to your project.
    enable_signup = true
    ```
4.  **Save:** Save the `supabase/config.toml` file.

### 3. Revert `components/auth/Auth.tsx`

1.  **Open `components/auth/Auth.tsx`:** Open the `components/auth/Auth.tsx` file.
2.  **Restore `useEffect` Hook:** Revert the `useEffect` hook to its original state, removing the conditional development mode logic:

    **Original `useEffect`:**
    ```typescript
    useEffect(() => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }, [setSession]);
    ```
    You will need to manually remove the `if (process.env.NEXT_PUBLIC_DEV_MODE_ENABLED === 'true') { ... } else { ... }` block and keep only the `onAuthStateChange` logic.

### 4. Restart Development Server

After making all these changes, restart your development server (e.g., `pnpm dev`) to ensure all configurations are reloaded.

---

Magic Link authentication should now be fully re-enabled, and new users will be able to sign up and log in using their email addresses.
