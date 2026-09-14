import { test, expect } from "@playwright/test";

test("Customer Service case CRUD", async ({ page }) => {
  const uniqueId = Date.now();

  const customerName = `PW Customer ${uniqueId}`;
  const title = `PW Case ${uniqueId}`;
  const updatedTitle = `PW Case Updated ${uniqueId}`;

  await page.goto("/");

  await page
    .getByRole("button", {
      name: "Customer Service",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Customer Service",
    }),
  ).toBeVisible();

  // CREATE
  await page
    .getByRole("button", {
      name: "+ New case",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "New Case",
    }),
  ).toBeVisible();

  const caseNumber = await page.getByPlaceholder("Case number").inputValue();

  expect(caseNumber).toMatch(/^CASE-/);

  await page.getByPlaceholder("Customer").fill(customerName);
  await page.getByPlaceholder("Case title").fill(title);

  const selects = page.locator("select");

  await selects.nth(0).selectOption("High");
  await selects.nth(1).selectOption("Open");

  await page
    .getByRole("button", {
      name: "Save Case",
    })
    .click();

  let row = page.locator("tr", {
    hasText: caseNumber,
  });

  await expect(row).toBeVisible();
  await expect(row).toContainText(customerName);
  await expect(row).toContainText(title);
  await expect(row).toContainText("High");
  await expect(row).toContainText("Open");

  // UPDATE
  await row.getByRole("button", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Edit Case",
    }),
  ).toBeVisible();

  await page.getByPlaceholder("Case title").fill(updatedTitle);

  await selects.nth(0).selectOption("Critical");
  await selects.nth(1).selectOption("Resolved");

  await page
    .getByRole("button", {
      name: "Update Case",
    })
    .click();

  row = page.locator("tr", {
    hasText: caseNumber,
  });

  await expect(row).toBeVisible();
  await expect(row).toContainText(updatedTitle);
  await expect(row).toContainText("Critical");
  await expect(row).toContainText("Resolved");

  // DELETE
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await row.getByRole("button", { name: "Delete" }).click();

  await expect(
    page.locator("tr", {
      hasText: caseNumber,
    }),
  ).toHaveCount(0);
});
