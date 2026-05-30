import { Page } from "playwright";

export class CartPage {
  constructor(private readonly page: Page) {}
  async gotoCart() {
    await this.page.getByTestId("shopping-cart-link").click();
  }
  private removeButtonFor(productName: string) {
    const slug = productName.toLowerCase().replace(/\s+/g, "-");
    return this.page.getByTestId(`remove-${slug}`);
  }

  async removeItemFromCart(productName: string) {
    await this.removeButtonFor(productName).click();
  }

  async getNameProductInTheCart() {
    return await this.page.getByTestId("inventory-item-name").textContent();
  }
  async continueShopping() {
    await this.page.getByTestId("continue-shopping").click();
  }
}
