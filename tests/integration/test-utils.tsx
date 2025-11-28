import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider } from '@/components/auth/AuthProvider'; // Keep import for type inference if needed
import { User } from '@supabase/supabase-js';

// Mock the useAuth hook directly for tests
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>, // Provide a dummy AuthProvider
}));

// Import the mocked useAuth
import { useAuth } from '@/hooks/useAuth';

interface RenderOptions {
  mockUser?: User | null;
  loading?: boolean;
  isOwner?: boolean;
  theme?: 'light' | 'dark';
}

const customRender = (
  ui: React.ReactElement,
  { mockUser = null, loading = false, theme = 'light', isOwner, ...renderOptions }: RenderOptions = {}
) => {
  // Mock the useAuth implementation for each render
  (useAuth as jest.Mock).mockReturnValue({
    user: mockUser,
    loading: loading,
  });

  // Manually set the class on the body for theme testing
  document.body.className = theme === 'dark' ? 'dark' : '';

  // Render the UI directly. The components under test will use the mocked useAuth.
  return rtlRender(ui, renderOptions);
};

export * from '@testing-library/react';
export { customRender as render };
