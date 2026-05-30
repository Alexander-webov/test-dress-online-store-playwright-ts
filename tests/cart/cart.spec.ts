import { test, expect } from "../fixtures/loggedIn";

test.describe("CartPage", () => {
  test("View cart after adding items | Added items appear in cart with correct names", { tag: ["@smoke"] }, async ({ page, cartPage, catalogPage }) => {
    const expectedName = "Sauce Labs Fleece Jacket";
    await catalogPage.addProductsToCart(["add-to-cart-sauce-labs-fleece-jacket"]);
    await expect(page.getByTestId("shopping-cart-link").getByTestId("shopping-cart-badge")).toHaveText(["add-to-cart-sauce-labs-fleece-jacket"].length.toString());
    await cartPage.gotoCart();
    await expect(await cartPage.getNameProductInTheCart()).toEqual(expectedName);
  });

  test("Remove an item from the cart | Item disappears", { tag: ["@regression"] }, async ({ page, cartPage, catalogPage }) => {
    await catalogPage.addProductsToCart(["add-to-cart-sauce-labs-fleece-jacket"]);
    await cartPage.gotoCart();
    await cartPage.removeItemFromCart("sauce-labs-fleece-jacket");
  });

  test("Click 'Continue Shopping' | Returns to inventory page", { tag: ["@regression"] }, async ({ page, cartPage, catalogPage }) => {
    await catalogPage.addProductsToCart(["add-to-cart-sauce-labs-fleece-jacket"]);
    await cartPage.gotoCart();
    await cartPage.continueShopping();
    await expect(page).toHaveURL(`${process.env.MAIN_URL}/inventory.html`);
  });
});
