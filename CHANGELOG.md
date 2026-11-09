# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.8.0] - 2026-11-09

### Added

- The app can now be hosted publicly on Vercel's free plan. Real readings are protected by per-visitor limits (5 an hour, 12 a day), a hard daily budget across all visitors ($1 by default), and Vercel BotID, and refuse to spend when the limit store is missing. The README has a step-by-step deploy guide.

### Changed

- A reading's output is capped at 12,000 tokens instead of 16,000, which bounds the cost of any single reading.

## [0.7.2] - 2026-11-09

### Security

- Lint tooling now uses minimatch 11, which fixes a moderate denial-of-service advisory (GHSA-g3hv-75wg-m249). It is forced with an npm override until ESLint and typescript-eslint upgrade on their own; remove the override then.

## [0.7.1] - 2026-11-09

### Changed

- Updated ESLint to 10, React to 19.3.1, the Node.js type definitions to 26, and the CI checkout and setup-node actions to 7.

### Fixed

- Space planets keep clear of stop labels and metro line names.
- The chapter strip is dark with light names on night-sky themes, instead of a bright bar.
- Years covered names a single year once, such as "2015" rather than "2015 to 2015".
- Ocean voyage loops have a foam lip, so they read as breaking waves.

## [0.7.0] - 2026-11-09

### Changed

- On wide screens the pinned style and theme bar is one short row, about 120 pixels tall instead of about 204, so it covers much less of the drawing while you scroll.

### Fixed

- Life chapter bands stay apart after events are reordered; a chapter split by the new order is shown as separate bands.
- Rockets, boats and other vehicles parked at the end of the ride are no longer cut off at the edge of the drawing or the exported image.
- Claude now marks every feeling it guesses as a best guess, even for events where the feeling seems obvious, such as a divorce or an injury, and gives life chapters varied names instead of ending each with "Era".
- The balloon and parachute now float clear of every label and of each other, in every theme.
- Exported images carry the wordmark on a small badge in the top-right corner, so it reads cleanly on dark themes and never covers the chapter bands.
- Minimal Mode keeps less empty sky above the ride, and its supports no longer run through labels.
- Haunted night has arched, framed windows on the near towers only, so none seem to float in the sky.
- The Retro fairground Ferris wheel is a soft silhouette that stays behind the steel and labels.
- Ocean voyage shows open sea behind deep troughs, and its loops are drawn as curling waves.
- The Arcade level ground uses calm, staggered bricks.

### Tests

- The export tests now open every exported image and check its sky colour, its wordmark badge and that the ride is drawn, for every theme, style and rider, instead of only checking that the file is a PNG.

### Security

- Every page and API response now sends a content security policy and refuses to be framed, along with other standard security headers.
- AI output is capped in size, so a story cannot make the model return a huge or unreadable ride.
- Image export no longer rewrites a title that happens to look like a colour attribute.
- Added a security policy for private vulnerability reports, and Dependabot updates for npm packages and GitHub Actions.

## [0.6.0] - 2026-11-06

### Added

- Four new worlds that tell your story as a different journey: Space mission, Ocean voyage, Mountain trek and Arcade level, each with its own vehicle.
- Life Statistics, worked out from your events with no AI, including your biggest comeback and longest steady stretch.
- Life Chapters and a playful Life Report, written by Claude in the same reading of your story.
- Share my ride, which uses your device's share sheet or copies the image.
- Preview cards for every theme, and a strip of themes on the landing page.

### Changed

- Style and theme now sit in a compact bar right above the drawing, pinned while scrolling, so every choice changes what is on screen.

## [0.5.0] - 2026-11-06

### Added

- Four art modes that each draw the ride in a different way: Classic Ride, a soft pastel toy; Nightmare Mode, a glowing neon city; Minimal Mode, black line art; and Retro Mode, a vintage poster.

### Changed

- The haunted theme is now called Haunted night.

## [0.4.0] - 2026-11-06

### Added

- Retro fairground and Nightmare mode themes, each with its own scenery: tents and Ferris wheels, or haunted towers, a moon and bats.
- Choose your character: Smiley, Cat, Robot, Astronaut, Dino or Ghost rides your cart.
- Fit to screen, an optional toggle that shows a whole long ride without scrolling.

### Changed

- The metro map has more room between stops, so its lines fan out less steeply.
- Golden sunset has a lighter sky, so lines and steel stand out more.

### Fixed

- The balloon and parachute now sit in front of the steel instead of behind it.

## [0.3.0] - 2026-11-06

### Changed

- Track height now comes from each event's own points, so a big gap between two events makes a sharp drop or climb.

### Added

- Ride styles: choose the classic Coaster, Loop-the-loops with a full loop at every big moment, or a Metro map with one line for each part of your life.
- Custom ride titles, shown on the ride and in the downloaded image.
- Illustrated themes: Sunny day, Golden sunset and Starry night scenes with clouds, a city skyline, a steel lattice, flags and label pills, plus the original look as Simple.
- A cart that rides the track through every loop, with Ride again to replay it, and a balloon and parachute that mark the best and hardest moments.
- Sample lives: eight made-up stories that open as a finished ride in one click, for free, with nothing to write.

## [0.2.0] - 2026-11-06

### Changed

- Generate now goes straight from the story to the ride, and editing events is an optional step.
- Demo mode now shows a clear notice that the events are samples and the story was not read.
- The landing page example now comes from the real track generator.

### Added

- Playwright browser tests for the full user journey, which run on every pull request and never call a real AI provider.

## [0.1.1] - 2026-11-06

### Changed

- README rewritten for open-source readers, with an example ride image.

## [0.1.0] - 2026-11-06

### Added

- Next.js, TypeScript and Tailwind CSS application with a placeholder landing page.
- Shared event schema with validation and tests.
- ESLint, typecheck, Vitest, CI workflow and harness configuration.
- README, MIT license and changelog.
- Landing page with an example ride and a link to the story editor.
- Story editor with example prompts, a length limit and a privacy note.
- AI event extraction through a provider-agnostic interface, with a Claude adapter.
- `POST /api/extract` endpoint and clarification questions.
- Notice that explains what is sent to Anthropic before the user presses Generate.
- Lint rules that enforce the boundaries between AI, rendering and shared event code.
- `.env.example` with the required settings.
- `EXTRACTOR_MODE=fixture` returns labelled demo events, so development spends no tokens.
- Server logs record the token count of each extraction.
- Event review stage with editing, add, delete with undo, reorder, sort by date and best-guess confirmation.
- Option to skip AI and add events by hand.
- Roller-coaster track generated from events, with cumulative height, category colours and large markers for major events.
- Ride stage where selecting a stop lets users change its sentiment and impact and see the track update at once.
- PNG export of the ride, created in the browser with nothing uploaded.

### Changed

- Event dates that do not exist on the calendar, such as `2015-02-31`, are now rejected.
- AI now suggests a likely sentiment when the story does not state one, labelled as a best guess.

### Security

- CI workflow runs with a read-only repository token.
- The extraction endpoint limits body size and story length before any paid API call.
- The API key stays on the server, and errors and logs never contain story content.
