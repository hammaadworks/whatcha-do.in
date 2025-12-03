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
  const createWrapper = () => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return <AuthProvider>{children}</AuthProvider>;
    };
  };

  beforeEach(() => {
    // Mock Supabase client and its methods
    jest.mock('@/lib/supabase/client', () => ({
      createClient: jest.fn(() => ({
        auth: {
          getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
          onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })),
    }));

    // Reset environment variable before each test
    delete process.env.NEXT_PUBLIC_DEV_MODE_ENABLED;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial loading state as true and then false with null user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    jest.runAllTimers();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it('should inject mock user when NEXT_PUBLIC_DEV_MODE_ENABLED is true', async () => {
    process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = 'true';

    // Mock supabase.auth.getSession to return null session so dev mode can take over
    const mockGetSession = jest.fn(() => Promise.resolve({ data: { session: null }, error: null }));
    require('@/lib/supabase/client').createClient.mockImplementation(() => ({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    }));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    jest.runAllTimers();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      // Mock user is hardcoded in AuthProvider, so we check for that
      expect(result.current.user).toEqual(expect.objectContaining({
        id: "68be1abf-ecbe-47a7-bafb-46be273a2e",
        email: "hammaadworks@gmail.com",
      }));
    });
    expect(mockGetSession).toHaveBeenCalled(); // Should still try to get session
  });

  it('should fetch user from session and profile from users table', async () => {
    const mockSessionUser = { ...MOCK_USER, id: 'session-user-id', email: 'session@example.com' };
    const mockProfileData = { username: 'sessionuser', timezone: 'America/New_York' };
    const expectedUser = { ...mockSessionUser, ...mockProfileData };

    // Mock supabase.auth.getSession to return a session
    const mockGetSession = jest.fn(() => Promise.resolve({ data: { session: { user: mockSessionUser } }, error: null }));
    // Mock supabase.from('users').select().eq().single() to return profile data
    const mockFetchProfile = jest.fn(() => Promise.resolve({ data: mockProfileData, error: null }));

    require('@/lib/supabase/client').createClient.mockImplementation(() => ({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: mockFetchProfile,
          })),
        })),
      })),
    }));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    jest.runAllTimers();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(expect.objectContaining(expectedUser));
    });
    expect(mockGetSession).toHaveBeenCalled();
    expect(mockFetchProfile).toHaveBeenCalledWith('id', 'session-user-id');
  });

  it('should return null user if no session is found', async () => {
    // getSession already mocked to return null session in beforeEach

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    jest.runAllTimers();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it('refreshUser should re-fetch and update user data', async () => {
    const initialSessionUser = { ...MOCK_USER, id: 'initial-user-id', email: 'initial@example.com' };
    const initialProfileData = { username: 'initial', timezone: 'Europe/London' };
    const refreshedSessionUser = { ...MOCK_USER, id: 'refreshed-user-id', email: 'refreshed@example.com' };
    const refreshedProfileData = { username: 'refreshed', timezone: 'Asia/Tokyo' };

    // Mock getSession to return initial user, then refreshed user
    const mockGetSession = jest.fn()
      .mockResolvedValueOnce({ data: { session: { user: initialSessionUser } }, error: null })
      .mockResolvedValueOnce({ data: { session: { user: refreshedSessionUser } }, error: null });
    
    // Mock fetchProfile to return initial profile, then refreshed profile
    const mockFetchProfile = jest.fn()
      .mockResolvedValueOnce({ data: initialProfileData, error: null })
      .mockResolvedValueOnce({ data: refreshedProfileData, error: null });

    require('@/lib/supabase/client').createClient.mockImplementation(() => ({
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: mockFetchProfile,
          })),
        })),
      })),
    }));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    jest.runAllTimers();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(expect.objectContaining({ ...initialSessionUser, ...initialProfileData }));
    });

    // Call refreshUser
    result.current.refreshUser();

    jest.runAllTimers();
    await waitFor(() => {
      expect(result.current.loading).toBe(false); // Should still be false after refresh
      expect(result.current.user).toEqual(expect.objectContaining({ ...refreshedSessionUser, ...refreshedProfileData }));
    });
    expect(mockGetSession).toHaveBeenCalledTimes(2);
    expect(mockFetchProfile).toHaveBeenCalledTimes(2);
  });


  it('should throw error if useAuth is not used within AuthContextProvider', () => {
    // Temporarily disable console.error to avoid test noise from expected error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth()))
      .toThrow('useAuth must be used within an AuthContextProvider');
    
    consoleErrorSpy.mockRestore();
  });
});
