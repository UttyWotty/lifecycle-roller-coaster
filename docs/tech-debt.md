# Tech Debt

Known follow-ups, oldest first. None of these block normal use.

- **minimatch override.** `package.json` forces minimatch 11 for the lint tooling to fix GHSA-g3hv-75wg-m249. Remove the `overrides` entry once ESLint and typescript-eslint depend on minimatch 11 or later, and check that `npm audit` stays clean.
- **Ride together is not independently reviewed.** v0.11.0 shipped it without a QA round, at the owner's request. Run one: alignment edge cases (undated events, mixed date precision, rides that never overlap, out-of-order dates), hostile pair links, both entry points, phone and desktop.
- **Ride together skips loops.** Its carts move by x along each track's profile, so in Loop-the-loops style they pass under the loops instead of riding them (`useTogetherPlayback`, `poseAtX`).
- **Stale lens comes back.** When a lens loses its events it falls back to the whole life on screen, but the chosen id stays in state and in the saved ride, so it quietly re-activates if those events return (`useRideState`, `RideResult`).
- **Static title placeholder.** "Name your ride" always shows "My 20s Roller Coaster" as its placeholder, whatever lens or title the drawing shows (`RideControls.tsx`).
- **Cart covers the first stop in Ride it.** During the pause at stop 1 the playback cart sits over that stop's label.
- **Fit to screen during Ride it.** Toggling it mid-ride scrolls the page down to the controls, so the cart is out of view until the user scrolls back.
