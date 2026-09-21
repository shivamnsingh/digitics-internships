import { test, expect, type Page, type TestInfo } from "@playwright/test";

const future = "2099-01-02";
const later = "2099-04-02";

async function choose(page: Page, name: string) {
  await page.locator("label.chip").filter({ hasText: name }).first().click();
}

async function toggle(page: Page, name: string) {
  await page.locator("label.chip").filter({ hasText: name }).first().click();
}

async function fillPersonal(page: Page, email: string, under18 = false) {
  await page.getByLabel("Full name").fill("Test Applicant");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Phone number").fill("+91 9876543210");
  await page.getByLabel("City").fill("Pune");
  await page.getByLabel("Current location").fill("Pune, Maharashtra");
  await choose(page, under18 ? "Yes" : "No");
  if (under18) {
    await page.getByLabel("Guardian full name").fill("Test Guardian");
    await page.getByLabel("Guardian phone number").fill("+91 9876543211");
    await page.getByLabel("I confirm that my guardian has consented to this application.").check();
  }
}

async function fillEducation(page: Page) {
  await page.getByLabel("College / Institution name").fill("Test College");
  await page.getByLabel("Degree / Course").fill("B.Des");
  await page.getByLabel("Current year").fill("3rd year");
  await page.getByLabel("Semester").fill("6");
  await page.getByLabel("University / Board").fill("Test University");
  await choose(page, "No");
  await page.getByLabel("Expected internship start date").fill(future);
  await page.getByLabel("Expected internship end date").fill(later);
}

async function fillPreference(page: Page, role: "Video Editing" | "Graphic Designing") {
  await choose(page, role);
  await choose(page, "3 Months");
  await choose(page, "Offline");
}

async function fillSkills(page: Page, role: "Video Editing" | "Graphic Designing", validFile = false) {
  await toggle(page, role === "Video Editing" ? "Adobe Premiere Pro" : "Adobe Photoshop");
  await choose(page, role === "Video Editing" ? "6 months – 1 year" : "1–2 years");
  await toggle(page, "4");
  await toggle(page, role === "Video Editing" ? "Instagram Reels" : "Social Media Posts");
  await choose(page, "No");
  await page.getByLabel(/Share your portfolio/).fill("https://example.com/work");
  if (validFile) {
    await page.locator("input[type=file]").setInputFiles({ name: role === "Video Editing" ? "sample.mp4" : "sample.png", mimeType: role === "Video Editing" ? "video/mp4" : "image/png", buffer: Buffer.from("test file") });
  }
  await page.getByLabel(/What makes a good/).fill("A clear edit or design serves the audience and communicates one idea well.");
  await page.getByLabel(/Why do you want to join Digitics/).fill("I want to learn from a creative team and contribute to real client work.");
}

async function submitFlow(page: Page, testInfo: TestInfo, role: "Video Editing" | "Graphic Designing", under18 = false) {
  const email = `e2e-${testInfo.project.name}-${role === "Video Editing" ? "video" : "design"}-${Date.now()}@example.com`;
  await page.goto("/apply");
  await fillPersonal(page, email, under18);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillEducation(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillPreference(page, role);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillSkills(page, role, true);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Name")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("I understand that this is an unpaid internship.").check();
  await page.getByLabel("I confirm that the information provided in this application is accurate.").check();
  await page.getByLabel(/I acknowledge the privacy notice/).check();
  await page.getByRole("button", { name: "Submit Application" }).click();
  await expect(page).toHaveURL(/\/apply\/success\?id=DIG-\d{4}-\d{4,}/, { timeout: 15000 });
  return { email, id: new URL(page.url()).searchParams.get("id")! };
}

test("Video Editing application completes all six steps", async ({ page }, testInfo) => {
  await submitFlow(page, testInfo, "Video Editing");
});

test("Graphic Designing application completes all six steps with under-18 consent", async ({ page }, testInfo) => {
  await submitFlow(page, testInfo, "Graphic Designing", true);
});

test("role switching clears old answers and changes role questions", async ({ page }) => {
  await page.goto("/apply");
  await fillPersonal(page, `switch-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillEducation(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await choose(page, "Video Editing");
  await choose(page, "3 Months");
  await choose(page, "Offline");
  await page.getByRole("button", { name: "Continue" }).click();
  await toggle(page, "Adobe Premiere Pro");
  await page.getByRole("button", { name: "Back" }).click();
  await choose(page, "Graphic Designing");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Which design tools\/software/)).toBeVisible();
  await expect(page.locator("label.chip").filter({ hasText: "Adobe Premiere Pro" })).toHaveCount(0);
});

test("required errors focus the first error and hybrid is available", async ({ page }) => {
  await page.goto("/apply");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#fullName")).toBeFocused();
  await fillPersonal(page, `errors-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillEducation(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await choose(page, "Video Editing");
  await choose(page, "3 Months");
  await choose(page, "Hybrid");
  await expect(page.getByText(/work both from the Digitics office and remotely/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
});

test("invalid portfolio and file types are rejected while optional portfolio is accepted", async ({ page }) => {
  await page.goto("/apply");
  await fillPersonal(page, `files-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillEducation(page);
  await page.getByRole("button", { name: "Continue" }).click();
  await fillPreference(page, "Graphic Designing");
  await page.getByRole("button", { name: "Continue" }).click();
  await toggle(page, "Adobe Photoshop");
  await choose(page, "1–2 years");
  await toggle(page, "4");
  await toggle(page, "Social Media Posts");
  await choose(page, "No");
  await page.getByLabel(/Share your portfolio/).fill("not-a-url");
  await expect(page.getByText("Enter a full link starting with https://")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter a full link starting with https://")).toBeVisible();
  await page.getByLabel(/Share your portfolio/).fill("");
  await page.locator("input[type=file]").setInputFiles({ name: "wrong.txt", mimeType: "text/plain", buffer: Buffer.from("wrong") });
  await expect(page.getByText(/Allowed formats/)).toBeVisible();
});

test("draft restores after reload and final acknowledgements are required", async ({ page }) => {
  await page.goto("/apply");
  await page.getByLabel("Full name").fill("Reload Applicant");
  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("Reload Applicant");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter your full name")).toHaveCount(0);
});

test("status does not reveal unknown versus wrong email", async ({ page, request }) => {
  const unknown = await request.post("/api/status", { data: { id: "DIG-2099-9999", email: "unknown@example.com" } });
  const wrong = await request.post("/api/status", { data: { id: "DIG-2099-9999", email: "wrong@example.com" } });
  expect(await unknown.json()).toEqual(await wrong.json());
  await page.goto("/status");
  await expect(page.getByText("Enter your Application ID and the email used to apply.")).toBeVisible();
});

test("admin login, wrong password, protected routes and sign out", async ({ page, request }) => {
  const protectedPage = await request.get("/admin");
  expect(protectedPage.status()).toBe(200);
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("p[role=alert]")).toContainText(/Incorrect|Invalid|failed/i);
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});
