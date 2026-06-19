# Saucedemo E2E Tests — Playwright + TypeScript

End-to-end UI automation for [saucedemo.com](https://www.saucedemo.com), built with **Playwright** and **TypeScript**.

This is my first QA automation portfolio project — a practice ground for the patterns I'd use on a real team: the Page Object Model, dependency-chained fixtures, web-first assertions, parameterized negative tests, and CI via GitHub Actions.

---

## Tech stack

- **[Playwright](https://playwright.dev/)** — auto-waiting, trace viewer, built-in test runner
- **TypeScript**
- **Node.js 20+**
- **GitHub Actions** — CI on every push and pull request

---

## What's covered

### Login
- Brand logo visible on the login page
- Login with valid credentials → lands on the Products page
- Login with wrong password / empty username / empty password → correct error message
- `locked_out_user` → "this user has been locked out" error

### Catalog (inventory)
- Inventory loads with all 6 products visible
- Add one product → cart badge shows the right count
- Add three products → cart badge updates accordingly
- Add then remove a product from the inventory page
- Sort by name (A → Z) → list matches alphabetical order
- Sort by price (low → high) → list matches ascending price order

### Cart
- Added item appears in the cart with the correct name
- Remove an item from the cart → item disappears
- "Continue Shopping" returns to the inventory page

### Checkout
- Full happy path: login → add product → cart → checkout → fill info → finish → "Thank you for your order!" confirmation
- Negative validation: empty First Name / Last Name / Postal Code each produce the correct inline error

Tests are tagged `@smoke` (critical flows, run on every push) and `@regression` (full coverage).

---

## Project structure

```
my-1-project-saucedemo/
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── catalog.spec.ts
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
└── .env
```

---

## Getting started

```bash
git clone https://github.com/Alexander-webov/test-dress-online-store-playwright-ts.git
cd test-dress-online-store-playwright-ts

npm install
npx playwright install
```

### Environment variables

```
MAIN_URL=https://www.saucedemo.com
```

---

## Running tests

```bash
# all tests
npx playwright test

# smoke only
npx playwright test --grep @smoke

# regression only
npx playwright test --grep @regression

# a specific file
npx playwright test tests/cart/cart.spec.ts

# headed / UI mode / step debug
npx playwright test --headed
npx playwright test --ui
npx playwright test --debug

# last HTML report
npx playwright show-report
```

---

## Architecture

### Page Object Model

Each page is a class; tests call business-level methods instead of touching `data-test` attributes directly. If the markup changes, only the page object needs updating.

```typescript
export class CartPage {
  constructor(private readonly page: Page) {}

  get itemName() {
    return this.page.getByTestId("inventory-item-name");
  }

  async gotoCart() {
    await this.page.getByTestId("shopping-cart-link").click();
  }

  async removeItemFromCart(productName: string) {
    const slug = productName.toLowerCase().replace(/\s+/g, "-");
    await this.page.getByTestId(`remove-${slug}`).click();
  }
}
```

### Fixtures with a dependency chain

Most tests need a logged-in session. Rather than repeating login in every test, `catalogPage`, `cartPage`, and `checkoutPage` all depend on `loginPage`, so login runs once automatically:

```typescript
export const test = baseTest.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginUser("standard_user", "secret_sauce");
    await use(loginPage);
  },
  catalogPage: async ({ page, loginPage }, use) => {
    await use(new CatalogPage(page));
  },
  // cartPage, checkoutPage follow the same pattern
});
```

```typescript
test("Item appears in cart with correct name", async ({ catalogPage, cartPage }) => {
  await catalogPage.addProductToCart("Sauce Labs Bolt T-Shirt");
  await cartPage.gotoCart();
  await expect(cartPage.itemName).toHaveText("Sauce Labs Bolt T-Shirt");
});
```

### Web-first assertions

Assertions live on locators, not on manually extracted text — Playwright retries automatically until the condition holds, removing a whole class of timing flakiness:

```typescript
// ✅ auto-waits and retries
await expect(cartPage.itemName).toHaveText("Sauce Labs Bolt T-Shirt");

// ❌ race-prone — reads once, no retry
const text = await page.locator(".name").textContent();
expect(text).toBe("Sauce Labs Bolt T-Shirt");
```

### Sort assertions built from real data, not hardcoded lists

Rather than asserting a fixed expected order, the test reads the actual rendered list and checks it's internally sorted — this stays correct even if the underlying product set changes:

```typescript
const names = await catalogPage.getProductNames();
expect(names).toEqual([...names].sort());
```

---

## CI/CD — GitHub Actions

Runs on every push and pull request; the HTML report (traces, screenshots, video on failure) is uploaded as a workflow artifact.

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Known limitations / next steps

- `.env` is currently committed (not gitignored) — harmless here since it only holds a public URL, but worth moving to `.env.example` + secrets for hygiene
- No cross-browser run yet — Chromium only
- Negative checkout cases could be consolidated into one data-driven test instead of three near-duplicates

---

## Key practices applied

- Page Object Model with business-level method signatures
- Custom fixtures with a dependency chain — no duplicated login setup
- Web-first, auto-retrying assertions
- Positive and negative coverage (login errors, checkout validation)
- `@smoke` / `@regression` tagging for targeted runs
- Environment variables instead of hardcoded URLs
- CI on every push, with report artifacts for debugging failures

---

## Author

[Alexander-webov](https://github.com/Alexander-webov) — built as part of my hands-on QA automation learning. This is the first of four planned portfolio projects before moving into job search.
