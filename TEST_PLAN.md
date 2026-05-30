# Test Plan — Sauce Demo

**Application under test:** https://www.saucedemo.com
**Type:** e-commerce web app (login → browse → cart → checkout)
**Author:** Alexander
**Framework:** Playwright + TypeScript (POM, fixtures, CI via GitHub Actions)

---

## 1. Purpose

This document defines what is tested in Sauce Demo, why, and at what priority.
It applies risk-based test design: critical business flows are covered first
and marked as smoke; lower-risk behaviour is covered as regression; low-value
and third-party concerns are explicitly out of scope.

---

## 2. Scope

### In scope

- Authentication (login, login error handling, logout)
- Product catalog (display, sorting, product detail)
- Cart (add, remove, persistence)
- Checkout flow (information, overview, confirmation, validation)
- Session navigation (logout, reset app state)

### Out of scope — and why

| Area                                            | Reason for exclusion                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| Footer social links (Twitter/Facebook/LinkedIn) | Third-party destinations; not our application logic                         |
| Visual appearance / CSS / layout pixels         | Belongs to visual testing (separate discipline/tooling)                     |
| `problem_user`, `visual_user` behaviour         | Deliberately broken UI — specialized visual-bug scenarios, advanced         |
| `performance_glitch_user` behaviour             | Performance testing — separate discipline (load/perf tools)                 |
| Cross-browser matrix (Firefox/WebKit)           | Chromium first; other engines can be added later if needed                  |
| Backend / API                                   | Sauce Demo exposes no public API; API testing covered in a separate project |

---

## 3. Test Strategy

- **Pyramid position:** Sauce Demo is UI-only, so coverage is E2E UI tests.
  On a real product, lower-level logic would be covered by API/unit tests first.
- **Categories:**
  - `@smoke` — the critical few. "Is the product fundamentally usable?"
    Run on every push/PR. Must always be green.
  - regression — the full suite (smoke + detailed + negative cases).
    Run nightly / before release.
- **Test types:** positive (happy path) and negative (invalid input, error handling).
- **Design techniques:** equivalence partitioning and boundary value analysis
  to keep the number of cases minimal but representative.

---

## 4. Test Environment & Data

- **URL:** https://www.saucedemo.com (configured via `MAIN_URL` env / `baseURL`)
- **Browser:** Chromium (Playwright)
- **Test users:**
  - `standard_user` — normal behaviour (primary user for positive tests)
  - `locked_out_user` — blocked at login (negative test)
- **Shared password:** `secret_sauce`

---

## 5. Page Objects (automation structure)

| Page Object            | Represents          | Key elements                                                |
| ---------------------- | ------------------- | ----------------------------------------------------------- |
| `LoginPage`            | Login screen        | username, password, login button, error message             |
| `InventoryPage`        | Product catalog     | product list, add/remove buttons, cart badge, sort dropdown |
| `ProductDetailPage`    | Single product view | name, price, add to cart, back button                       |
| `CartPage`             | Cart contents       | cart items, remove buttons, continue shopping, checkout     |
| `CheckoutInfoPage`     | Checkout step 1     | first name, last name, postal code, continue, cancel        |
| `CheckoutOverviewPage` | Checkout step 2     | item summary, totals, finish, cancel                        |
| `CheckoutCompletePage` | Confirmation        | "Thank you for your order!" message, back home              |

---

## 6. Test Cases

### 6.1 Login — `LoginPage`

| ID     | Type     | Priority   | Scenario                                     | Expected result                                        |
| ------ | -------- | ---------- | -------------------------------------------- | ------------------------------------------------------ |
| TC-L01 | Positive | **smoke**  | Login as `standard_user` with valid password | Redirected to inventory page; "Products" title visible |
| TC-L02 | Negative | regression | Login with wrong password                    | Error: "...Username and password do not match..."      |
| TC-L03 | Negative | regression | Login as `locked_out_user`                   | Error: "...Sorry, this user has been locked out."      |
| TC-L04 | Negative | regression | Submit with empty username                   | Error: "...Username is required"                       |
| TC-L05 | Negative | regression | Submit with empty password                   | Error: "...Password is required"                       |

### 6.2 Inventory / Catalog — `InventoryPage`

| ID     | Type     | Priority   | Scenario                                 | Expected result                                |
| ------ | -------- | ---------- | ---------------------------------------- | ---------------------------------------------- |
| TC-I01 | Positive | **smoke**  | Open inventory after login               | 6 products displayed                           |
| TC-I02 | Positive | regression | Add one product to cart                  | Cart badge shows "1"                           |
| TC-I03 | Positive | regression | Add three products to cart               | Cart badge shows "3"                           |
| TC-I04 | Positive | regression | Add then remove a product from inventory | Cart badge decreases / disappears              |
| TC-I05 | Positive | regression | Sort by Name (A → Z)                     | Products ordered alphabetically ascending      |
| TC-I06 | Positive | regression | Sort by Price (low → high)               | Products ordered by ascending price            |
| TC-I07 | Positive | regression | Open a product detail page               | Product name and price match the selected item |

### 6.3 Cart — `CartPage`

| ID     | Type     | Priority   | Scenario                                   | Expected result                               |
| ------ | -------- | ---------- | ------------------------------------------ | --------------------------------------------- |
| TC-C01 | Positive | **smoke**  | View cart after adding items               | Added items appear in cart with correct names |
| TC-C02 | Positive | regression | Remove an item from the cart               | Item disappears; badge updates                |
| TC-C03 | Positive | regression | Click "Continue Shopping"                  | Returns to inventory page                     |
| TC-C04 | Positive | regression | Navigate inventory → cart with items added | Items persist in cart                         |

### 6.4 Checkout — `CheckoutInfoPage` / `CheckoutOverviewPage` / `CheckoutCompletePage`

| ID      | Type     | Priority   | Scenario                                                                  | Expected result                                |
| ------- | -------- | ---------- | ------------------------------------------------------------------------- | ---------------------------------------------- |
| TC-CO01 | Positive | **smoke**  | Full purchase: login → add product → cart → checkout → fill info → finish | "Thank you for your order!" confirmation shown |
| TC-CO02 | Negative | regression | Continue checkout with empty First Name                                   | Error: "First Name is required"                |
| TC-CO03 | Negative | regression | Continue checkout with empty Last Name                                    | Error: "Last Name is required"                 |
| TC-CO04 | Negative | regression | Continue checkout with empty Postal Code                                  | Error: "Postal Code is required"               |
| TC-CO05 | Positive | regression | Reach overview step                                                       | Item, quantity and total are correct           |
| TC-CO06 | Positive | regression | Cancel during checkout                                                    | Returns to cart / inventory as expected        |

### 6.5 Session & Navigation

| ID     | Type     | Priority   | Scenario                   | Expected result             |
| ------ | -------- | ---------- | -------------------------- | --------------------------- |
| TC-N01 | Positive | regression | Logout via menu            | Returns to login page       |
| TC-N02 | Positive | regression | "Reset App State" via menu | Cart cleared; badge removed |

---

## 7. Smoke Suite (the critical few)

Run on every push/PR. If any fail, the build is considered broken:

- TC-L01 — user can log in
- TC-I01 — catalog loads
- TC-C01 — items reach the cart
- TC-CO01 — full purchase completes end-to-end

These four answer: _"Can a user log in, see products, add them, and buy?"_
If yes, the product is fundamentally usable.

---

## 8. Risk Notes

- **Highest risk / highest value:** login and the full checkout flow.
  If these break, the product is unusable / the business cannot transact.
  → always covered, marked smoke.
- **Medium:** cart operations, sorting, checkout validation.
  Annoying if broken but the core flow still works → regression.
- **Low / excluded:** cosmetic and third-party concerns (see Out of Scope).
