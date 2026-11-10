# Tech Debt

Known follow-ups, oldest first. None of these block normal use.

- **minimatch override.** `package.json` forces minimatch 11 for the lint tooling to fix GHSA-g3hv-75wg-m249. Remove the `overrides` entry once ESLint and typescript-eslint depend on minimatch 11 or later, and check that `npm audit` stays clean. Checked 2026-11-10: ESLint 10.14.0 and typescript-eslint 8.72.2 still depend on minimatch ^10, which the advisory covers (fixed in 11.0.1), so the override stays.
- **TypeScript 6.1 and later.** `.github/dependabot.yml` ignores TypeScript 6.1 and later because typescript-eslint 8.72, which eslint-config-next pulls in, declares `typescript >=4.8.4 <6.1.0` and lint fails to load with TypeScript 7 (Dependabot PR #50, closed 2026-11-11). Remove the ignore once typescript-eslint supports the newer version, and check that `npm run lint` and `npm run typecheck` pass.
- **Story picture row edges.** When a long ride wraps onto rows, chapter-band names and metro lane lines are cut where one row ends and the next begins (stops and labels never are), and a very short ride leaves wide blank bands above and below the drawing (`storyCard.ts`).
