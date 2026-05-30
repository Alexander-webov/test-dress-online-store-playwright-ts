import { test, expect } from "../fixtures/loggedIn";

test.describe("Checkout page", () => {
  test(
    "Full purchase: login → add product → cart → checkout → fill info → finish | 'Thank you for your order!' confirmation shown ",
    { tag: ["@smoke"] },
    async ({ page, loginPage, cartPage, catalogPage, checkoutPage }) => {
      await catalogPage.addProductToCart("Sauce Labs Bolt T-Shirt");
      await cartPage.gotoCart();
      await checkoutPage.goTocheckout();
      await checkoutPage.fillFormCheckout("Alex", "Postol", "11201");
      await checkoutPage.clickContinueBtn();
      await checkoutPage.clickFinishBtn();
      await expect(page.getByTestId("complete-header")).toHaveText("Thank you for your order!");
    },
  );

  test("Continue checkout with empty First Name | Error: 'First Name is require'", { tag: ["@smoke"] }, async ({ page, loginPage, cartPage, catalogPage, checkoutPage }) => {
    await catalogPage.addProductToCart("Sauce Labs Bolt T-Shirt");
    await cartPage.gotoCart();
    await checkoutPage.goTocheckout();
    await checkoutPage.fillFormCheckout("", "Postol", "11201");
    await checkoutPage.clickContinueBtn();
    await expect(page.getByTestId("error")).toHaveText("Error: First Name is required");
  });

  test("Continue checkout with empty Last Name | Error: 'First Name is require'", { tag: ["@smoke"] }, async ({ page, loginPage, cartPage, catalogPage, checkoutPage }) => {
    await catalogPage.addProductToCart("Sauce Labs Bolt T-Shirt");
    await cartPage.gotoCart();
    await checkoutPage.goTocheckout();
    await checkoutPage.fillFormCheckout("Alex", "", "11201");
    await checkoutPage.clickContinueBtn();
    await expect(page.getByTestId("error")).toHaveText("Error: Last Name is required");
  });

  test("Continue checkout with empty Postal Code | Error: 'First Name is require'", { tag: ["@smoke"] }, async ({ page, loginPage, cartPage, catalogPage, checkoutPage }) => {
    await catalogPage.addProductToCart("Sauce Labs Bolt T-Shirt");
    await cartPage.gotoCart();
    await checkoutPage.goTocheckout();
    await checkoutPage.fillFormCheckout("Alex", "Postol", "");
    await checkoutPage.clickContinueBtn();
    await expect(page.getByTestId("error")).toHaveText("Error: Postal Code is required");
  });
});
