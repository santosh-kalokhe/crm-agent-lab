import { test, expect } from "@playwright/test";

test("shows Complete CRM CRUD as yellow in Agentic SDLC readiness", async ({ page }) => {
  await page.route("**/rest/v1/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  await page.goto("/");

  const readiness = page
    .getByRole("heading", { name: "Agentic SDLC readiness" })
    .locator("..");

  await expect(readiness.getByText("🟡 Complete CRM CRUD", { exact: true })).toBeVisible();
  await expect(readiness.getByText("🟢 Complete CRM CRUD", { exact: true })).toHaveCount(0);

  await expect(readiness.getByText("🟢 CRM shell created", { exact: true })).toBeVisible();
  await expect(readiness.getByText("🟢 Live dashboard", { exact: true })).toBeVisible();
  await expect(readiness.getByText("⚪ Add GitHub issue workflow", { exact: true })).toBeVisible();
  await expect(readiness.getByText("⚪ Add autonomous agents", { exact: true })).toBeVisible();
});
