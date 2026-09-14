import { test, expect } from "@playwright/test";

test("Sales lead CRUD", async ({ page }) => {
  const uniqueId = Date.now();

  const leadName = `PW Lead ${uniqueId}`;
  const updatedLeadName = `PW Lead Updated ${uniqueId}`;
  const email = `pw-${uniqueId}@example.com`;

  await page.goto("/");

  await page.getByRole("button", { name: "Sales" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Sales",
    }),
  ).toBeVisible();

  // CREATE
  await page.getByRole("button", { name: "+ Add lead" }).click();

  await expect(
    page.getByRole("heading", {
      name: "New Lead",
    }),
  ).toBeVisible();

  await page.getByPlaceholder("Lead name").fill(leadName);
  await page.getByPlaceholder("Company").fill("Playwright Corp");
  await page.getByPlaceholder("Email").fill(email);

  await page.locator("select").selectOption("Qualified");
  await page.locator('input[type="number"]').fill("25000");

  await page.getByRole("button", { name: "Save Lead" }).click();

  let row = page.locator("tr", {
    hasText: leadName,
  });

  await expect(row).toBeVisible();
  await expect(row).toContainText("Playwright Corp");
  await expect(row).toContainText(email);
  await expect(row).toContainText("Qualified");

  // UPDATE
  await row.getByRole("button", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Edit Lead",
    }),
  ).toBeVisible();

  await page.getByPlaceholder("Lead name").fill(updatedLeadName);
  await page.locator("select").selectOption("Won");
  await page.locator('input[type="number"]').fill("30000");

  await page.getByRole("button", { name: "Update Lead" }).click();

  row = page.locator("tr", {
    hasText: updatedLeadName,
  });

  await expect(row).toBeVisible();
  await expect(row).toContainText("Won");
  await expect(row).toContainText("30,000");

  // DELETE
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await row.getByRole("button", { name: "Delete" }).click();

  await expect(
    page.locator("tr", {
      hasText: updatedLeadName,
    }),
  ).toHaveCount(0);
});
