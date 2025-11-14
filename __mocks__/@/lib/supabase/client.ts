import { vi } from 'vitest';

export const mockSingle = vi.fn();

const mockEqChain = {
  eq: vi.fn((column, value) => mockEqChain),
  single: mockSingle,
};

const mockEq = vi.fn((column, value) => mockEqChain);

const mockUpdate = vi.fn((updates) => ({
  eq: vi.fn((column, value) => ({
    error: null,
  })),
}));

const mockFrom = vi.fn((table) => ({
  update: mockUpdate,
  select: vi.fn(() => ({ eq: mockEq, single: mockSingle }))
}));

export const supabaseClient = {
  from: mockFrom,
  auth: {
    signUp: vi.fn(),
  },
};
