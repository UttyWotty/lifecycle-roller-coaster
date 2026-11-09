# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

All essential roadmap phases (1 to 5) are released: the landing page, story editor, shared event schema, AI extraction, event review, the ride, and PNG export. v0.3.0 added ride styles, illustrated themes, custom titles and sample lives, v0.4.0 added fit to screen, character choice and two more themes, v0.5.0 added the four art modes, v0.6.0 added worlds, statistics, sharing, chapters and the life report, v0.7.0 added security headers and cleared the 0.6.0 tech debt, v0.7.1 fixed the remaining polish items, v0.7.2 patched a lint-tooling advisory, and v0.8.0 made the app safe to host publicly on Vercel. Known follow-ups are in `docs/tech-debt.md`.

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

v0.1 excludes accounts, payments, social networking, complex analytics, and a database. Life statistics and public share links are later phases (blueprint sections 9 and 11). Keep the tone playful: this is not a life-coaching or assessment product, and the graph is a creative representation rather than a measurement.

## Architecture Constraints

- **AI and rendering stay independent.** This is the key technical boundary (blueprint section 13). The LLM layer outputs structured event data; the visualization consumes only that data. Changing the AI provider must not touch the rendering engine, and manually entered events must render without any AI involved.
- **The LLM sits behind a provider-agnostic adapter.** `src/lib/ai/extractor.ts` is the interface, and `src/lib/ai/anthropicExtractor.ts` is the only module that imports the SDK or reads its settings. `extractRequest.ts` takes the extractor as an argument, so tests use a fake and never call the API.
- **Read the stop reason before the output.** Use `beta.messages.create` with `readModelOutput`, not `parse`: the SDK parser throws on truncated output before `stop_reason` can be read, and its error text can contain story fragments.
- **Stack:** Next.js + TypeScript and Tailwind CSS, with zod validating data at the boundaries. Server logic lives in Next.js route handlers rather than a separate backend. Planned additions are SVG (optionally D3.js) track generation, SVG-to-PNG export, and browser local storage.
- **Module layout:** `src/app` holds routes and `src/components` holds UI. `src/lib/events` is the shared contract and its editing logic, and stays pure. `RideFlow` owns the story and events and switches between the writing, ride and review stages. Generate goes straight to the ride, and the review stage is optional, reached through Edit my events. Stages stay separate so editing the story cannot wipe event edits. `useRideState` holds this state and its rules. Sample lives in `src/lib/samples` are built-in events that never call an AI provider: a sample must not overwrite text the user wrote, and its button is hidden once a real ride exists, so a paid extraction cannot be replaced by accident. Anything the user must see, such as the demo notice, belongs in `ReadingNotes`, which both stages show. AI code is in `src/lib/ai` and track generation goes in `src/lib/track`; each may import `src/lib/events` but never the other. `eslint.config.mjs` enforces these boundaries.

## Track Model

`buildTrack` in `src/lib/track` returns geometry only. Height is not a running total: each event sits at the level of its own signed impact, and a neutral event keeps the level before it. So 10 then 1 is a sharp drop even when both are positive, curves sharpen with the size of the move, and `MIN_LEVEL_SPAN` keeps small moves looking small. Stops sit in list order at even spacing, not on a true time scale, so the user's order is respected and undated events have a place.

Every ride style is a generator that returns the same `Track` type from `src/lib/track/types.ts`, registered in `rideStyles.ts`, so `RideTrack` and image export need no per-style code paths. Styles change only how events are drawn, never the events. Loop-the-loops adds a circle at each major stop. The metro map gives each category a full-width line, brings all lines through major stops, and returns them to their lanes between distant stops. `addTitle` runs last and shifts the ride down with `contentOffset`; style and title live in `RideFlow` so they survive stage changes.

Themes are separate from styles. `src/lib/scene` holds palettes and scenery, and `composeRide` is the one place that builds a style, adds headroom, a title and scenery. Scenery uses a fixed seed, never `Math.random`, so redraws do not flicker. All art is original and drawn in code. A palette's `kind` picks its scenery. Art modes are whole art directions, not recolours: `sceneModes.ts` maps a kind to its own backdrop, structure and rail in `src/components/Scene/modes`, and other kinds share the standard set, with landmarks in `SceneLandmarks.tsx` and building shapes in `SceneBuildings.tsx`. Worlds are art modes that also supply their own vehicle. Chapters and the report come from the same extraction call, and `src/lib/events/insights.ts` is their contract. `addChapters` follows event ids, so deleted events shrink a chapter; the report is not rewritten after edits and says so. Life Statistics in `src/lib/stats` need no AI and recalculate from events. Riders are listed in `riders.ts` and drawn in `RiderArt.tsx`, and new ones must stay original. Scene colours are fixed hex values, so they export unchanged. The moving cart is hidden from exports with `EXPORT_HIDDEN_ATTRIBUTE`, and page CSS shows it instead of the parked cart, which is all an exported image sees.

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

## Public Hosting

The app is hosted on Vercel's free Hobby plan with the owner's key, and nothing else may cost money. `/api/extract` wraps real readings in `src/lib/ai/limitedExtractor.ts`: per-visitor limits and a shared daily budget kept in Upstash's free tier (`src/lib/limits`), with a worst-case reservation before each call that is settled to the real cost after. On Vercel a missing or broken limit store fails closed, and BotID runs only in Vercel builds. Fixture mode skips all limits. Keep `ANTHROPIC_API_KEY` scoped to Production so previews never spend tokens. The README's "Deploying" section is the setup guide.
