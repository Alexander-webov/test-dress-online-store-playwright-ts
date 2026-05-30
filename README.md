# Saucedemo E2E Tests — Playwright + TypeScript

End-to-end UI automation for [saucedemo.com](https://www.saucedemo.com) built with **Playwright** and **TypeScript**.

This is a learning project where I practiced modern QA automation patterns I would use on a real team: the Page Object Model, dependency-chained fixtures, web-first assertions, parameterized negative tests, and CI integration via GitHub Actions.

---

## Tech Stack

- **[Playwright](https://playwright.dev/)** — modern end-to-end testing framework with auto-waiting and trace viewer
- **TypeScript** — static typing for tests and page objects
- **Node.js 20+**
- **GitHub Actions** — CI: tests run on every push and pull request

---

## What's Covered

### Cart
- Add an item to cart → cart badge shows correct count
- Added item appears in cart with the correct name
- Remove an item from cart → item disappears
- "Continue Shopping" returns to the inventory page

### Checkout
- Full happy-path purchase: login → add product → cart → checkout → fill info → finish → "Thank you for your order!" confirmation
- Negative validation cases:
  - Empty First Name → "Error: First Name is required"
  - Empty Last Name → "Error: Last Name is required"
  - Empty Postal Code → "Error: Postal Code is required"

Tests are tagged with `@smoke` (critical flows) and `@regression` (broader coverage) for targeted runs.

---

## Project Structure

```
my-1-project-saucedemo/
├── tests/
│   ├── cart/
│   │   └── cart.spec.ts
│   └── checkout/
│       └── checkout.spec.ts
├── pages/
│   ├── LoginPage.ts
│   ├── CatalogPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── fixtures/
│   └── loggedIn.ts
├── .github/
│   └── workflows/
│       └── playwright.yml
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Alexander-webov/my-1-project-saucedemo.git
cd my-1-project-saucedemo

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Variables

Copy the example file and edit if needed:

```bash
cp .env.example .env
```

`.env`:
```env
MAIN_URL=https://www.saucedemo.com
```

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run only smoke tests
npx playwright test --grep @smoke

# Run only regression tests
npx playwright test --grep @regression

# Run a specific test file
npx playwright test tests/cart/cart.spec.ts

# Run in headed mode (visible browser)
npx playwright test --headed

# Run in UI mode (interactive debugging — recommended while developing)
npx playwright test --ui

# Debug a single test step by step
npx playwright test --debug

# Open the last HTML report
npx playwright show-report
```

---

## Architecture

### Page Object Model (POM)

Each page on saucedemo.com is encapsulated as a class. Tests never reference `data-test` attributes directly — they call business-level methods like `addProductToCart('Sauce Labs Bolt T-Shirt')`. If the markup changes, only the page object needs an update; tests stay untouched.

**Example — `pages/CartPage.ts`:**

```typescript
import { type Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  // Locators exposed as getters — used directly in test assertions
  get itemName() {
    return this.page.getByTestId('inventory-item-name');
  }

  get cartBadge() {
    return this.page.getByTestId('shopping-cart-badge');
  }

  // Actions — one method, one responsibility
  async gotoCart() {
    await this.page.getByTestId('shopping-cart-link').click();
  }

  async removeItemFromCart(productName: string) {
    const slug = productName.toLowerCase().replace(/\s+/g, '-');
    await this.page.getByTestId(`remove-${slug}`).click();
  }
}
```

**Principles followed:**
- Methods accept business-level parameters (product names, not test-ids) — no leaky abstraction
- Locators exposed as getters, ready for `expect()` assertions
- Single responsibility per method

---

### Custom Fixtures with Dependency Chain

Most tests need a logged-in user. Instead of duplicating login in every `beforeEach`, fixtures handle it via a dependency chain — `cartPage` and `catalogPage` depend on `loginPage`, so login runs automatically once.

**`fixtures/loggedIn.ts`:**

```typescript
import { test as baseTest, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type Pages = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = baseTest.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginUser('standard_user', 'secret_sauce');
    await use(loginPage);
  },
  catalogPage: async ({ page, loginPage }, use) => {
    await use(new CatalogPage(page));
  },
  cartPage: async ({ page, loginPage }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page, loginPage }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect };
```

In a test, just declare the page object you need — login happens automatically:

```typescript
test('Item appears in cart with correct name', async ({ catalogPage, cartPage }) => {
  await catalogPage.addProductToCart('Sauce Labs Bolt T-Shirt');
  await cartPage.gotoCart();
  await expect(cartPage.itemName).toHaveText('Sauce Labs Bolt T-Shirt');
});
```

---

### Web-First Assertions

The project uses Playwright's auto-waiting assertions on **locators** rather than manually extracting text. This eliminates a whole class of flakiness from race conditions.

```typescript
// ✅ Auto-waits for the element, retries until match
await expect(cartPage.itemName).toHaveText('Sauce Labs Bolt T-Shirt');

// ❌ Race-prone — element may not exist yet at this exact moment
const text = await page.locator('.name').textContent();
expect(text).toBe('Sauce Labs Bolt T-Shirt');
```

---

### Negative Test Cases

Negative paths are tested explicitly — empty fields on the checkout form must trigger validation errors:

```typescript
test('Continue checkout with empty First Name', async ({ cartPage, catalogPage, checkoutPage }) => {
  await catalogPage.addProductToCart('Sauce Labs Bolt T-Shirt');
  await cartPage.gotoCart();
  await checkoutPage.gotoCheckout();
  await checkoutPage.fillFormCheckout('', 'Postol', '11201');
  await checkoutPage.clickContinueBtn();
  await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
});
```

---

## CI/CD — GitHub Actions

Tests run automatically on every push and pull request. The HTML report is uploaded as a workflow artifact for easy debugging of failures.

**`.github/workflows/playwright.yml`:**

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          MAIN_URL: https://www.saucedemo.com

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

After every run, the HTML report (including traces, screenshots, and videos for failed tests) is downloadable from the workflow run page.

---

## Key Practices Applied

- **Page Object Model** — separation of test logic and UI details
- **Custom fixtures with dependency chain** — no duplicated setup across tests
- **Web-first assertions** — `expect(locator).toHaveX()` instead of manual text extraction
- **Business-level method parameters** — `addProductToCart('Product Name')`, not `addProductToCart('add-to-cart-product-name')`
- **Positive and negative test coverage** — checkout validation is tested explicitly
- **Test tagging** — `@smoke` / `@regression` for targeted runs
- **Environment variables** — no hardcoded URLs in test code
- **CI integration** — tests run on every push, reports archived as artifacts

---

## Roadmap

- [ ] Add login tests (locked-out user, wrong credentials, empty fields)
- [ ] Refactor negative checkout cases into a single data-driven test
- [ ] Visual regression with Playwright snapshots
- [ ] Sharding in GitHub Actions for parallel execution
- [ ] Slack/Telegram notification on CI failure
- [ ] Performance metrics collection per test

---

## Resources

- [Playwright documentation](https://playwright.dev)
- [Page Object Model — Playwright guide](https://playwright.dev/docs/pom)
- [Saucedemo test site](https://www.saucedemo.com)

---

## Author

[Alexander-webov](https://github.com/Alexander-webov)

> Built as part of my hands-on learning of QA automation. Feedback is welcome.
