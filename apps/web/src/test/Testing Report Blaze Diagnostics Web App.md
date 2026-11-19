# Testing Report: Blaze Diagnostics Web App

Prepared for Rorisang · 19 November 2026

## Summary

The goal was to write and run automated tests for the `QuoteBuilder` component in the Blaze Diagnostics web app (`apps/web`), and to get the project's whole test suite running. The suite grew from 47 passing tests with 13 failing files to 84 passing tests with 1 failing file. The one remaining failure is the new `QuoteBuilder` test file, which is still waiting for a one-line fix.

## Project setup

- **Repository:** pnpm monorepo at `BlazeDiagnosis`, with the web app in `apps/web`.
- **Stack:** Next.js, React, TypeScript.
- **Test runner:** Vitest, run with `pnpm --filter @blaze-diagnostics/web test`.
- **Existing tests:** 26 test files already covered API routes, services, schemas and utilities.
- **New work:** tests for the `QuoteBuilder` component, using React Testing Library.

## What I did

### 1. Chose the approach

I covered the three levels of testing (unit, integration, end-to-end) and used Jest-style syntax as the model. For the React component we chose Vitest with React Testing Library, which renders the component in a fake browser and interacts with it the way a user would.

### 2. Wrote the QuoteBuilder tests

Seven tests were written in `src/test/QuoteBuilder.test.tsx`:

1. Starts with the branded quote number and two line items.
2. Shows the correct starting total.
3. Add item appends a new empty row.
4. Duplicate copies a row.
5. The last remaining line item cannot be removed.
6. Changing a unit price updates the total.
7. Saving stores the draft in `localStorage` and shows a status message.

The tests replace three dependencies with fakes (mocks): the tenant branding module, the money formatter, and the invoice preview component. This keeps the tests focused on `QuoteBuilder` itself.

### 3. Installed the missing packages

The first run failed because `@testing-library/react` was not installed. The packages had first been suggested with `npm`, but the project uses `pnpm`. They were installed with `pnpm --filter @blaze-diagnostics/web add -D ...`.

### 4. Merged the config with the existing one

The project already had a `vitest.config.ts` and a `src/test/setup.ts`. Instead of replacing them, the existing config was edited to add the React plugin and a test environment block. The `@` alias and the `server-only` mock were kept as they were.

## Problems found and how they were fixed

| # | Problem | Cause | Fix | Result |
| --- | --- | --- | --- | --- |
| 1 | `Cannot find package '@testing-library/react'` | Packages installed with the wrong tool | Installed with pnpm | Resolved |
| 2 | `Missing AUTH0_DOMAIN or AUTH0_AUDIENCE` (12 files) | `verify.ts` throws on import when the variables are missing | Added fake values under `test.env` in `vitest.config.ts` | Resolved |
| 3 | `Cannot find module '/src/test/QuoteBuilder'` | The test imported the component with `./`, but the test file is in `src/test/` | Changed the import to the `@/...` alias path of the real component file | Resolved |
| 4 | `DATABASE_URL is required` (8 files) | `db/client.ts` throws on import when the variable is missing | Added a fake `DATABASE_URL` under `test.env` | Resolved |
| 5 | `window is not defined` (7 tests) | The config runs tests in `node`, which has no browser objects | Add `// @vitest-environment jsdom` as the very first line of the test file | **Still open** |

## Results over time

| Run | Files failed | Files passed | Tests passed | Tests failed |
| --- | --- | --- | --- | --- |
| First run | 13 | 14 | 47 | 0 |
| After the Auth0 fix | 9 | 18 | 57 | 0 |
| After the import fix and `DATABASE_URL` | 1 | 26 | 84 | 7 |

The error messages printed in the middle of the latest run (`Cross-tenant access denied`, `ZodError`) are expected. Those tests check that the API rejects bad requests, so the errors are logged on purpose, and each of those tests passes.

## Current status

- **26 of 27 test files pass** (84 of 91 tests).
- **Open item:** `QuoteBuilder.test.tsx` fails all 7 tests with `window is not defined`. The jsdom comment is not yet the first line of the file.
- **Not yet verified:** the expected totals in the QuoteBuilder tests (`R2242.50` and `R3565.00`) were calculated from the component code alone, without seeing `calculateQuoteTotals` or the business rules. They may need correcting.

## Next steps

1. Make `// @vitest-environment jsdom` the first line of `src/test/QuoteBuilder.test.tsx`, save, and run the suite again.
2. For any QuoteBuilder test that fails on a number, work out the correct total by hand from the business rules (is tax applied per line, and is the discount taken before or after tax), then decide whether the test or the code is wrong. Do not change the expected value just to make it pass.
3. Write separate unit tests for `calculateQuoteTotals`, covering discounts, different tax rates, zero quantity and empty lists.
4. Delete any `vitest.setup.ts` file created at the project root, and any `package-lock.json` created by `npm`, since the project uses `src/test/setup.ts` and pnpm.
5. Align the `vitest` and `@vitest/coverage-v8` versions (4.1.9 and 4.1.10) to remove the peer dependency warning.

## Key lessons

- Check which package manager a project uses before installing anything.
- Edit an existing config instead of replacing it.
- Modules that throw at import time (missing environment variables) fail every test that imports them, even if the test does not use that code.
- Errors can hide behind each other. Fixing the Auth0 error revealed the database error that was behind it.
- Always confirm which run you are reading. Matching start times and random values show a pasted output is from the same run.
- A passing test only proves something if its expected value was verified independently of the code.
