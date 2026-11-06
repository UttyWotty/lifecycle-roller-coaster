# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

The repository is an early scaffold: a single Next.js app with a placeholder landing page and the shared event schema. The story editor, AI extraction, track rendering, and export are not built yet.

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
```

This Next.js version differs from older releases. Read the guide in `node_modules/next/dist/docs/` before using framework APIs. `AGENTS.md` is written by `next dev`, so keep it committed.

## What Is Being Built

Lifecycle Roller Coaster is an open-source web app that turns a free-text life story into a playful roller-coaster timeline. The v0.1 flow is: write story, AI extracts events, user reviews and edits them, app renders the ride, user exports it as an image. No account is required.

v0.1 excludes accounts, payments, social networking, complex analytics, and a database. Themes, life statistics, and public share links are later phases (blueprint sections 9 and 11). Keep the tone playful: this is not a life-coaching or assessment product, and the graph is a creative representation rather than a measurement.

## Architecture Constraints

- **AI and rendering stay independent.** This is the key technical boundary (blueprint section 13). The LLM layer outputs structured event data; the visualization consumes only that data. Changing the AI provider must not touch the rendering engine, and manually entered events must render without any AI involved.
- **The LLM sits behind a provider-agnostic adapter**, so a local model can be added later.
- **Stack:** Next.js + TypeScript and Tailwind CSS, with zod validating data at the boundaries. Server logic lives in Next.js route handlers rather than a separate backend. Planned additions are SVG (optionally D3.js) track generation, SVG-to-PNG export, and browser local storage.
- **Module layout:** `src/app` holds routes and `src/components` holds UI. `src/lib/events` is the shared contract and stays pure. AI code goes in `src/lib/ai` and track generation in `src/lib/track`; each may import `src/lib/events` but never the other.

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

## Privacy Requirements

User stories can contain sensitive personal details.

- Do not store raw narratives by default, and do not log story content.
- Tell users what is sent to an external AI provider.
- Keep generated data in the browser where practical.
- Sharing is opt-in; never publish a ride automatically.
