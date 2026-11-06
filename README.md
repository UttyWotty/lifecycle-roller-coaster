# Lifecycle Roller Coaster

Your life is a journey. Let's see what the ride looks like.

Lifecycle Roller Coaster is an open-source web app that turns a free-text life story into a playful roller-coaster timeline. You write your story, AI extracts the events, you review them, and the app draws the ride for you to export as an image.

## Status

Early development: you can write a story and see the events AI finds in it. Event review, track rendering and export are not built yet. See the roadmap in the [product blueprint](docs/lifecycle-roller-coaster-blueprint.md).

## Getting Started

Requires Node.js 24 or later.

```bash
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:3000. `.env.example` sets `EXTRACTOR_MODE=fixture`, so Generate returns labelled demo events and spends no tokens. To read real stories, add your Anthropic API key to `.env` and set `EXTRACTOR_MODE=anthropic`. `.env` is git-ignored, so never commit it or prefix its values with `NEXT_PUBLIC_`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Generate route types and run the TypeScript compiler |
| `npm test` | Run the tests once |
| `npm run test:watch` | Run the tests in watch mode |

## Project Structure

| Path | Contents |
| --- | --- |
| `src/app/` | Routes, the root layout and the extraction endpoint |
| `src/components/` | UI components |
| `src/lib/ai/` | Provider-agnostic extraction and the Claude adapter |
| `src/lib/events/` | Event schema shared by AI extraction and rendering |
| `src/lib/story/` | Pure rules for the story input |
| `docs/` | Product blueprint |

## Privacy

User stories can contain sensitive details. When you press Generate, your story is sent to the Anthropic API to find the events in it. This app does not store your story or log its content, and sharing is always opt-in.

## Deployment

Do not deploy publicly until the extraction endpoint has rate limiting and the API key has a spend limit, because every Generate request spends tokens.

## License

[MIT](LICENSE)
