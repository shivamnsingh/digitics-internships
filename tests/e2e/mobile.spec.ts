import { test, expect } from "@playwright/test";

test("home stays within the viewport and mobile navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("overflow-x", "hidden");
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  }
});

test("status lookup is a single-screen flow", async ({ page }) => {
  await page.goto("/status");
  await expect(page.getByRole("heading", { name: "Check application status" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check status" })).toBeVisible();
});
