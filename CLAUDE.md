# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

All essential roadmap phases (1 to 5) are released: the landing page, story editor, shared event schema, AI extraction, event review, the ride, and PNG export.

`docs/lifecycle-roller-coaster-blueprint.md` is the source of truth for product intent. Read the relevant section before implementing a feature.

## Commands

```bash
npm run dev                  # development server on http://localhost:3000
npm run build                # production build
npm run lint                 # ESLint
npm run typecheck            # generate route types, then tsc
npm test                     # all tests once
npx vitest run src/lib/events/schema.test.ts   # one test file
npx vitest run -t "rejects duplicate ids"      # one test by name
npm run test:e2e             # build, then run the browser tests in e2e/
npx playwright test e2e/ride.spec.ts           # one browser spec, after a build
```

This Next.js version differs from older releases. Read the guide in `node_modules/next/dist/docs/` before using framework APIs. `AGENTS.md` is written by `next dev`, so keep it committed.

## What Is Being Built

Lifecycle Roller Coaster is an open-source web app that turns a free-text life story into a playful roller-coaster timeline. The v0.1 flow is: write story, AI extracts events, user reviews and edits them, app renders the ride, user exports it as an image. No account is required.

v0.1 excludes accounts, payments, social networking, complex analytics, and a database. Themes, life statistics, and public share links are later phases (blueprint sections 9 and 11). Keep the tone playful: this is not a life-coaching or assessment product, and the graph is a creative representation rather than a measurement.

## Architecture Constraints

- **AI and rendering stay independent.** This is the key technical boundary (blueprint section 13). The LLM layer outputs structured event data; the visualization consumes only that data. Changing the AI provider must not touch the rendering engine, and manually entered events must render without any AI involved.
- **The LLM sits behind a provider-agnostic adapter.** `src/lib/ai/extractor.ts` is the interface, and `src/lib/ai/anthropicExtractor.ts` is the only module that imports the SDK or reads its settings. `extractRequest.ts` takes the extractor as an argument, so tests use a fake and never call the API.
- **Read the stop reason before the output.** Use `beta.messages.create` with `readModelOutput`, not `parse`: the SDK parser throws on truncated output before `stop_reason` can be read, and its error text can contain story fragments.
- **Stack:** Next.js + TypeScript and Tailwind CSS, with zod validating data at the boundaries. Server logic lives in Next.js route handlers rather than a separate backend. Planned additions are SVG (optionally D3.js) track generation, SVG-to-PNG export, and browser local storage.
- **Module layout:** `src/app` holds routes and `src/components` holds UI. `src/lib/events` is the shared contract and its editing logic, and stays pure. `RideFlow` owns the story and events and switches between the writing, review and ride stages, which stay separate so editing the story cannot wipe event edits. AI code is in `src/lib/ai` and track generation goes in `src/lib/track`; each may import `src/lib/events` but never the other. `eslint.config.mjs` enforces these boundaries.

## Track Model

`buildTrack` in `src/lib/track` returns geometry only. Height is cumulative: positive events add their impact, negative events subtract it, and neutral events stay flat. Stops sit in list order at even spacing, not on a true time scale, so the user's order is respected and undated events have a place.

Image export reuses the on-screen SVG. `src/lib/export/rideImage.ts` rewrites its markup with a fixed light palette, and `downloadRideImage.ts` converts it to PNG in the browser, so nothing is uploaded.

## Event Data Model

`src/lib/events/schema.ts` implements the blueprint section 4 schema and is the contract between AI and rendering. TypeScript types are inferred from the zod schemas, so change the schema rather than the types.

- `date` is `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`; `null` means unknown and gets approximate placement.
- `impact` is an integer from 1 to 10, and `confidence` is from 0 to 1.
- `sentiment` and `impact` are separate values: a neutral event can still be highly significant.
- Users have the final say and can override AI sentiment and impact. Changing intensity must update the graph immediately.

## AI Extraction Rules

- Never invent events, and preserve the user's original meaning.
- Ask for clarification when dates are ambiguous; represent inferred dates and uncertain interpretations as uncertain, not as facts.
- Do not treat every negative event as a failure.
- When the story states no feeling, suggest the expected sentiment with confidence below `LOW_CONFIDENCE_THRESHOLD`, so the UI labels it as a best guess.

## Token Use

Real extraction spends the owner's money, so ask before any live API call and keep runs few. Unit tests use fake extractors, and CI has no key. `playwright.config.ts` forces `EXTRACTOR_MODE=fixture` and an empty key, so browser tests can never spend tokens. For manual testing, use `EXTRACTOR_MODE=fixture`, which returns labelled demo events for free. Server logs record the token count of each real extraction.

## Privacy Requirements

User stories can contain sensitive personal details.

- Do not store raw narratives by default, and do not log story content.
- Tell users what is sent to an external AI provider.
- Keep generated data in the browser where practical. The story lives in React state in `StoryEditor`, and it leaves the browser only through `requestExtraction.ts` when the user presses Generate.
- Log only error codes, never exception text from the provider or the parser.
- Sharing is opt-in; never publish a ride automatically.

## Before Public Deployment

The app is deliberately not publicly hosted for now. `/api/extract` spends real tokens on every call and has no rate limiting, so add rate limiting and set a spend limit on the API key before any public deployment.
