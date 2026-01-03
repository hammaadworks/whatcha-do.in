# Authentication & Security System Guide

This document details the modular authentication system implemented in *whatcha-do.in*. It is designed to be a portable, "drop-in" package for future Next.js + Supabase applications, covering Magic Links, Password Auth, Cross-Device QR Login, and Account Security.

---

## 1. System Overview

The authentication system is built on **Supabase Auth** but extends it with a custom UI and logic layer to support:

1.  **Hybrid Login:** Users can choose between **Email Magic Links** (passwordless) or traditional **Passwords**.
2.  **Cross-Device QR Login:** A logged-in device can generate a QR code containing a secure, short-lived magic link. A new device scans this to log in instantly without typing credentials.
3.  **Account Security:** A self-contained settings module for updating passwords and handling account deletion.
4.  **Environment Awareness:** Logic automatically adapts to `localhost` vs. production domains for redirect URLs.

---

## 2. Architecture & File Structure

The system is modularized into a `packages/auth` directory (or similar structure in your target project).

### 📂 `packages/auth` (The Package)

*   `README.md`: Instructions for installation and usage.
*   **`components/`** (UI Layer):
    *   `Logins.tsx`: The main entry point. Handles the "Unauthenticated" state (Forms) and "Authenticated" state (QR Generation).
    *   `DeviceConnect.tsx`: Generates and displays the login QR code for authenticated users.
    *   `DeviceScanner.tsx`: Handles the camera logic for scanning QR codes on new devices.
    *   `UserSecurity.tsx`: The "Settings" panel. Handles password updates and the "Danger Zone" (Account Deletion).
    *   `AuthProvider.tsx`: React Context provider that manages global user state (`user`, `loading`, `refreshUser`).
*   **`hooks/`** (State Layer):
    *   `useAuth.tsx`: The consumer hook for accessing the `AuthContext`.
*   **`actions/`** (Server Actions):
    *   `auth-qr.ts`: **Critical.** Contains `generateMagicLinkForQR`. It uses the Supabase Admin client to generate links on behalf of the user.
    *   `auth-profile.ts`: Handles sensitive account operations like `deleteAccount`.

---

## 3. Porting Guide (How to Reuse)

### Step 1: Dependencies
Ensure your new project has the following packages installed:

```bash
npm install @supabase/supabase-js @supabase/ssr qrcode.react @yudiel/react-qr-scanner sonner lucide-react
```

### Step 2: Environment Variables
The system relies on standard Supabase keys.

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Required for QR generation & Deletion
```

### Step 3: Global Provider
Wrap your root layout with `AuthProvider`.

```tsx
// app/layout.tsx
import { AuthProvider } from "@/packages/auth/components/AuthProvider"; // Adjust path as needed

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 4: Database Schema
Ensure your Supabase `users` table exists and is linked to `auth.users` via triggers. The `AuthProvider` expects a `users` table to fetch profile data (username, settings, etc.).

---

## 4. Feature Implementation Details

### A. The "Logins" Page
The `Logins.tsx` component is smart. It detects the user's state:

*   **If Logged Out:** It renders the `Tabs` interface (Magic Link, Password, Scan QR).
*   **If Logged In:** It automatically renders the `DeviceConnect` component (showing the QR code) and a "Log Out" button.

**Usage:** Simply render `<Logins />` on your `/login` or `/auth` page.

### B. Cross-Device QR Login (The "Magic" Part)
This flow allows a user on Desktop to log in on Mobile instantly.

1.  **Generator (Desktop):**
    *   Calls `generateMagicLinkForQR` (Server Action).
    *   Server uses `admin.auth.generateLink({ type: 'magiclink', ... })`.
    *   **Crucial:** The `redirectTo` is dynamically built using headers to support both `localhost:3000` and `production-domain.com`.
    *   Returns the magic link URL to the client.
    *   `DeviceConnect` renders this URL into a QR code.

2.  **Scanner (Mobile):**
    *   User opens the "Scan QR" tab.
    *   `DeviceScanner` reads the QR code.
    *   On success, it redirects the browser to the embedded magic link.
    *   Supabase handles the session creation via the standard PKCE flow.

### C. User Security Settings
The `<UserSecurity />` component is a self-contained "Account Settings" block. It does not require any props.

*   **Password Update:** Checks for min-length and updates via `supabase.auth.updateUser`.
*   **Delete Account:**
    *   Triggers a confirmation dialog.
    *   Calls `deleteAccount` (Server Action).
    *   Server Action uses `admin.auth.deleteUser(id)` to remove the auth record.
    *   **Note:** You must handle cascading deletes in your database (e.g., `ON DELETE CASCADE` for user data) to clean up public tables.

---

## 5. Customization

*   **Styling:** All components use `Tailwind CSS` and `lucide-react` icons. They are compatible with `shadcn/ui` theming variables (`bg-primary`, `text-muted-foreground`).
*   **Redirects:** Configure `DEFAULT_POST_LOGIN_REDIRECT` in `lib/constants.ts` to control where users go after a successful login.
*   **Email Templates:** Customize the Magic Link email template in the Supabase Dashboard -> Authentication -> Email Templates.

---

## 6. Troubleshooting

*   **QR Code Not Working on Prod:** Ensure your production domain is added to the "Redirect URLs" whitelist in Supabase Auth settings.
*   **"User not found" in `deleteAccount`:** Ensure the `SUPABASE_SERVICE_ROLE_KEY` is correctly set in your production environment variables.
*   **Scanner Camera Issues:** The `DeviceScanner` requires a secure context (HTTPS) to access the camera. It will not work on non-secure HTTP origins (except localhost).