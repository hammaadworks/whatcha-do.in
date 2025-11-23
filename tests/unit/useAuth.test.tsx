// tests/unit/useAuth.test.tsx
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';

// Mock the Supabase User type for consistency
const MOCK_USER: User = {
  id: "68be1abf-ecbe-47a7-bafb-46be273a2e",
  email: "hammaadworks@gmail.com",
  aud: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('useAuth Hook', () => {
  // Wrapper component to provide the AuthContextProvider
  const createWrapper = (initialUser?: User | null) => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
    };
  };

  beforeEach(() => {
    // Reset environment variable before each test
    delete process.env.NEXT_PUBLIC_DEV_MODE_ENABLED;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial loading state as true', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    jest.runAllTimers();
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should inject mock user when NEXT_PUBLIC_DEV_MODE_ENABLED is true', async () => {
    process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = 'true';

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    jest.runAllTimers(); // Ensure all pending promises are resolved
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(expect.objectContaining({
        id: MOCK_USER.id,
        email: MOCK_USER.email,
      }));
    });
  });

  it('should use initialUser when NEXT_PUBLIC_DEV_MODE_ENABLED is false', async () => {
    process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = 'false';
    const testInitialUser: User = { ...MOCK_USER, id: 'test-initial-user-id', email: 'test@example.com' };

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(testInitialUser) });

    jest.runAllTimers(); // Ensure all pending promises are resolved
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(expect.objectContaining({
        id: testInitialUser.id,
        email: testInitialUser.email,
      }));
    });
  });

  it('should return null user when NEXT_PUBLIC_DEV_MODE_ENABLED is false and no initialUser', async () => {
    process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = 'false';

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(null) });

    jest.runAllTimers(); // Ensure all pending promises are resolved
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it('should prioritize mock user over initialUser if dev mode is enabled', async () => {
    process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = 'true';
    const testInitialUser: User = { ...MOCK_USER, id: 'test-initial-user-id', email: 'test@example.com' };

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(testInitialUser) });

    jest.runAllTimers(); // Ensure all pending promises are resolved
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(expect.objectContaining({
        id: MOCK_USER.id, // Should be mock user's ID, not initialUser's
        email: MOCK_USER.email,
      }));
    });
  });

  it('should throw error if useAuth is not used within AuthContextProvider', () => {
    // Temporarily disable console.error to avoid test noise from expected error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth()))
      .toThrow('useAuth must be used within an AuthContextProvider');
    
    consoleErrorSpy.mockRestore();
  });
});
