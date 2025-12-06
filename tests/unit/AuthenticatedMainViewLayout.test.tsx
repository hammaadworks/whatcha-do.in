// tests/unit/AuthenticatedMainViewLayout.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrivatePage from '@/components/profile/PrivatePage.tsx';
import { User } from '@supabase/supabase-js';
import { PublicUserDisplay, ActionNode, Habit } from '@/lib/supabase/types'; // Import ActionNode and Habit

// Mock AuthContext and useAuth
// This allows us to control the values returned by useAuth in our tests
const mockAuthContextValue: { user: User | null; loading: boolean } = { user: null, loading: false };
const mockUseAuth = jest.fn(() => mockAuthContextValue);

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  AuthContext: {
    Provider: ({ children, value }: { children: React.ReactNode, value: { user: User | null; loading: boolean } }) => {
      // Directly update the mockAuthContextValue for useContext to pick up
      Object.assign(mockAuthContextValue, value);
      return <>{children}</>;
    },
    Consumer: ({ children }: { children: (value: { user: User | null; loading: boolean }) => React.ReactNode }) => children(mockAuthContextValue),
  },
}));


// Mock the global fetch API
const mockFetch = jest.spyOn(global, 'fetch');

// We need to capture the reference to the actual mock function for notFound
let mockedNotFound: jest.Mock;
jest.mock('next/navigation', () => {
  mockedNotFound = jest.fn(); // Assign to a module-scoped variable
  return {
    notFound: mockedNotFound,
  };
});

// Mock AppHeader
jest.mock('@/components/layout/AppHeader', () => {
  return jest.fn(() => <div data-testid="app-header">Mocked AppHeader</div>);
});

describe('PrivatePage', () => { // Changed describe block title
  const mockUsername = 'testuser';
  const mockAuthenticatedUser: User & { username: string; bio?: string } = { // Add bio as optional
    id: 'user123',
    username: mockUsername,
    email: 'test@example.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bio: 'Test bio', // Added bio
  };

  const mockPublicUserDisplay: PublicUserDisplay = {
    id: 'user123',
    username: mockUsername,
    bio: 'Test bio',
    timezone: 'UTC',
  };

  const mockOtherUser: User & { username: string; bio?: string } = { // Add bio as optional
    id: 'otheruser',
    username: 'otheruser',
    email: 'other@example.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bio: 'Other user bio', // Added bio
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({ user: null, loading: false }); // Default mock value
    mockedNotFound.mockReset(); // Use the directly captured mock reference
    mockFetch.mockReset(); // Reset fetch mock
  });

  // Test case for AC: #1, #2, #3, #4
  it('renders private dashboard layout for authenticated owner', async () => {
    mockUseAuth.mockReturnValue({
      user: mockAuthenticatedUser,
      loading: false,
    });
    // For owner, initialProfileUser should be the authenticated user
    render(<PrivatePage username={mockUsername} initialProfileUser={mockAuthenticatedUser} publicActions={[]} publicHabits={[]} publicJournalEntries={[]} publicIdentities={[]} publicTargets={[]} />);

    await waitFor(() => {
      // Check for AppHeader
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      // Check for bio placeholder
      expect(screen.getByText(/Welcome, testuser!/i)).toBeInTheDocument();
      expect(screen.getByText(/Your bio will appear here./i)).toBeInTheDocument();

      // Check for Actions (Todos) placeholder
      expect(screen.getByText(/Actions \(Todos\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Your todo list will be displayed here./i)).toBeInTheDocument();

      // Check for habit column placeholders
      expect(screen.getByText(/^Today$/i)).toBeInTheDocument(); // Use regex for exact match
      expect(screen.getByText(/Habits for today will appear here/i)).toBeInTheDocument();
      expect(screen.getByText(/^Yesterday$/i)).toBeInTheDocument();
      expect(screen.getByText(/Habits from yesterday will appear here/i)).toBeInTheDocument();
      expect(screen.getByText(/The Pile/i)).toBeInTheDocument();
      expect(screen.getByText(/Your other habits will be piled here/i)).toBeInTheDocument();
    });
  });

  // Test for loading state
  it('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    // When auth is loading, initialProfileUser doesn't matter much as it won't be rendered immediately
    render(<PrivatePage username={mockUsername} initialProfileUser={mockPublicUserDisplay} publicActions={[]} publicHabits={[]} publicJournalEntries={[]} publicIdentities={[]} publicTargets={[]} />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  // Test for AC: #1 (PublicPage for non-owner)
  it('renders PublicPage for unauthenticated user (data provided by server component)', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false }); // Unauthenticated
    render(<PrivatePage username={mockUsername} initialProfileUser={mockPublicUserDisplay} publicActions={[]} publicHabits={[]} publicJournalEntries={[]} publicIdentities={[]} publicTargets={[]} />); // Initial data is now always provided

    await waitFor(() => {
      expect(screen.getByText(`Public Profile for ${mockUsername}`)).toBeInTheDocument();
      // Ensure AppHeader is NOT rendered for public view
      expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
    });
  });

  it('renders PublicPage for authenticated user viewing another user\'s profile (data provided by server component)', async () => {
    mockUseAuth.mockReturnValue({
      user: mockOtherUser,
      loading: false,
    });
    render(<PrivatePage username={mockUsername} initialProfileUser={mockPublicUserDisplay} publicActions={[]} publicHabits={[]} publicJournalEntries={[]} publicIdentities={[]} publicTargets={[]} />); // Initial data is now always provided

    await waitFor(() => {
      expect(screen.getByText(`Public Profile for ${mockUsername}`)).toBeInTheDocument();
      expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
    });
  });

  it('calls notFound when public user does not exist', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<PrivatePage username={mockUsername} initialProfileUser={null} publicActions={[]} publicHabits={[]} publicJournalEntries={[]} publicIdentities={[]} publicTargets={[]} />);

    await waitFor(() => {
        expect(mockedNotFound).toHaveBeenCalled();
    });
  });
});
