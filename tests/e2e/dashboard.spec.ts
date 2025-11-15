import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from '@/tests/e2e/utils/mockSupabase';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page);
  });

  test('should display the foundational dashboard layout with placeholders on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop viewport
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check for desktop sections
    await expect(page.getByTestId('bio-section')).toBeVisible();
    await expect(page.getByTestId('todos-section')).toBeVisible();
    await expect(page.getByTestId('today-section')).toBeVisible();
    await expect(page.getByTestId('yesterday-section')).toBeVisible();
    await expect(page.getByTestId('the-pile-section')).toBeVisible();
    await expect(page.getByTestId('journal-section')).toBeVisible();
    await expect(page.getByTestId('footer-section')).toBeVisible();

    // Check placeholder text
    await expect(page.getByText('Your Bio Here')).toBeVisible();
    await expect(page.getByText('Your Todos Here')).toBeVisible();
    await expect(page.getByText('Today\'s Habits')).toBeVisible();
    await expect(page.getByText('Yesterday\'s Habits')).toBeVisible();
    await expect(page.getByText('The Pile')).toBeVisible();
    await expect(page.getByText('Journal')).toBeVisible();
    await expect(page.getByText('Footer')).toBeVisible();

    // Ensure mobile-specific elements are not visible on desktop
    await expect(page.getByTestId('bio-section-mobile')).not.toBeVisible();
  });

  test('should display the foundational dashboard layout with placeholders on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check for mobile sections
    await expect(page.getByTestId('bio-section-mobile')).toBeVisible();
    await expect(page.getByTestId('todos-section-mobile')).toBeVisible();
    await expect(page.getByTestId('today-section-mobile')).toBeVisible();
    await expect(page.getByTestId('yesterday-section-mobile')).toBeVisible();
    await expect(page.getByTestId('the-pile-section-mobile')).toBeVisible();
    await expect(page.getByTestId('journal-section-mobile')).toBeVisible();
    await expect(page.getByTestId('footer-section-mobile')).toBeVisible();

    // Check placeholder text
    await expect(page.getByText('Your Bio Here (Mobile)')).toBeVisible();
    await expect(page.getByText('Your Todos Here (Mobile)')).toBeVisible();
    await expect(page.getByText('Today\'s Habits (Mobile)')).toBeVisible();
    await expect(page.getByText('Yesterday\'s Habits (Mobile)')).toBeVisible();
    await expect(page.getByText('The Pile (Mobile)')).toBeVisible();
    await expect(page.getByText('Journal (Mobile)')).toBeVisible();
    await expect(page.getByText('Footer (Mobile)')).toBeVisible();

    // Ensure desktop-specific elements are not visible on mobile
    await expect(page.getByTestId('bio-section')).not.toBeVisible();
  });
});