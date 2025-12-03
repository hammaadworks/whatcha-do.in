import React from 'react';
import { render, screen } from '@testing-library/react';
import AppHeader from '@/components/layout/AppHeader';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock the next/link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'Link'; // Add displayName here
  return MockLink;
});

describe('AppHeader', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    // Reset mock before each test
    mockUseAuth.mockReset();
  });

  it('should render nothing when loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<AppHeader />);
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should render Login button when not authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<AppHeader />);
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton.closest('a')).toHaveAttribute('href', '/me');
  });

  it('should not render Login button when authenticated and not loading', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    render(<AppHeader />);
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should not render Login button when authenticated and loading (though unlikely state)', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUseAuth.mockReturnValue({ user: mockUser, loading: true });
    render(<AppHeader />);
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });
});