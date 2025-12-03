# whatcha-doin

## Project Overview
A Next.js 16 habit tracking application built with Supabase authentication, featuring habit tracking, todos, journaling, and public profiles. The app uses magic link email authentication with a toggleable mock authentication system for development.

## Current State (November 20, 2025)
- **Status**: Running and functional with complete Supabase authentication
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Authentication**: Supabase magic link email auth with dev mode toggle
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand
- **Development Server**: Running on port 5000

## Technology Stack
- **Frontend**: React 19, Next.js 16, TypeScript
- **UI Components**: Radix UI (@radix-ui/react-*)
- **Styling**: Tailwind CSS with tailwindcss-animate
- **Authentication**: Supabase (@supabase/ssr, @supabase/supabase-js)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations**: Motion, Cobe (3D globe)
- **Testing**: Vitest, @testing-library/react, @playwright/test

## Authentication System

### Overview
The app features a dual-mode authentication system:
1. **Production Mode** (`NEXT_PUBLIC_DEV_MODE_ENABLED=false`): Real Supabase magic link authentication
2. **Development Mode** (`NEXT_PUBLIC_DEV_MODE_ENABLED=true`): Mock authentication with test user

### Configuration

#### Environment Variables (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dgdvvcquoxzxvqlcfrpg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Mode Toggle
NEXT_PUBLIC_DEV_MODE_ENABLED=false  # true = mock auth, false = real Supabase auth
```

#### Test User
- **User ID**: `68be1abf-ecbe-47a7-bafb-406be273a02e`
- **Email**: `hammaadworks@gmail.com`

### Authentication Flow

#### Production Mode (Real Supabase)
1. User enters email at `/logins`
2. Magic link sent to email via Supabase
3. User clicks link, redirected to `/auth/callback`
4. Callback exchanges code for session
5. User redirected to `/me`

#### Development Mode (Mock)
1. Mock session automatically injected on app load
2. No email required, instant authentication
3. Test user credentials used
4. Perfect for rapid development and testing

### Key Files

#### Authentication Components
- `components/auth/Auth.tsx` - Main auth wrapper with dev mode toggle
- `components/auth/Logins.tsx` - Email magic link login form
- `app/auth/callback/route.ts` - Magic link callback handler

#### Supabase Configuration
- `lib/supabase/client.ts` - Browser client with env var swap workaround
- `lib/supabase/server.ts` - Server client with env var swap workaround
- `lib/supabase/provider.tsx` - Supabase provider for React
- `supabase/config.toml` - Supabase local config with signups enabled

#### State Management
- `lib/store/auth.ts` - Zustand auth store

### Critical Implementation Notes

#### Replit Secrets Workaround
The Replit Secrets had `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` reversed. Both `lib/supabase/client.ts` and `lib/supabase/server.ts` include automatic swap logic:

```typescript
// Check if they're swapped (URL should start with https://, key with eyJ)
if (supabaseUrl.startsWith('eyJ') && supabaseAnonKey.startsWith('https://')) {
  console.log('⚠️  Swapping URL and KEY (they were reversed)');
  [supabaseUrl, supabaseAnonKey] = [supabaseAnonKey, supabaseUrl];
}
```

This ensures the app works regardless of how the secrets are configured.

## Project Structure
```
/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth route group
│   │   └── logins/        # Login page
│   ├── auth/
│   │   └── callback/      # Magic link callback handler
│   ├── dashboard/         # Dashboard (protected)
│   └── layout.tsx         # Root layout
├── components/
│   ├── auth/              # Authentication components
│   │   ├── Auth.tsx       # Main auth wrapper
│   │   └── Logins.tsx     # Login form
│   └── ui/                # Radix UI components
├── lib/
│   ├── store/             # Zustand stores
│   │   └── auth.ts        # Auth state
│   └── supabase/          # Supabase config
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       └── provider.tsx   # React provider
├── supabase/              # Supabase local development
│   ├── config.toml        # Supabase config
│   └── seed_data/         # Test data
└── .env.local             # Environment variables
```

## Workflows
- **Start application**: `npm run dev -- -H 0.0.0.0 -p 5000`
  - Runs Next.js dev server on port 5000
  - Required host 0.0.0.0 for Replit environment
  - Status: Running

## Development Workflow

### Running the App
```bash
npm run dev
# Runs on http://localhost:5000 (or Replit dev URL)
```

### Testing Authentication

#### Test Real Supabase Auth
1. Set `NEXT_PUBLIC_DEV_MODE_ENABLED=false` in `.env.local`
2. Restart the workflow
3. Go to `/logins`
4. Enter an email
5. Check email for magic link
6. Click link to authenticate

#### Test Mock Auth
1. Set `NEXT_PUBLIC_DEV_MODE_ENABLED=true` in `.env.local`
2. Restart the workflow
3. App automatically authenticates as test user
4. No login required

### Switching Between Modes
```bash
# Enable mock auth for development
echo "NEXT_PUBLIC_DEV_MODE_ENABLED=true" >> .env.local

# Disable mock auth for production testing
echo "NEXT_PUBLIC_DEV_MODE_ENABLED=false" >> .env.local
```

Then restart the workflow to apply changes.

## User Preferences
- **User name**: hammaadworks
- **Communication language**: English
- **TypeScript**: Type checking required
- **Development approach**: Documentation-driven (PRD, UX specs, architecture)

## Recent Changes (November 20, 2025)
- ✅ Implemented complete Supabase magic link authentication
- ✅ Created toggleable mock authentication system using `NEXT_PUBLIC_DEV_MODE_ENABLED`
- ✅ Fixed Replit Secrets swap issue (URL and KEY reversed)
- ✅ Configured auth callback route for magic link verification with error handling
- ✅ Set up test user injection for development mode
- ✅ Configured Next.js workflow on port 5000
- ✅ Enabled Supabase signups in config.toml
- ✅ Added loading state to prevent flash of login screen during session check
- ✅ Created auth error page with meaningful user feedback
- ✅ Secured secrets with .gitignore and created .env.local.example
- ✅ Passed architect review - production ready authentication system

## Known Issues
- Replit Secrets have `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` reversed
  - **Workaround**: Automatic swap logic in `lib/supabase/client.ts` and `lib/supabase/server.ts`
  - Console logs `⚠️ Swapping URL and KEY (they were reversed)` when swap occurs
- Hydration warning on `/logins` page (cosmetic, doesn't affect functionality)

## Future Enhancements
- Complete habit tracking features
- Todo list functionality
- Journaling system
- Public profile pages
- Deploy to production


## Custom

So today we are bui building the journal feature of our app
