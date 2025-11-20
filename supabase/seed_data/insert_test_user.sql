-- Insert test user for development
-- This user will be used when NEXT_PUBLIC_DEV_MODE_ENABLED=true

-- First, insert into auth.users (this is the Supabase auth table)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  recovery_token
) VALUES (
  '68be1abf-ecbe-47a7-bafb-406be273a02e',
  '00000000-0000-0000-0000-000000000000',
  'hammaadworks@gmail.com',
  crypt('test_password_123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Then insert into public.users (this is the application users table)
-- The trigger should handle this, but we'll insert manually to ensure it exists
INSERT INTO public.users (
  id,
  email,
  bio,
  timezone,
  created_at
) VALUES (
  '68be1abf-ecbe-47a7-bafb-406be273a02e',
  'hammaadworks@gmail.com',
  'Test user for development',
  'UTC',
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();
