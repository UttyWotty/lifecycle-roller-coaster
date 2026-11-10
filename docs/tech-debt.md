# Tech Debt

Known follow-ups, oldest first. None of these block normal use.

- **minimatch override.** `package.json` forces minimatch 11 for the lint tooling to fix GHSA-g3hv-75wg-m249. Remove the `overrides` entry once ESLint and typescript-eslint depend on minimatch 11 or later, and check that `npm audit` stays clean. Checked 2026-11-10: ESLint 10.14.0 and typescript-eslint 8.72.2 still depend on minimatch ^10, which the advisory covers (fixed in 11.0.1), so the override stays.
- **Story picture row edges.** When a long ride wraps onto rows, chapter-band names and metro lane lines are cut where one row ends and the next begins (stops and labels never are), and a very short ride leaves wide blank bands above and below the drawing (`storyCard.ts`).
- **TODAY sign placement.** In the Nightmare theme the TODAY sign can overlap the hot-air balloon, and in the Space world it floats a little away from its faint dashed line (`FutureVeil.tsx`).
- **Undated stop after a future stop.** A future stop followed by an undated one shows no future at all, because the future is the run of future-dated stops at the end. Consider letting trailing undated stops join the future run (`futureStops.ts`).
