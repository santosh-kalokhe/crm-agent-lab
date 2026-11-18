import { test, expect } from '@playwright/test';

test.describe('Lead Creation Form Tests', () => {

  test('TS-001: Create lead with valid name, valid email, and non-negative deal value', async ({ page }) => {
    await page.goto('/');
    // Navigate to lead creation form
    await page.getByRole('link', { name: /create lead/i }).click();

    // Enter valid lead name
    await page.getByLabel(/lead name/i).fill('John Doe');
    // Enter valid email
    await page.getByLabel(/email/i).fill('john.doe@example.com');
    // Enter deal value of 1000
    await page.getByLabel(/deal value/i).fill('1000');

    // Submit form
    await page.getByRole('button', { name: /submit/i }).click();

    // Expect confirmation
    const confirmation = page.getByText(/lead.*saved/i);
    await expect(confirmation).toBeVisible();
  });

  test('TS-002: Attempt to create lead with invalid email format', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /create lead/i }).click();

    await page.getByLabel(/lead name/i).fill('Valid Name');

    // Test with several invalid emails, here demonstrating one invalid format
    await page.getByLabel(/email/i).fill('john.doe@com');

    await page.getByLabel(/deal value/i).fill('100');

    await page.getByRole('button', { name: /submit/i }).click();

    // Expect validation error for email format
    const emailError = page.getByText(/valid.*email/i);
    await expect(emailError).toBeVisible();

    // Confirm no success confirmation is shown
    const confirmation = page.getByText(/lead.*saved/i);
    await expect(confirmation).not.toBeVisible();
  });

  test('TS-003: Attempt to create lead with negative deal value', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /create lead/i }).click();

    await page.getByLabel(/lead name/i).fill('Valid Name');
    await page.getByLabel(/email/i).fill('valid.email@example.com');
    await page.getByLabel(/deal value/i).fill('-100');

    await page.getByRole('button', { name: /submit/i }).click();

    // Expect validation error for negative deal value
    const dealValueError = page.getByText(/deal value.*non-negative/i);
    await expect(dealValueError).toBeVisible();

    // Confirm no success confirmation
    const confirmation = page.getByText(/lead.*saved/i);
    await expect(confirmation).not.toBeVisible();
  });

  test('TS-004: Create lead with deal value of zero', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /create lead/i }).click();

    await page.getByLabel(/lead name/i).fill('Valid Name');
    await page.getByLabel(/email/i).fill('valid.email@example.com');
    await page.getByLabel(/deal value/i).fill('0');

    await page.getByRole('button', { name: /submit/i }).click();

    // Expect success confirmation
    const confirmation = page.getByText(/lead.*saved/i);
    await expect(confirmation).toBeVisible();
  });

  test('TS-005: Enter lead name with special or non-alphanumeric characters', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /create lead/i }).click();

    // Example special character name
    await page.getByLabel(/lead name/i).fill('Anne-Marie O’Neil');
    await page.getByLabel(/email/i).fill('valid.email@example.com');
    await page.getByLabel(/deal value/i).fill('1000');

    await page.getByRole('button', { name: /submit/i }).click();

    // The expected result is conditional (could succeed or error)
    const successConfirmation = page.getByText(/lead.*saved/i);
    const validationError = page.getByText(/lead name.*invalid|special character/i);

    // Wait for either success or validation error
    const result = await Promise.race([
      successConfirmation.waitFor({ state: 'visible', timeout: 3000 }).then(() => 'success').catch(() => null),
      validationError.waitFor({ state: 'visible', timeout: 3000 }).then(() => 'error').catch(() => null)
    ]);

    test.fixme(true, 'TS-005 result may vary by system rules; implement assertion accordingly');
  });

  test('TS-006: Enter extremely long lead name', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /create lead/i }).click();

    // Generate a 500+ character string
    const longName = 'A'.repeat(501);
    await page.getByLabel(/lead name/i).fill(longName);
    await page.getByLabel(/email/i).fill('valid.email@example.com');
    await page.getByLabel(/deal value/i).fill('1000');

    await page.getByRole('button', { name: /submit/i }).click();

    // Expected behavior unclear
    const successConfirmation = page.getByText(/lead.*saved/i);
    const validationError = page.getByText(/lead name.*limit|length/i);

    const result = await Promise.race([
      successConfirmation.waitFor({ state: 'visible', timeout: 3000 }).then(() => 'success').catch(() => null),
      validationError.waitFor({ state: 'visible', timeout: 3000 }).then(() => 'error').catch(() => null)
    ]);

    test.fixme(true, 'TS-006 expected behavior unclear; validate system acceptance or rejection with proper message');
  });

  test('TS-007: Attempt to create lead without mandatory fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /create lead/i }).click();

    // Leave fields empty
    await page.getByLabel(/lead name/i).fill('');
    await page.getByLabel(/email/i).fill('');
    await page.getByLabel(/deal value/i).fill('');

    await page.getByRole('button', { name: /submit/i }).click();

    // Expect validation errors for all mandatory fields
    const nameError = page.getByText(/lead name.*required/i);
    const emailError = page.getByText(/email.*required/i);
    const dealValueError = page.getByText(/deal value.*required/i);

    await expect(nameError).toBeVisible();
    await expect(emailError).toBeVisible();
    await expect(dealValueError).toBeVisible();

    // Confirm no success message
    const confirmation = page.getByText(/lead.*saved/i);
    await expect(confirmation).not.toBeVisible();
  });

  test('TS-008: Enter deal value with decimal places', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /create lead/i }).click();

    await page.getByLabel(/lead name/i).fill('Valid Name');
    await page.getByLabel(/email/i).fill('valid.email@example.com');
    await page.getByLabel(/deal value/i).fill('1234.56');

    await page.getByRole('button', { name: /submit/i }).click();

    // Either success confirmation or validation error
    const successConfirmation = page.getByText(/lead.*saved/i);
    const validationError = page.getByText(/deal value.*decimal/i);

    const result = await Promise.race([
      successConfirmation.waitFor({ state: 'visible', timeout: 3000 }).then(() => 'success').catch(() => null),
      validationError.waitFor({ state: 'visible', timeout: 3000 }).then(() => 'error').catch(() => null)
    ]);

    test.fixme(true, 'TS-008 acceptance of decimal deal values depends on system support; add assertions accordingly');
  });

});