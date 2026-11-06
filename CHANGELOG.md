# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

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
