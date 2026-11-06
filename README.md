# Lifecycle Roller Coaster

Your life is a journey. Let's see what the ride looks like.

Lifecycle Roller Coaster is an open-source web app that turns a free-text life story into a playful roller-coaster timeline. You write your story, AI extracts the events, you review them, and the app draws the ride for you to export as an image.

## Status

Early development: the landing page and story editor work, and the event schema exists. AI extraction, event review, track rendering and export are not built yet, so the Generate button does not send your story anywhere. See the roadmap in the [product blueprint](docs/lifecycle-roller-coaster-blueprint.md).

## Getting Started

Requires Node.js 24 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

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
| `src/app/` | Routes and the root layout |
| `src/components/` | UI components |
| `src/lib/events/` | Event schema shared by AI extraction and rendering |
| `src/lib/story/` | Pure rules for the story input |
| `docs/` | Product blueprint |

## Privacy

User stories can contain sensitive details. The app must not store raw narratives by default or log story content, and sharing is always opt-in.

## License

[MIT](LICENSE)
