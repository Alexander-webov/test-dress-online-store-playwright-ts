import { test as baseTest } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CatalogPage } from "../pages/CatalogPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";

type Pages = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = baseTest.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.toGo();
    await loginPage.loginUser("standard_user", "secret_sauce");
    await use(loginPage);
  },
  catalogPage: async ({ page, loginPage }, use) => {
    const catalogPage = new CatalogPage(page);
    await use(catalogPage);
  },
  cartPage: async ({ page, loginPage }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page, loginPage, cartPage }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },
});
export { expect } from "@playwright/test";
