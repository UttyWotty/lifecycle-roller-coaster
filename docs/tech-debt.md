# Tech Debt

Known follow-ups, oldest first. None of these block normal use.

- **minimatch override.** `package.json` forces minimatch 11 for the lint tooling to fix GHSA-g3hv-75wg-m249. Remove the `overrides` entry once ESLint and typescript-eslint depend on minimatch 11 or later, and check that `npm audit` stays clean.
- **Ride together cart off-screen on phones.** At 375px wide, when one person's ride ends before the other's, that cart can sit parked outside the visible part of the drawing while the view follows the shared timeline. Cosmetic only.
