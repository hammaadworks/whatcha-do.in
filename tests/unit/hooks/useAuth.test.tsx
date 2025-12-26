import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

// Mock the Supabase client
jest.mock('@/lib/supabase/client');

describe('useAuth Hook & AuthProvider', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  };

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockProfile = {
    username: 'testuser',
    timezone: 'UTC',
    bio: 'Hello World',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Default mock implementation
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    
    // Mock chainable query builder
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();
    
    mockSupabase.from.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
  });

  test('should throw error if used outside AuthProvider', () => {
    // Console error suppression because React logs the error
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthContextProvider');

    console.error = originalError;
  });

  test('should initialize with loading state then resolve to null user if no session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for async effect
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  test('should fetch session and profile on mount', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({
      ...mockSession.user,
      ...mockProfile,
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('users');
  });

  test('should handle dev mode user', async () => {
    process.env.NEXT_PUBLIC_DEV_USER = 'devuser';
    const devUser = { ...mockSession.user, id: '68be1abf-ecbe-47a7-bafb-46be273a2e' };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: devUser } } });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user?.username).toBe('devuser');
    
    // Clean up env
    delete process.env.NEXT_PUBLIC_DEV_USER;
  });
});
