import { test, expect } from "@playwright/test";

test("shows Complete CRM CRUD readiness status as yellow instead of green", async ({ page }) => {
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

    console.log(
      `[Request Failure] ${request.failure()?.errorText || "Unknown failure"}`,
    );
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      console.log(
        `[HTTP ${response.status()}] ${response.url()}`,
      );
    }
  });

  const mockDashboardRequest = async (route: Parameters<Parameters<typeof page.route>[1]>[0]) => {
    await route.fulfill({
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, prefer",
        "access-control-allow-methods": "GET, HEAD, OPTIONS",
        "content-type": "application/json",
        "content-range": "0-0/0",
      },
      body: "[]",
    });
  };

  await page.route("**/rest/v1/leads*", mockDashboardRequest);
  await page.route("**/rest/v1/cases*", mockDashboardRequest);
  await page.route("**/rest/v1/campaigns*", mockDashboardRequest);

  const response = await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  console.log(
    "Navigation response:",
    response
      ? `${response.status()} ${response.url()}`
      : "No response",
  );

  console.log("Final page URL:", page.url());
  console.log("Page title:", await page.title());

  const readinessTitle = page.getByText(
    "Agentic SDLC readiness",
    { exact: true },
  );

  await readinessTitle
    .waitFor({ state: "visible", timeout: 15000 })
    .catch((error) => {
      console.log(
        "Readiness section did not become visible:",
        error.message,
      );
    });

  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "Unable to read page body");

  console.log(
    "Visible page text:",
    bodyText.slice(0, 5000),
  );

  const expectedStatus = page.getByText(
    "🟡 Complete CRM CRUD",
    { exact: true },
  );
  const previousStatus = page.getByText(
    "🟢 Complete CRM CRUD",
    { exact: true },
  );

  console.log(
    "Readiness title locator count:",
    await readinessTitle.count(),
  );
  console.log(
    "Yellow CRUD status locator count:",
    await expectedStatus.count(),
  );
  console.log(
    "Green CRUD status locator count:",
    await previousStatus.count(),
  );

  await expect(readinessTitle).toBeVisible();
  await expect(expectedStatus).toBeVisible();
  await expect(previousStatus).toHaveCount(0);
});
