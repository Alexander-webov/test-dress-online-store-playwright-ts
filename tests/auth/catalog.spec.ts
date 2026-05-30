import { test, expect } from "../fixtures/loggedIn";

test.describe("testing catalog page", () => {
  test("Open inventory after login and check product on the page", { tag: ["@smoke"] }, async ({ page, catalogPage }) => {
    await expect(page.getByTestId("inventory-item")).toHaveCount(6);
  });

  test("Add one product to cart", { tag: ["@regression"] }, async ({ page, catalogPage }) => {
    const shopping_cart_link = page.getByTestId("shopping-cart-link");
    const productNames = ["add-to-cart-sauce-labs-fleece-jacket"];
    await catalogPage.addSomeProductsToCart(productNames);
    await expect(shopping_cart_link.getByTestId("shopping-cart-badge")).toHaveText(productNames.length.toString());
  });

  test("Add three products to cart", { tag: ["@regression"] }, async ({ catalogPage, page }) => {
    const shopping_cart_link = page.getByTestId("shopping-cart-link");
    const productNames = ["add-to-cart-sauce-labs-fleece-jacket", "add-to-cart-sauce-labs-backpack", "add-to-cart-sauce-labs-onesie"];
    await catalogPage.addSomeProductsToCart(productNames);
    await expect(shopping_cart_link.getByTestId("shopping-cart-badge")).toHaveText(productNames.length.toString());
  });

  test("Add then remove a product from inventory", { tag: ["@regression"] }, async ({ catalogPage, page }) => {
    const shopping_cart_link = page.getByTestId("shopping-cart-link");
    const productNames = ["add-to-cart-sauce-labs-bike-light"];
    await catalogPage.addSomeProductsToCart(productNames);
    await expect(shopping_cart_link.getByTestId("shopping-cart-badge")).toHaveText(productNames.length.toString());
    await catalogPage.removeProduct("remove-sauce-labs-bike-light");
  });

  test("Sort by Name (A → Z) / (low → high)", { tag: ["@regression"] }, async ({ catalogPage, page }) => {
    /* "az", "za", "lohi", "hilo" */
    await catalogPage.sortBy("az");
    await expect(page.getByTestId("product-sort-container")).toHaveValue("az");
    const names = await catalogPage.getProductNames();
    const expected = [...names].sort();
    expect(names).toEqual(expected);
    /*   expect(catalogPage.checkedSortkByLowTOHigh).toBeTruthy(); */
  });

  test("Sort by low → high", { tag: ["@regression"] }, async ({ catalogPage, page }) => {
    /* "az", "za", "lohi", "hilo" */
    await catalogPage.sortBy("lohi");
    await expect(page.getByTestId("product-sort-container")).toHaveValue("lohi");
    const prices = await catalogPage.getProductPrices();
    const expected = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(expected);
  });
  /* Open a product detail page | Product name and price match the selected item */
});
/* "az" */
