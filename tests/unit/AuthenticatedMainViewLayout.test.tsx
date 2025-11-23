// tests/unit/AuthenticatedMainViewLayout.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/[username]/page';
import { getUserByUsernameClient, getUserByUsernameServer } from '@/lib/supabase/user';
// import { notFound } from 'next/navigation'; // Removed unused import
import { User } from '@supabase/supabase-js'; // Import User type

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


// Mock getUserByUsernameClient and getUserByUsernameServer
jest.mock('@/lib/supabase/user', () => ({
  getUserByUsernameClient: jest.fn(),
  getUserByUsernameServer: jest.fn(),
}));
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

describe('AuthenticatedMainViewLayout', () => {
  const mockUsername = 'testuser';
  const mockAuthenticatedUser: User & { username: string } = { // Add username to mock user
    id: 'user123',
    username: mockUsername,
    email: 'test@example.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockOtherUser: User & { username: string } = { // Add username to mock user
    id: 'otheruser',
    username: 'otheruser',
    email: 'other@example.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({ user: null, loading: false }); // Default mock value
    (getUserByUsernameClient as jest.Mock).mockReset();
    (getUserByUsernameServer as jest.Mock).mockReset();
    mockedNotFound.mockReset(); // Use the directly captured mock reference
  });

  // Test case for AC: #1, #2, #3, #4
  it('renders private dashboard layout for authenticated owner', async () => {
    mockUseAuth.mockReturnValue({
      user: mockAuthenticatedUser,
      loading: false,
    });
    (getUserByUsernameClient as jest.Mock).mockResolvedValue(mockAuthenticatedUser);

    render(<ProfilePage params={{ username: mockUsername }} />);

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
    render(<ProfilePage params={{ username: mockUsername }} />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  // Test for AC: #1 (PublicProfileView for non-owner)
  it('renders PublicProfileView for unauthenticated user', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    (getUserByUsernameClient as jest.Mock).mockResolvedValue({ id: 'someid', username: mockUsername }); // Mock public user data

    render(<ProfilePage params={{ username: mockUsername }} />);

    await waitFor(() => {
      expect(screen.getByText(`Public Profile of ${mockUsername}`)).toBeInTheDocument();
      // Ensure AppHeader is NOT rendered for public view
      expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
    });
  });

  it('renders PublicProfileView for authenticated user viewing another user\'s profile', async () => {
    mockUseAuth.mockReturnValue({
      user: mockOtherUser,
      loading: false,
    });
    (getUserByUsernameClient as jest.Mock).mockResolvedValue({ id: 'someid', username: mockUsername }); // Mock public user data

    render(<ProfilePage params={{ username: mockUsername }} />);

    await waitFor(() => {
      expect(screen.getByText(`Public Profile of ${mockUsername}`)).toBeInTheDocument();
      expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
    });
  });

  it('calls notFound when public user does not exist', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    (getUserByUsernameClient as jest.Mock).mockResolvedValue(null);

    render(<ProfilePage params={{ username: mockUsername }} />);

    // notFound is called outside the component render, so we expect it to be called
    await waitFor(() => {
        expect(mockedNotFound).toHaveBeenCalled();
    });
  });
});
