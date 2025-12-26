// vitest.setup.ts
// This file can be used for global test setup, e.g., mocking browser APIs
import '@testing-library/jest-dom';

// Mock environment variables for Supabase client
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'; // Dummy URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy_anon_key'; // Dummy key

// Mock uuid to avoid ESM issues in Jest environment
jest.mock('uuid', () => ({ v4: () => 'mock-uuid-v4' }));

// Global mock for next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
}));