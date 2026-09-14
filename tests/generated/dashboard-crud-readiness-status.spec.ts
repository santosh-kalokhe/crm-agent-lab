import { test, expect } from "@playwright/test";

test("shows Complete CRM CRUD readiness status as yellow instead of green", async ({ page }) => {
  page.on("console", (message) => {
    console.log(
      `[Browser Console][${message.type()}] ${message.text()}`,
    );
  });

  page.on("pageerror", (error) => {
    console.log(`[Browser Page Error] ${error.message}`);
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
      console.log(`[HTTP ${response.status()}] ${response.url()}`);
    }
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

  await readinessHeading
    .waitFor({ state: "visible" })
    .catch((error) => {
      console.log(
        "Readiness section did not become visible:",
        error instanceof Error ? error.message : String(error),
      );
    });

  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "Unable to read page body");

  console.log("Visible page text:", bodyText.slice(0, 5000));

  const correctedStatus = page.getByText(
    "🟡 Complete CRM CRUD",
    { exact: true },
  );
  const previousStatus = page.getByText(
    "🟢 Complete CRM CRUD",
    { exact: true },
  );

  console.log(
    "Readiness heading locator count:",
    await readinessHeading.count(),
  );
  console.log(
    "Yellow CRUD status locator count:",
    await correctedStatus.count(),
  );
  console.log(
    "Green CRUD status locator count:",
    await previousStatus.count(),
  );

  await expect(correctedStatus).toBeVisible();
  await expect(previousStatus).toHaveCount(0);
});
