import { test, expect } from "@playwright/test";

test("shows Complete CRM CRUD readiness as green instead of yellow", async ({ page }) => {
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

  for (const table of ["leads", "cases", "campaigns"]) {
    await page.route(`**/rest/v1/${table}*`, async (route) => {
      console.log(
        `[Mocked Dashboard Request] ${route.request().method()} ${route.request().url()}`,
      );

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });
  }

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
    .waitFor({ state: "visible" })
    .catch((error) => {
      console.log(
        "Readiness section did not become visible before diagnostics:",
        error instanceof Error ? error.message : String(error),
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

  const greenCrudStatus = page.getByText(
    "🟢 Complete CRM CRUD",
    { exact: true },
  );
  const yellowCrudStatus = page.getByText(
    "🟡 Complete CRM CRUD",
    { exact: true },
  );

  console.log(
    "Readiness title locator count:",
    await readinessTitle.count(),
  );
  console.log(
    "Green CRUD status locator count:",
    await greenCrudStatus.count(),
  );
  console.log(
    "Yellow CRUD status locator count:",
    await yellowCrudStatus.count(),
  );

  await expect(readinessTitle).toBeVisible();
  await expect(greenCrudStatus).toBeVisible();
  await expect(greenCrudStatus).toHaveCount(1);
  await expect(yellowCrudStatus).toHaveCount(0);
});
