import { test, expect } from "../fixtures/loggedIn";

test.describe("login page", () => {
  test("login page shows brand logo", async ({ page, loginPage }) => {
    await expect(page.locator(".login_logo")).toHaveText("Swag Labs");
  });

  test("Login as standard_user with valid password", { tag: ["@smoke"] }, async ({ page, loginPage }) => {
    await loginPage.loginUser("standard_user", "secret_sauce");
    await expect(page.locator(".title")).toHaveText("Products");
  });
  test("Login with wrong password", { tag: ["@regression"] }, async ({ loginPage }) => {
    await loginPage.loginUser("standard_user", "wrongsecret_sauce");
    await expect(loginPage.errorMsg).toHaveText("Epic sadface: Username and password do not match any user in this service");
  });
  test("Submit with empty username", { tag: ["@regression"] }, async ({ loginPage }) => {
    await loginPage.loginUser("", "wrongsecret_sauce");
    await expect(loginPage.errorMsg).toHaveText("Epic sadface: Username is required");
  });
  test("Submit with empty password", { tag: ["@regression"] }, async ({ loginPage }) => {
    await loginPage.loginUser("standard_user", "");
    await expect(loginPage.errorMsg).toHaveText("Epic sadface: Password is required");
  });

  test("Login as locked_out_user", { tag: ["@regression"] }, async ({ loginPage }) => {
    await loginPage.loginUser("locked_out_user", "secret_sauce");
    await expect(loginPage.errorMsg).toHaveText("Epic sadface: Sorry, this user has been locked out.");
  });
});
