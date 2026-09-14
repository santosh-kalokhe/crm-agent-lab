import { test, expect } from "@playwright/test";

test("Marketing campaign CRUD", async ({ page }) => {
  const uniqueId = Date.now();

  const campaignName = `PW Campaign ${uniqueId}`;
  const updatedCampaignName = `PW Campaign Updated ${uniqueId}`;

  await page.goto("/");

  await page
    .getByRole("button", {
      name: "Marketing",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Marketing",
    }),
  ).toBeVisible();

  // CREATE
  await page
    .getByRole("button", {
      name: "+ New campaign",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "New Campaign",
    }),
  ).toBeVisible();

  await page.getByPlaceholder("Campaign name").fill(campaignName);

  await page.getByPlaceholder("Audience").fill("1000");
  await page.locator("select").selectOption("Active");
  await page.getByPlaceholder("Responses").fill("100");

  await page
    .getByRole("button", {
      name: "Save Campaign",
    })
    .click();

  let row = page.locator("tr", {
    hasText: campaignName,
  });

  await expect(row).toBeVisible();
  await expect(row).toContainText("1,000");
  await expect(row).toContainText("Active");
  await expect(row).toContainText("100");

  // UPDATE
  await row.getByRole("button", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Edit Campaign",
    }),
  ).toBeVisible();

  await page.getByPlaceholder("Campaign name").fill(updatedCampaignName);

  await page.getByPlaceholder("Audience").fill("2000");
  await page.locator("select").selectOption("Completed");
  await page.getByPlaceholder("Responses").fill("250");

  await page
    .getByRole("button", {
      name: "Update Campaign",
    })
    .click();

  row = page.locator("tr", {
    hasText: updatedCampaignName,
  });

  await expect(row).toBeVisible();
  await expect(row).toContainText("2,000");
  await expect(row).toContainText("Completed");
  await expect(row).toContainText("250");

  // DELETE
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await row.getByRole("button", { name: "Delete" }).click();

  await expect(
    page.locator("tr", {
      hasText: updatedCampaignName,
    }),
  ).toHaveCount(0);
});
