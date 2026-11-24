# Repository Guidelines

## Project structure

ShopLedger is a Node.js and Express point-of-sale app. `server.js` mounts the API routers and serves the browser UI from `public/`. Edit page markup in `public/index.html`, browser interactions in `public/js/app.js`, and styles in `public/css/style.css`.

Keep HTTP parsing, status codes, and responses in `routes/`. Put business rules in `lib/`. For example, `routes/orders.js` coordinates checkout, while `lib/pricing.js`, `lib/tax.js`, and `lib/coupons.js` calculate amounts. Shop settings, GST slabs, and coupon definitions live in `config.js`. The JSON store in `lib/store.js` persists orders, stock, and Khata balances together in `data/db.json`.

## Local development

- `npm ci` installs the versions recorded in `package-lock.json`.
- `npm start` runs `node server.js`. Open `http://localhost:3000` or set `PORT` to choose another port. Express serves the static assets directly. There is no build step.
- `npm test` runs a placeholder that exits with failure. The repository has no test suite, test naming convention, or coverage target.

## Coding style

Follow the surrounding JavaScript style: two-space indentation, CommonJS modules, single-quoted strings, and semicolons. Use camelCase for functions and fields, as in `computeTotals` and `paymentMode`. Keep module filenames lowercase. No lint or formatting command is configured.

## Verifying changes

Use a disposable working copy for checkout, cancellation, and settlement checks. Those actions rewrite `data/db.json`. For billing changes, compare the cart preview, saved order, and printable invoice. Order #1004 is a useful fixture: its 5% GST item and capped `SAVE10` coupon exercise two known differences between checkout and invoice calculations. For Khata changes, check the customer balance and physical stock before and after cancellation.

## Commits and pull requests

Recent commits use short, lowercase subjects describing the affected feature, such as `support hsn gst slabs and coupon maxDiscount caps`. Follow that pattern. In a pull request, describe the behavior change and the checks performed. For pricing changes, include a worked order with expected GST, discount, and total. Include a screenshot when changing the POS or invoice layout.