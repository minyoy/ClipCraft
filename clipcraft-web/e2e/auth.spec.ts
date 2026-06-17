import { expect, test } from '@playwright/test';

test('landing to login to workspace flow works', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByAltText('ClipCraft').first()).toBeVisible();
  await expect(page.getByRole('button', { name: '지금 시작하기' }).first()).toBeVisible();

  await page.getByTestId('login-link').click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByTestId('email-input').fill('qa@example.com');
  await page.getByTestId('password-input').fill('Password123');
  await page.getByTestId('login-submit-button').click();

  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole('heading', { name: '내 프로젝트' })).toBeVisible();
});
