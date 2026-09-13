import { test, expect } from "@playwright/test";

test("shows Complete CRM CRUD readiness as yellow instead of green", async ({ page }) => {
  await page.route("**/rest/v1/leads*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.route("**/rest/v1/cases*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.route("**/rest/v1/campaigns*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/");

  const readinessSection = page
    .getByRole("heading", { name: "Agentic SDLC readiness" })
    .locator("..");

  await expect(readinessSection).toBeVisible();
  await expect(readinessSection.getByText("🟡 Complete CRM CRUD", { exact: true })).toBeVisible();
  await expect(readinessSection.getByText("🟢 Complete CRM CRUD", { exact: true })).toHaveCount(0);
  await expect(readinessSection.getByText("🟢 Live dashboard", { exact: true })).toBeVisible();
});
