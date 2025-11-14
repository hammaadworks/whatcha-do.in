import { vi } from 'vitest';

export const mockSignInWithOtp = vi.fn();
export const mockSignUp = vi.fn();
export const mockSingle = vi.fn();

const mockEqChain = {
  eq: vi.fn(() => mockEqChain),
  single: mockSingle,
};

export const mockEq = vi.fn((column, value) => mockEqChain);
export const mockUpdate = vi.fn((updates) => ({ eq: mockEq }));
export const mockSelect = vi.fn(() => mockEqChain);
export const mockFrom = vi.fn(() => ({
  select: mockSelect,
  update: mockUpdate,
}));

export const supabase = {
  auth: {
    signInWithOtp: mockSignInWithOtp,
    signUp: mockSignUp,
  },
  from: mockFrom,
};
