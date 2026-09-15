import { test, expect } from "@playwright/test";

test("shows persistent accessible labels for every New Lead field", async ({ page }) => {
  page.on("console", (message) => {
    console.log(
      `[Browser Console][${message.type()}] ${message.text()}`,
    );
  });

  page.on("pageerror", (error) => {
    console.log(
      `[Browser Page Error] ${error.message}`,
    );
  });

  page.on("requestfailed", (request) => {
    console.log(
      `[Request Failed] ${request.method()} ${request.url()}`,
    );
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      console.log(
        `[HTTP ${response.status()}] ${response.url()}`,
      );
    }
  });

  await page.route("**/rest/v1/**", async (route) => {
    const request = route.request();

    if (request.method() === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
        },
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": "*",
      },
      body: "[]",
    });
  });

  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  console.log("Final page URL:", page.url());
  console.log("Page title:", await page.title());

  await page.getByText("Sales", { exact: true }).first().click();
  await expect(
    page.getByRole("heading", { name: "Sales", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "+ Add lead", exact: true }).click();

  const nameInput = page.getByLabel("Lead name", { exact: true });
  const companyInput = page.getByLabel("Company", { exact: true });
  const emailInput = page.getByLabel("Email", { exact: true });
  const statusSelect = page.getByLabel("Status", { exact: true });
  const valueInput = page.getByLabel("Potential value", { exact: true });

  await nameInput.fill("Taylor Morgan");
  await companyInput.fill("Northwind Labs");
  await emailInput.fill("taylor@example.com");
  await statusSelect.selectOption({ label: "Qualified" });
  await valueInput.fill("12500");

  const formText = await page
    .getByRole("heading", { name: "New Lead", exact: true })
    .locator("xpath=ancestor::section[1]")
    .innerText()
    .catch(() => "Unable to read New Lead form text");

  console.log("Visible New Lead form text:", formText);
  console.log("Lead name value:", await nameInput.inputValue());
  console.log("Company value:", await companyInput.inputValue());
  console.log("Email value:", await emailInput.inputValue());
  console.log("Status value:", await statusSelect.inputValue());
  console.log("Potential value:", await valueInput.inputValue());

  await expect(
    page.getByRole("heading", { name: "New Lead", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Lead name", { exact: true })).toBeVisible();
  await expect(page.getByText("Company", { exact: true })).toBeVisible();
  await expect(page.getByText("Email", { exact: true })).toBeVisible();
  await expect(page.getByText("Status", { exact: true })).toBeVisible();
  await expect(page.getByText("Potential value", { exact: true })).toBeVisible();

  await expect(nameInput).toHaveValue("Taylor Morgan");
  await expect(companyInput).toHaveValue("Northwind Labs");
  await expect(emailInput).toHaveValue("taylor@example.com");
  await expect(statusSelect).toHaveValue("Qualified");
  await expect(valueInput).toHaveValue("12500");

  await page.getByText("Lead name", { exact: true }).click();
  await expect(nameInput).toBeFocused();
}