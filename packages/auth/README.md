# Supabase Auth Package

A modular, drop-in authentication system for Next.js applications using Supabase.

## Features

- **Hybrid Login:** Email Magic Links & Password support.
- **Cross-Device Login:** QR code login for instant mobile access.
- **Account Security:** Password updates and account deletion.
- **Ready-to-use UI:** Polished components built with Tailwind & Lucide React.
- **Optimized:** Includes efficient Supabase clients for both Client and Server environments.

## Installation

1. **Copy the Package:**
   Copy the `packages/auth` directory to your project (e.g., `lib/auth` or `components/auth-package`).

2. **Dependencies:**
   Ensure your project has the following dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr qrcode.react @yudiel/react-qr-scanner sonner lucide-react
   ```

3. **Environment Variables:**
   Required in your `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=... # For QR generation & account deletion
   ```

4. **Integration:**

   **Global Provider:**
   Wrap your root layout with `AuthProvider`:
   ```tsx
   import { AuthProvider } from "./packages/auth/components/AuthProvider";

   export default function RootLayout({ children }) {
     return (
       <AuthProvider>
         {children}
       </AuthProvider>
     );
   }
   ```

   **Login Page:**
   Render the `Logins` component:
   ```tsx
   import Logins from "./packages/auth/components/Logins";

   export default function Page() {
     return <Logins />;
   }
   ```

   **Settings / Security:**
   Render the `UserSecurity` component:
   ```tsx
   import { UserSecurity } from "./packages/auth/components/UserSecurity";

   export default function Settings() {
     return <UserSecurity />;
   }
   ```

## Included Supabase Clients

This package includes efficient Supabase client factories in `packages/auth/lib/supabase/`. You can import and use them in your own application code to avoid duplication:

```tsx
// Client Components
import { createClient } from "@/packages/auth/lib/supabase/client";

// Server Components / Actions
import { createServerSideClient } from "@/packages/auth/lib/supabase/server";

// Admin / Service Role
import { createAdminClient } from "@/packages/auth/lib/supabase/admin";
```

## Customization

- **UI Components:** The UI relies on `components/ui` (shadcn/ui). If you use a different library, update the imports in `packages/auth/components`.