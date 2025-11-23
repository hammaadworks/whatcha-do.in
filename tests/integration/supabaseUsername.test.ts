import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(),
    })),
  })),
}));

describe('Supabase Username Generation Logic', () => {
  let mockSupabase: { from: jest.Mock; };
  let mockExistingUsernames: Set<string>;
  let mockInsert: jest.Mock;

  beforeEach(() => {
    mockExistingUsernames = new Set<string>();
    mockInsert = jest.fn(async (data: Partial<SupabaseUser> & { username?: string }) => {
      if (data.username) {
        mockExistingUsernames.add(data.username);
        return { data, error: null };
      }
      return { data: null, error: new Error('Username not provided') };
    });

    mockSupabase = {
      from: jest.fn((tableName: string) => ({
        select: jest.fn(() => ({
          eq: jest.fn((column: string, value: string) => ({
            single: jest.fn(async () => {
              if (tableName === 'users' && column === 'username') {
                return {
                  data: mockExistingUsernames.has(value) ? { username: value } : null,
                  error: null,
                };
              }
              return { data: null, error: null };
            }),
          })),
        })),
        insert: mockInsert, // Assign the globally declared mockInsert here
      })),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  // Helper to simulate the PostgreSQL handle_new_user function logic
  const simulateHandleNewUser = async (newUser: SupabaseUser & { email: string }) => {
    const usernameBase = newUser.email.split('@')[0].toLowerCase();
    let proposedUsername = usernameBase;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // Prevent infinite loops in edge cases

    do {
      // Simulate check_username_uniqueness
      const { data: existingUser } = await mockSupabase.from('users').select('username').eq('username', proposedUsername).single();
      const isReserved = ['auth', 'dashboard', 'journal', 'grace-period', 'api', 'profile'].includes(proposedUsername);
      isUnique = !existingUser && !isReserved;

      if (!isUnique) {
        const randomSuffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        proposedUsername = `${usernameBase}_${randomSuffix}`;
      }
      attempts++;
    } while (!isUnique && attempts < MAX_ATTEMPTS);

    if (!isUnique) {
        throw new Error("Could not generate a unique username after multiple attempts.");
    }

    // Simulate insert into public.users
    await mockSupabase.from('users').insert({ id: newUser.id, email: newUser.email, username: proposedUsername });
    return proposedUsername;
  };

  it('should generate a unique username from email for a new user', async () => {
    const newUser = {
      id: 'user-1',
      email: 'testuser@example.com',
    } as SupabaseUser & { email: string };

    const username = await simulateHandleNewUser(newUser);

    expect(username).toBe('testuser');
    expect(mockExistingUsernames.has('testuser')).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'testuser@example.com',
      username: 'testuser',
    });
  });

  it('should append a random suffix if the base username is already taken', async () => {
    mockExistingUsernames.add('existinguser'); // Simulate existing username

    const newUser = {
      id: 'user-2',
      email: 'existinguser@example.com',
    } as SupabaseUser & { email: string };

    const username = await simulateHandleNewUser(newUser);
    console.log("Existing username + mod = " + username);
    expect(username).toMatch(/^existinguser_[0-9]{3}$/);
    expect(mockExistingUsernames.has(username)).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'user-2',
      email: 'existinguser@example.com',
      username: username,
    });
  });

  it('should handle reserved usernames by appending a random suffix', async () => {
    const newUser = {
      id: 'user-3',
      email: 'auth@example.com', // A reserved username
    } as SupabaseUser & { email: string };

    const username = await simulateHandleNewUser(newUser);
    console.log("Reserved username + mod = " + username);

    expect(username).toMatch(/^auth_[0-9]{3}$/);
    expect(mockExistingUsernames.has(username)).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'user-3',
      email: 'auth@example.com',
      username: username,
    });
  });

  it('should handle multiple collisions gracefully', async () => {
    mockExistingUsernames.add('collision');
    mockExistingUsernames.add('collision_123'); // Simulate a collision with a generated suffix

    const newUser = {
      id: 'user-4',
      email: 'collision@example.com',
    } as SupabaseUser & { email: string };

    const username = await simulateHandleNewUser(newUser);
    console.log("Collisions username + mod = " + username);

    // Expecting a generated username that is not 'collision' or 'collision_123'
    expect(username).toMatch(/^collision_[0-9]{3}$/);
    expect(username).not.toBe('collision');
    expect(username).not.toBe('collision_123');
    expect(mockExistingUsernames.has(username)).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'user-4',
      email: 'collision@example.com',
      username: username,
    });
  });

  it('should convert email local part to lowercase for username', async () => {
    const newUser = {
      id: 'user-5',
      email: 'TestUser@example.com',
    } as SupabaseUser & { email: string };

    const username = await simulateHandleNewUser(newUser);

    expect(username).toBe('testuser');
    expect(mockExistingUsernames.has('testuser')).toBe(true);
  });
});
