import { type Page, type Locator } from "playwright";

export class LoginPage {
  private readonly page: Page;
  readonly errorMsg: Locator;
  constructor(page: Page) {
    this.page = page;
    this.errorMsg = page.getByTestId("error");
  }

  async toGo() {
    await this.page.goto(`${process.env.MAIN_URL}`);
  }

  async loginUser(email: string, password: string) {
    await this.page.getByPlaceholder("Username").fill(email);
    await this.page.getByPlaceholder("Password").fill(password);
    await this.page.getByTestId("login-button").click();
  }
}
