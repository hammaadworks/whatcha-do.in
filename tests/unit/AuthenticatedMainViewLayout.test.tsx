// tests/unit/AuthenticatedMainViewLayout.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PrivatePage } from '@/components/profile/PrivatePage';
import { notFound } from 'next/navigation';
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


jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock child components to avoid deep dependency tree parsing (ESM issues)
jest.mock('@/components/profile/PublicPage', () => ({
  PublicPage: ({ user }: any) => <div>Public Profile for {user?.username}</div>
}));

jest.mock('@/components/profile/OwnerProfileView', () => ({
  __esModule: true,
  default: ({ initialProfileUser }: any) => (
    <div>
        <div data-testid="app-header">Mocked AppHeader</div>
        <div>Welcome, {initialProfileUser.username}!</div>
        <div>Your bio will appear here.</div>
        <div>Actions (Todos)</div>
        <div>Your todo list will be displayed here.</div>
        <div>Today</div>
        <div>Habits for today will appear here</div>
        <div>Yesterday</div>
        <div>Habits from yesterday will appear here</div>
        <div>The Pile</div>
        <div>Your other habits will be piled here</div>
    </div>
  )
}));

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
    (notFound as unknown as jest.Mock).mockReset(); // Use the imported notFound
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
        expect(notFound).toHaveBeenCalled();
    });
  });
});
