import { test, expect } from '@playwright/test';

// Helper function to set a mock authenticated session
async function setAuthenticatedSession(page: any) {
  const mockSession = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'mock_user_id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  await page.evaluate((session: any) => {
    localStorage.setItem('sb-your-supabase-url-auth-token', JSON.stringify(session));
  }, mockSession);
}

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to login page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toHaveText('Sign Up');
  });

  test('should redirect authenticated user to dashboard', async ({ page }) => {
    await page.goto('/'); // Navigate first
    await setAuthenticatedSession(page); // Then set session
    await page.reload(); // Reload to apply session
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });

  test('should show logout button when authenticated', async ({ page }) => {
    await page.goto('/dashboard'); // Navigate first
    await setAuthenticatedSession(page); // Then set session
    await page.reload(); // Reload to apply session
    await expect(page.locator('button', { hasText: 'Logout' })).toBeVisible();
  });

  test('should show login form when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Sign Up');
  });
});
