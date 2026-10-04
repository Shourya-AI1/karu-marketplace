import { test, expect } from '@playwright/test';

test.describe('Karu marketplace — smoke', () => {
  test('landing page renders hero and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Karu/i);
    // Primary nav link to the collection should be present.
    await expect(page.getByRole('link', { name: /discover/i }).first()).toBeVisible();
  });

  test('discover page lists products', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.getByRole('heading', { name: /discover/i }).first()).toBeVisible();
  });

  test('sign-in page is reachable', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  });

  test('sell landing page renders', async ({ page }) => {
    await page.goto('/sell');
    await expect(page.getByRole('heading', { name: /business/i }).first()).toBeVisible();
  });

  test('protected route redirects unauthenticated users', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('about page renders stats', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/verified artisans/i).first()).toBeVisible();
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/404/).first()).toBeVisible();
  });
});
