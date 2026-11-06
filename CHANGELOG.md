# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Next.js, TypeScript and Tailwind CSS application with a placeholder landing page.
- Shared event schema with validation and tests.
- ESLint, typecheck, Vitest, CI workflow and harness configuration.
- README, MIT license and changelog.
- Landing page with an example ride and a link to the story editor.
- Story editor with example prompts, a length limit and a privacy note.
- AI event extraction through a provider-agnostic interface, with a Claude adapter.
- `POST /api/extract` endpoint and a read-only list of the events found, with clarification questions.
- Notice that explains what is sent to Anthropic before the user presses Generate.
- Lint rules that enforce the boundaries between AI, rendering and shared event code.
- `.env.example` with the required settings.

### Changed

- Event dates that do not exist on the calendar, such as `2015-02-31`, are now rejected.

### Security

- CI workflow runs with a read-only repository token.
- The extraction endpoint limits body size and story length before any paid API call.
- The API key stays on the server, and errors and logs never contain story content.
