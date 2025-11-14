import { test, expect } from '@playwright/test';

test('user can edit their bio', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  await page.waitForNavigation();

  await page.goto('/profile/edit');

  const newBio = 'This is a new bio from an E2E test.';
  await page.fill('textarea', newBio);
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Bio updated successfully!')).toBeVisible();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anon key is not defined.');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not found.');
  }

  await page.goto(`/profile/${user.id}`);
  await expect(page.locator(`text=${newBio}`)).toBeVisible();
});

test('public profile page displays public information', async ({ page }) => {
  // 1. Create a test user and set up their public profile data in Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anon key is not defined.');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email: `test-${Date.now()}@example.com`,
    password: 'password',
  });

  if (error || !user) {
    throw new Error('Failed to create a test user.');
  }

  await supabase.from('users').update({ bio: 'Public bio' }).eq('id', user.id);
  await supabase.from('habits').insert([
    { user_id: user.id, name: 'Public Habit', is_public: true },
    { user_id: user.id, name: 'Private Habit', is_public: false },
  ]);
  await supabase.from('todos').insert([
    { user_id: user.id, task: 'Public Todo', is_public: true },
    { user_id: user.id, task: 'Private Todo', is_public: false },
  ]);
  await supabase.from('journal_entries').insert([
    { user_id: user.id, content: 'Public Entry', is_public: true },
    { user_id: user.id, content: 'Private Entry', is_public: false },
  ]);

  // 2. Navigate to the user's public profile page
  await page.goto(`/profile/${user.id}`);

  // 3. Verify that the public information is displayed
  await expect(page.locator('text=Public bio')).toBeVisible();
  await expect(page.locator('text=Public Habit')).toBeVisible();
  await expect(page.locator('text=Public Todo')).toBeVisible();
  await expect(page.locator('text=Public Entry')).toBeVisible();

  // 4. Verify that the private information is not displayed
  await expect(page.locator('text=Private Habit')).not.toBeVisible();
  await expect(page.locator('text=Private Todo')).not.toBeVisible();
  await expect(page.locator('text=Private Entry')).not.toBeVisible();
});