import { Page } from "playwright";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async goTocheckout() {
    await this.page.getByTestId("checkout").click();
  }

  async fillFormCheckout(firstName: string, lastName: string, postalCode: string) {
    await this.page.getByTestId("firstName").fill(firstName);
    await this.page.getByTestId("lastName").fill(lastName);
    await this.page.getByTestId("postalCode").fill(postalCode);
  }

  async clickContinueBtn() {
    await this.page.getByTestId("continue").click();
  }
  async clickCanceBtn() {
    await this.page.getByTestId("cancel").click();
  }
  async clickFinishBtn() {
    await this.page.getByTestId("finish").click();
  }
}
