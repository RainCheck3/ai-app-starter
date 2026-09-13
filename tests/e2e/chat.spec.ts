import { expect, test } from "@playwright/test";
test("chat streams, continues, and clears without overflow", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "What are you working on?" })
  ).toBeVisible();
  await page.screenshot({ path: info.outputPath("empty.png"), fullPage: true });
  await page.getByRole("textbox", { name: "Message" }).fill("Hello");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop response" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy response" })
  ).toBeVisible();
  await expect(
    page.getByText("What would you like to explore first?")
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("conversation.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.getByRole("textbox", { name: "Message" }).fill("And then?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copy response" })).toHaveCount(
    2
  );
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.getByRole("heading")).toHaveText(
    "What are you working on?"
  );
});
test("stops and recovers from a failed request", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox").fill("Hello");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByRole("button", { name: "Stop response" }).click();
  await expect(
    page.getByRole("button", { name: "Send message", exact: true })
  ).toBeVisible();
  await page.getByRole("button", { name: "New chat" }).click();
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" })
  );
  await page.getByRole("textbox").fill("Hello again");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Couldn't complete that response" })
  ).toBeVisible();
  await page.unroute("**/api/chat");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(
    page.getByRole("button", { name: "Copy response" })
  ).toBeVisible();
});
