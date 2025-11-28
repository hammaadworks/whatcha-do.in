// vitest.setup.ts
// This file can be used for global test setup, e.g., mocking browser APIs
import '@testing-library/jest-dom';

// Mock environment variables for Supabase client
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'; // Dummy URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy_anon_key'; // Dummy key