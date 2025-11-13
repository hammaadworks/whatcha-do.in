import { test, expect } from '@playwright/test';

test.describe('Sign-up Flow', () => {
  test('should allow a user to sign up with email and display a confirmation message', async ({ page }) => {
    // Assuming the Login component is rendered on the homepage or a specific /login route
    await page.goto('/'); // Adjust this URL if your login page is different

    // Fill in the email input
    await page.fill('input[type="email"]', 'test-e2e@example.com');

    // Click the submit button
    await page.click('button[type="submit"]');

    // Expect a confirmation message to be displayed
    await expect(page.locator('text="Please check your email for a magic link."')).toBeVisible();

    // Further steps would involve checking the email and clicking the magic link,
    // which requires a more advanced setup (e.g., a test email server or mocking).
    // For now, we verify the initial UI interaction.
  });
});
