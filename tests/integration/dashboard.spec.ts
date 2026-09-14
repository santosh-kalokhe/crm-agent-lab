import { test, expect } from "@playwright/test";

test("Dashboard loads CRM overview", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "CRM Dashboard",
    }),
  ).toBeVisible();

  await expect(page.getByText("Supabase connected")).toBeVisible();

  await expect(page.getByText("Pipeline", { exact: true })).toBeVisible();
  await expect(page.getByText("Open Cases", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Active Campaigns", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Win Rate", { exact: true })).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Sales pipeline",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Agentic SDLC readiness",
    }),
  ).toBeVisible();
});
