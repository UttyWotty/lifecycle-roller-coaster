# Lifecycle Roller Coaster

[![CI](https://github.com/UttyWotty/lifecycle-roller-coaster/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/UttyWotty/lifecycle-roller-coaster/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Your life is a journey. Let's see what the ride looks like.**

Write your life story in your own words, and watch it turn into a roller coaster. The highs climb, the lows drop, and the quiet years run flat. Correct anything that does not feel right, then download your ride as an image.

![An example roller coaster with stops for starting university, losing a job, getting married and running a first marathon](docs/images/example-ride.png)

This is a playful, creative picture of a story. It is not a psychological assessment or a measurement of anyone's life.

## Features

- **Free-form writing:** no questionnaire and no account. Just tell your story.
- **AI event extraction:** Claude finds the events, dates, categories and feelings in your text. It does not invent events, and it asks about anything unclear.
- **You have the final say:** edit, add, delete and reorder every event. AI guesses are labelled until you confirm them.
- **No AI required:** skip it and add your events by hand.
- **An adjustable ride:** select a stop and change how it felt or how much it mattered, and the track redraws at once.
- **Image export:** download a PNG that is created on your device.

## Getting Started

The app is not publicly hosted, so you run it on your own machine. You need Node.js 24 or later.

```bash
git clone https://github.com/UttyWotty/lifecycle-roller-coaster.git
cd lifecycle-roller-coaster
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:3000.

### Demo mode and real stories

The app starts in demo mode, so Generate returns four labelled sample events and costs nothing. Your story is not read in this mode.

To have Claude read real stories, edit `.env`:

```bash
ANTHROPIC_API_KEY=your-key-here
EXTRACTOR_MODE=anthropic
```

You need your own [Anthropic API key](https://console.anthropic.com/). With the default model, Claude Sonnet 5.5, a short story costs about one cent. Each extraction logs its token count to the server console.

Keep your key safe: `.env` is git-ignored, so never commit it, and never prefix its values with `NEXT_PUBLIC_`, because that would send them to the browser.

| Setting | Default | Purpose |
| --- | --- | --- |
| `EXTRACTOR_MODE` | `anthropic` in code, `fixture` in `.env.example` | `fixture` returns demo events, and `anthropic` calls the API |
| `ANTHROPIC_API_KEY` | none | Your API key, needed only for `anthropic` mode |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | The Claude model to use |

## How the Ride Is Drawn

Each event has a **sentiment** and an **impact** from 1 to 10, which are separate because a neutral event can still matter a lot.

- Positive events raise the track by their impact.
- Negative events lower the track by their impact.
- Neutral events keep the track flat.
- Events with an impact of 8 or more get a larger marker.

Height is cumulative, so the track shows the momentum of a story and not a score for each moment. Stops sit in the order of your list at even spacing, which keeps labels readable and gives undated events a place.

## Privacy

Life stories can be personal, so the app is built to hold on to as little as possible.

- Nothing leaves your browser until you press Generate. The page tells you this before you do.
- In `anthropic` mode, pressing Generate sends your story to the Anthropic API. Anthropic's own data policies apply to that request.
- The app has no database and no accounts. Your story and events live in the page and disappear when you close it.
- The server never logs story content, only error codes and token counts.
- Images are created on your device and are never uploaded. They contain titles, dates and markers, but not descriptions or your story.
- Nothing is ever shared unless you choose to share it.

## Architecture

A single Next.js app, with TypeScript, Tailwind CSS, zod and hand-drawn SVG.

```text
Story text --> POST /api/extract --> Provider adapter --> Validated events
                                                                |
                               Manual entry --------------------+
                                                                v
                                                          Review stage
                                                                |
                                                                v
                                     buildTrack --> Ride stage --> PNG export
```

The AI layer and the rendering engine are independent. The AI produces structured events, and the track generator reads only those events, so changing the provider never touches the visuals, and manual events work with no AI at all. Lint rules enforce this boundary.

| Path | Contents |
| --- | --- |
| `src/app/` | Routes, the root layout and the extraction endpoint |
| `src/components/` | UI for the story, review and ride stages |
| `src/lib/ai/` | Provider-agnostic extraction and the Claude adapter |
| `src/lib/events/` | The shared event schema and pure editing logic |
| `src/lib/story/` | Pure rules for the story input |
| `src/lib/track/` | The pure roller-coaster track generator |
| `src/lib/export/` | Pure preparation of the ride image |
| `e2e/` | Browser tests for the full user journey |
| `docs/` | The product blueprint |

To add a provider, implement the `EventExtractor` interface in `src/lib/ai/extractor.ts`.

## Development

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Generate route types and run the TypeScript compiler |
| `npm test` | Run the unit tests once, with no network or API key needed |
| `npm run test:watch` | Run the unit tests in watch mode |
| `npm run test:e2e` | Build the app and run the browser tests |

Browser tests need a browser, so run `npx playwright install chromium` once first. They always run in demo mode with an empty API key, so they never spend tokens, even if your `.env` holds a real key.

## Roadmap

Version 0.1.0 covers the full path from story to image. Ideas for later releases include visual themes, life statistics, shareable links and a local-model option. See the [product blueprint](docs/lifecycle-roller-coaster-blueprint.md) for the thinking behind them, and the [changelog](CHANGELOG.md) for what has shipped.

## Contributing

Contributions are welcome. Branch from `develop`, keep each change focused, and open a pull request into `develop`. Lint, typecheck, tests and the build must pass, and CI checks them on every pull request. Please use demo mode for manual testing, and never include real personal stories in issues, tests or examples.

## Deploying

Public hosting is not supported yet. Every Generate request spends tokens on the host's API key and the endpoint has no rate limiting, so anyone deploying this publicly should add rate limiting and set a spend limit first.

## License

[MIT](LICENSE)
