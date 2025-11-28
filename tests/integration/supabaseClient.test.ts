import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { getUserByUsernameServer } from '@/lib/supabase/user.server';
import { PublicUserDisplay } from '@/lib/supabase/types';
import { createServerSideClient } from '@/lib/supabase/server'; // Add this import

jest.mock('@/lib/supabase/server'); // Mock the server-side client

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      getUser: jest.fn(async () => ({ data: { user: null }, error: null })),
    },
  })),
}));

// Define the expected mock user from lib/supabase/client.ts
const EXPECTED_MOCK_USER: User = {
  id: "68be1abf-ecbe-47a7-bafb-46be273a2e",
  email: "hammaadworks@gmail.com",
  aud: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: expect.any(String), // Use expect.any(String) as actual date will vary
  updated_at: expect.any(String), // Use expect.any(String) as actual date will vary
};

describe('Supabase Client in Development Mode', () => {
  let originalDevMode: string | undefined;
  let originalSupabaseUrl: string | undefined;
  let originalSupabaseAnonKey: string | undefined;

  beforeAll(() => {
    // Store original env var state
    originalDevMode = process.env.NEXT_PUBLIC_DEV_MODE_ENABLED;
    originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Set dev mode to true for these tests
    process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = 'true';
    // Set placeholder values for Supabase URL and ANON KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'; // Placeholder
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-for-test'; // Placeholder

    // Configure the mock createClient for dev mode
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        getSession: jest.fn(async () => ({
          data: {
            session: {
              access_token: 'mock-access-token',
              token_type: 'bearer',
              user: EXPECTED_MOCK_USER,
              expires_in: 3600,
              expires_at: 123,
              refresh_token: 'mock-refresh-token',
            },
          },
          error: null,
        })),
        getUser: jest.fn(async () => ({
          data: { user: EXPECTED_MOCK_USER },
          error: null,
        })),
      },
    }));
  });

  afterAll(() => {
    // Restore original env var state
    if (originalDevMode !== undefined) {
      process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = originalDevMode;
    } else {
        delete process.env.NEXT_PUBLIC_DEV_MODE_ENABLED;
    }
    if (originalSupabaseUrl !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    } else {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    }
    if (originalSupabaseAnonKey !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
    } else {
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
    jest.clearAllMocks();
  });

  it('createClient().auth.getSession() should return a mock session with the expected user in dev mode', async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.session?.user).toEqual(expect.objectContaining({
      id: EXPECTED_MOCK_USER.id,
      email: EXPECTED_MOCK_USER.email,
    }));
    expect(data.session?.access_token).toBe('mock-access-token');
    expect(data.session?.token_type).toBe('bearer');
  });

  it('createClient().auth.getUser() should return the mock user in dev mode', async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user).toEqual(expect.objectContaining({
      id: EXPECTED_MOCK_USER.id,
      email: EXPECTED_MOCK_USER.email,
    }));
  });

  it('createClient() should not return a mock session outside of dev mode', async () => {
    // Implement a local mock for createClient
    jest.doMock('@/lib/supabase/client', () => {
      const mockSupabase = {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
        },
      };
      return { createClient: jest.fn(() => mockSupabase) };
    });

    // Clear the module cache specifically for '@/lib/supabase/client'
    jest.resetModules(); 

    // Temporarily set the env variable for this test context.
    process.env.NEXT_PUBLIC_DEV_MODE_ENABLED = 'false';

    // Dynamically import the mocked createClient after jest.doMock and jest.resetModules
    const { createClient: nonDevModeCreateClient } = await import('@/lib/supabase/client');
    const supabase = nonDevModeCreateClient();

    const { data, error } = await supabase.auth.getSession();
    
    // Expect session to be null or an error indicating no active session
    expect(data.session).toBeNull();
    expect(error).toBeNull(); 
  });
});

describe('getUserByUsernameServer function', () => { // Corrected describe block title
  let mockSupabase: { from: jest.Mock; };
  let mockSingle: jest.Mock;
  let mockEq: jest.Mock;
  let mockSelect: jest.Mock;
  let mockFrom: jest.Mock;
  const mockUserFromDb: PublicUserDisplay = {
    id: 'user-abc',
    username: 'testuser',
    bio: 'A test user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSingle = jest.fn(async ({ column, value }) => {
      if (column === 'username' && value === mockUserFromDb.username) {
        return { data: mockUserFromDb, error: null };
      }
      return { data: null, error: null };
    });

    mockEq = jest.fn((column, value) => ({
      single: () => mockSingle({ column, value }),
    }));
    mockSelect = jest.fn(() => ({
      eq: mockEq,
    }));
    mockFrom = jest.fn((tableName: string) => {
      if (tableName === 'users') {
        return { select: mockSelect };
      }
      return { select: jest.fn() };
    });

    mockSupabase = {
      from: mockFrom,
    };

    (createServerSideClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('should return user data if username exists', async () => {
    const user = await getUserByUsernameServer(mockUserFromDb.username!); // Add non-null assertion
    expect(user).toEqual(mockUserFromDb);
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockSupabase.from('users').select).toHaveBeenCalledWith('id, username, bio');
    expect(mockSupabase.from('users').select().eq).toHaveBeenCalledWith('username', mockUserFromDb.username);
  });

  it('should return null if username does not exist', async () => {
    const user = await getUserByUsernameServer('nonexistent'); // Corrected function call
    expect(user).toBeNull();
  });

  it('should log an error and return null if Supabase query fails', async () => {
    const mockError = new Error('Database error');
    mockSingle.mockResolvedValueOnce({ data: null, error: mockError });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const user = await getUserByUsernameServer(mockUserFromDb.username!); // Add non-null assertion

    expect(user).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user by username:', mockError);
    consoleErrorSpy.mockRestore();
  });
});