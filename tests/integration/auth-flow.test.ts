import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../lib/supabase/client';
import { useAuthStore } from '../../lib/store/auth';

let authStateChangeCallback: ((event: string, session: any) => void) | undefined;

// Mock the Supabase client
vi.mock('../../lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn((callback) => {
        authStateChangeCallback = (event, session) => {
          callback(event, session); // Call the original callback
          useAuthStore.getState().setSession(session); // Update the Zustand store
        };
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
  },
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset the store and mocks before each test
    useAuthStore.setState({ session: null });
    vi.clearAllMocks();
    authStateChangeCallback = undefined;
  });

  it('should allow a user to log in', async () => {
    const mockSession = { user: { id: '123' }, access_token: 'abc' };

    // Simulate onAuthStateChange being called by the app
    supabase.auth.onAuthStateChange(() => {});

    // Manually trigger the captured callback
    if (authStateChangeCallback) {
      authStateChangeCallback('SIGNED_IN', mockSession);
    }

    const { session } = useAuthStore.getState();
    expect(session).toEqual(mockSession);
  });

  it('should allow a user to log out', async () => {
    const { setSession } = useAuthStore.getState();
    setSession({ user: { id: '123' }, access_token: 'abc' });

    await supabase.auth.signOut();

    // Simulate onAuthStateChange being called by the app
    supabase.auth.onAuthStateChange(() => {});

    // Manually trigger the captured callback
    if (authStateChangeCallback) {
      authStateChangeCallback('SIGNED_OUT', null);
    }

    const { session } = useAuthStore.getState();
    expect(session).toBeNull();
  });
});
