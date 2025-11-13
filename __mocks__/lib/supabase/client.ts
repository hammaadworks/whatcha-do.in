import { vi } from 'vitest';

export const mockSignInWithOtp = vi.fn();
export const mockSingle = vi.fn();
export const mockEq = vi.fn(() => ({ single: mockSingle }));
export const mockSelect = vi.fn(() => ({ eq: mockEq }));
export const mockFrom = vi.fn(() => ({
  select: mockSelect,
}));

export const supabase = {
  auth: {
    signInWithOtp: mockSignInWithOtp,
  },
  from: mockFrom,
};
