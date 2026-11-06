# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
