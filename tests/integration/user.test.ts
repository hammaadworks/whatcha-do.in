import { vi, test, expect } from 'vitest';
import { updateUserBio, getUserProfile, getPublicProfileData } from '@/lib/supabase/user';

vi.mock('@/lib/supabase/client', () => {
  const mockSingle = vi.fn();

  const mockEqChain: any = {
    eq: vi.fn((column, value) => mockEqChain),
    single: mockSingle,
  };

  const mockEq = vi.fn((column, value) => mockEqChain);

  const mockUpdate = vi.fn((updates) => ({
    eq: mockEq,
  }));

  const mockFrom = vi.fn((table) => ({
    update: mockUpdate,
    select: vi.fn(() => ({ eq: mockEq, single: mockSingle }))
  }));

  const supabase = {
    from: mockFrom,
    auth: {
      signUp: vi.fn(),
    },
  };
  return {
    supabaseClient: supabase,
    mockSingle: mockSingle,
  };
});

import { supabaseClient, mockSingle } from '@/lib/supabase/client';

test('updateUserBio updates the bio for a user', async () => {
  const testUser = { id: '123', email: 'test@example.com' };
  const newBio = 'This is a test bio.';

  supabaseClient.auth.signUp.mockResolvedValue({
    data: { user: testUser },
    error: null,
  });
  supabaseClient.from('users').update({}).eq('id', '123');
  mockSingle.mockResolvedValue({
    data: { bio: newBio },
    error: null,
  });

  const {
    data: { user },
  } = await supabaseClient.auth.signUp({
    email: `test-${Date.now()}@example.com`,
    password: 'password',
  });

  if (!user) {
    throw new Error('Failed to create a test user.');
  }

  const { error } = await updateUserBio(user.id, newBio);

  expect(error).toBeNull();

  const { data: profile } = await getUserProfile(user.id);
  expect(profile?.bio).toBe(newBio);
});

test('getPublicProfileData only fetches public data', async () => {
  const testUser = {
    id: '123',
    bio: 'Public bio',
  };

  mockSingle.mockResolvedValue({
    data: {
      bio: testUser.bio,
      habits: [{ id: 'h1', name: 'Public Habit' }],
      todos: [{ id: 't1', task: 'Public Todo' }],
      journal_entries: [{ id: 'j1', content: 'Public Entry' }],
    },
    error: null,
  });

  const { data: profile, error } = await getPublicProfileData(testUser.id);

  expect(error).toBeNull();
  expect(profile?.bio).toBe(testUser.bio);
  expect(profile?.habits).toHaveLength(1);
  expect(profile?.habits[0].name).toBe('Public Habit');
  expect(profile?.todos).toHaveLength(1);
  expect(profile?.todos[0].task).toBe('Public Todo');
  expect(profile?.journal_entries).toHaveLength(1);
  expect(profile?.journal_entries[0].content).toBe('Public Entry');
});