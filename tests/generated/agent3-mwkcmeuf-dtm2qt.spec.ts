import { test, expect } from '@playwright/test';

test('TS-1: Create lead with valid name, valid email, and positive deal value', async ({ page }) => {
  await page.goto('/');
  // Navigate to lead creation form
  await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

  await page.getByRole('textbox', { name: /lead name/i }).fill('Acme Corp');
  await page.getByRole('textbox', { name: /email/i }).fill('user@example.com');
  await page.getByRole('spinbutton', { name: /deal value/i }).fill('5000');

  await page.getByRole('button', { name: /submit/i }).click();

  // Expect the new lead to appear in a list or confirmation
  await expect(page.getByText(/Acme Corp/i)).toBeVisible();
  await expect(page.getByText(/user@example.com/i)).toBeVisible();
  await expect(page.getByText(/5000/i)).toBeVisible();
});


// TS-2: Reject lead creation with invalid email formats
// Since multiple invalid emails are listed, will test each sequentially
const invalidEmails = ['user@', 'userexample.com', 'user@.com'];

for (const invalidEmail of invalidEmails) {
  test(`TS-2: Reject lead creation with invalid email format: ${invalidEmail}`, async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

    await page.getByRole('textbox', { name: /lead name/i }).fill('Test Lead');
    await page.getByRole('textbox', { name: /email/i }).fill(invalidEmail);
    await page.getByRole('spinbutton', { name: /deal value/i }).fill('1000');

    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByRole('alert')).toHaveText(/invalid email/i);
  });
}


// TS-3: Reject lead creation with negative deal value
// Verify validation error for negative deal value
//
test('TS-3: Reject lead creation with negative deal value', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

  await page.getByRole('textbox', { name: /lead name/i }).fill('Test Lead');
  await page.getByRole('textbox', { name: /email/i }).fill('user@example.com');
  await page.getByRole('spinbutton', { name: /deal value/i }).fill('-1000');

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.getByRole('alert')).toHaveText(/deal value cannot be negative/i);
});


// TS-4: Accept lead creation with zero deal value
// Verify form submission works with deal value zero

test('TS-4: Accept lead creation with zero deal value', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

  await page.getByRole('textbox', { name: /lead name/i }).fill('Zero Deal Lead');
  await page.getByRole('textbox', { name: /email/i }).fill('zero@example.com');
  await page.getByRole('spinbutton', { name: /deal value/i }).fill('0');

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.getByText(/Zero Deal Lead/i)).toBeVisible();
  await expect(page.getByText(/zero@example.com/i)).toBeVisible();
  await expect(page.getByText(/0/i)).toBeVisible();
});


// TS-5: Validate email with minimum valid format
// Use minimal valid email a@b.co

test('TS-5: Validate email with minimum valid format', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

  await page.getByRole('textbox', { name: /lead name/i }).fill('Min Email Lead');
  await page.getByRole('textbox', { name: /email/i }).fill('a@b.co');
  await page.getByRole('spinbutton', { name: /deal value/i }).fill('1000');

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.getByText(/Min Email Lead/i)).toBeVisible();
  await expect(page.getByText(/a@b.co/i)).toBeVisible();
});


// TS-6: Submit lead creation without lead name
// Expected behavior not specified; mark as fixme

test.fixme('TS-6: Submit lead creation without lead name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

  // Leave lead name empty
  await page.getByRole('textbox', { name: /email/i }).fill('user@example.com');
  await page.getByRole('spinbutton', { name: /deal value/i }).fill('1000');

  await page.getByRole('button', { name: /submit/i }).click();

  // Missing specification - observe system behavior
});


// TS-7: Enter email with uncommon but valid formats
// Test multiple emails sequentially
const uncommonValidEmails = ['user+label@example.com', 'user.name@sub.domain.com'];

for (const email of uncommonValidEmails) {
  test(`TS-7: Accept uncommon but valid email format: ${email}`, async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

    await page.getByRole('textbox', { name: /lead name/i }).fill('Uncommon Email Lead');
    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByRole('spinbutton', { name: /deal value/i }).fill('1500');

    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByText(/Uncommon Email Lead/i)).toBeVisible();
    await expect(page.getByText(new RegExp(email, 'i'))).toBeVisible();
  });
}

// TS-8: Enter very large deal value
// Verify system accepts very large deal value

test('TS-8: Enter very large deal value', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('form', { name: /lead creation/i })).toBeVisible();

  await page.getByRole('textbox', { name: /lead name/i }).fill('Big Deal Lead');
  await page.getByRole('textbox', { name: /email/i }).fill('bigdeal@example.com');
  await page.getByRole('spinbutton', { name: /deal value/i }).fill('9999999999');

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.getByText(/Big Deal Lead/i)).toBeVisible();
  await expect(page.getByText(/9999999999/i)).toBeVisible();
});