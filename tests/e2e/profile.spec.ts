import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  test('should allow a user to update their bio and view it on their public profile', async ({ page }) => {
    // Assume user is already logged in for this test.
    // In a real scenario, you would either log in the user programmatically
    // or use a global setup to ensure an authenticated session.
    // For now, we'll simulate being logged in by directly navigating to the edit page.
    // This will likely redirect to login if not actually authenticated,
    // but for the purpose of demonstrating the test flow, we proceed.

    // Navigate to the edit profile page
    await page.goto('/profile/edit');

    // Fill in the bio textarea
    const newBio = 'This is my updated bio for testing purposes.';
    await page.locator('textarea').fill(newBio);

    // Click the save button
    await page.locator('button', { hasText: 'Save Bio' }).click();

    // Expect a success toast message
    await expect(page.locator('text=Bio updated successfully!')).toBeVisible();

    // Navigate to the public profile page (assuming a known user ID, e.g., 'test-user-id')
    // In a real application, you'd get the user ID dynamically after login.
    // For this test, we'll use a placeholder.
    const userId = 'test-user-id'; // Replace with a valid test user ID if available
    await page.goto(`/profile/${userId}`);

    // Verify the updated bio is displayed on the public profile
    await expect(page.locator(`text=${newBio}`)).toBeVisible();
  });
});
