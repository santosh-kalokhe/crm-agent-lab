import { test, expect } from "@playwright/test";

test("shows Complete CRM CRUD readiness status as green", async ({ page }) => {
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

  const readinessHeading = page.getByRole("heading", {
    name: "Agentic SDLC readiness",
    exact: true,
  });
  const greenStatus = page.getByText(
    "🟢 Complete CRM CRUD",
    { exact: true },
  );
  const yellowStatus = page.getByText(
    "🟡 Complete CRM CRUD",
    { exact: true },
  );

  await greenStatus.waitFor({ state: "visible" });

  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "Unable to read page body");

  console.log(
    "Visible page text:",
    bodyText.slice(0, 5000),
  );
  console.log(
    "Green Complete CRM CRUD locator count:",
    await greenStatus.count(),
  );
  console.log(
    "Yellow Complete CRM CRUD locator count:",
    await yellowStatus.count(),
  );

  await expect(readinessHeading).toBeVisible();
  await expect(greenStatus).toBeVisible();
  await expect(yellowStatus).toHaveCount(0);
});
