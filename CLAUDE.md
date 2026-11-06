# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

This repository is pre-code: it contains only the product blueprint, `docs/lifecycle-roller-coaster-blueprint.md`, and is not yet a git repository. There is no application, build, lint, or test tooling. When the scaffold is added, record the real commands here, including how to run a single test, and do not assume any until then.

The blueprint is the source of truth for product intent. Read the relevant section before implementing a feature.

## What Is Being Built

Lifecycle Roller Coaster is an open-source web app that turns a free-text life story into a playful roller-coaster timeline. The v0.1 flow is: write story, AI extracts events, user reviews and edits them, app renders the ride, user exports it as an image. No account is required.

v0.1 excludes accounts, payments, social networking, complex analytics, and a database. Themes, life statistics, and public share links are later phases (blueprint sections 9 and 11). Keep the tone playful: this is not a life-coaching or assessment product, and the graph is a creative representation rather than a measurement.

## Architecture Constraints

- **AI and rendering stay independent.** This is the key technical boundary (blueprint section 13). The LLM layer outputs structured event data; the visualization consumes only that data. Changing the AI provider must not touch the rendering engine, and manually entered events must render without any AI involved.
- **The LLM sits behind a provider-agnostic adapter**, so a local model can be added later.
- **Planned stack:** Next.js + TypeScript, Tailwind CSS, SVG (optionally D3.js) track generation, SVG-to-PNG export, and browser local storage. The backend is either FastAPI or a Next.js API. The blueprint allows a single Next.js app for a small first release, and this choice is still open.

## Event Data Model

The schema in blueprint section 4 is the contract between AI and rendering. Each event has `id`, `date`, `title`, `description`, `category`, `sentiment`, `impact`, and `confidence`.

- `sentiment` and `impact` are separate values: a neutral event can still be highly significant.
- Users have the final say and can override AI sentiment and impact. Changing intensity must update the graph immediately.
- Categories: education, career, relationships, finance, business, personal, health, other.

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
