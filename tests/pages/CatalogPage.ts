import { type Page, expect } from "@playwright/test";

export class CatalogPage {
  constructor(private readonly page: Page) {}
  //
  async addSomeProductsToCart(arrayForAddProducts: Array<string>) {
    for (let i = 0; i < arrayForAddProducts.length; i++) {
      await this.page.getByTestId(arrayForAddProducts[i]).click();
    }
  }
  async addProductToCart(productName: string) {
    const slug = productName.toLowerCase().replace(/\s+/g, "-");
    await this.page.getByTestId(`add-to-cart-${slug}`).click();
  }
  async removeProduct(productName: string) {
    const slug = productName.toLowerCase().replace(/\s+/g, "-");
    this.page.getByTestId(`remove-${slug}`).click();
  }

  async sortBy(howSort: string) {
    await this.page.getByTestId("product-sort-container").selectOption({ value: howSort });
  }
  async getProductNames() {
    return this.page.getByTestId("inventory-item-name").allTextContents();
  }
  async getProductPrices() {
    const texts = await this.page.getByTestId("inventory-item-price").allTextContents();
    return texts.map((t) => Number(t.replace("$", "")));
  }
}
