# Lifecycle Roller Coaster

[![CI](https://github.com/UttyWotty/lifecycle-roller-coaster/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/UttyWotty/lifecycle-roller-coaster/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Your life is a journey. Let's see what the ride looks like.**

Write your life story in your own words, and the AI turns it straight into a roller coaster. The highs climb, the lows drop, and the quiet years run flat. Adjust anything that does not feel right, then download your ride as an image.

![An illustrated roller coaster in a sunny city, with loops, a cart, a balloon and a parachute, passing stops for starting university, losing a job, getting married and building a company](docs/images/example-ride.png)

This is a playful, creative picture of a story. It is not a psychological assessment or a measurement of anyone's life.

## Features

- **Free-form writing:** no questionnaire and no account. Just tell your story.
- **AI event extraction:** Claude finds the events, dates, categories and feelings in your text. It does not invent events, and it asks about anything unclear.
- **From text to ride in one step:** you do not have to fill in any forms.
- **You have the final say:** editing is optional, and you can change, add, delete and reorder every event. AI guesses are labelled there until you confirm them.
- **No AI required:** skip it and add your events by hand.
- **An adjustable ride:** select a stop and change how it felt or how much it mattered, and the track redraws at once.
- **Ride styles:** draw your life as the classic coaster, with loop-the-loops at every big moment, or as a metro map with a line for each part of your life.
- **Art modes:** four completely different looks for your ride. Classic Ride is a soft pastel toy, Nightmare Mode a glowing neon city, Minimal Mode black line art, and Retro Mode a vintage poster.
- **Worlds:** tell your story as a Space mission, Ocean voyage, Mountain trek or Arcade level, each with its own vehicle.
- **Life Chapters and Life Report:** Claude names the eras of your life and writes a short, playful report in the same reading of your story.
- **Life Statistics:** your biggest comeback, biggest drop and longest steady stretch, worked out from your events with no AI.
- **Share your ride:** share the image through your device, or copy it. Nothing is shared unless you choose to.
- **Illustrated themes:** a full scene with sky, skyline, steel lattice and flags, in Sunny day, Golden sunset, Starry night, Retro fairground or Haunted night. A cart rides the track, and a balloon and parachute mark your best and hardest moments.
- **Sample lives:** try a random made-up life in one click, with nothing to write and no API key.
- **Your title:** name your ride, and the title appears on the drawing and in the image.
- **Choose your character:** pick who rides your cart, from six original characters.
- **Fit to screen:** an optional toggle that shows a whole long ride at once, instead of scrolling sideways.
- **Image export:** download a PNG that is created on your device.

## Getting Started

To run it on your own machine you need Node.js 24 or later. To host it publicly, see [Deploying](#deploying).

```bash
git clone https://github.com/UttyWotty/lifecycle-roller-coaster.git
cd lifecycle-roller-coaster
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:3000. Choose **Try a sample life** to see a finished ride straight away, with no key needed.

### Demo mode and real stories

The app starts in demo mode, so Generate ignores what you wrote and returns the same four sample events, with a clear notice on the review screen. This costs nothing, and lets you try the app without a key.

To have Claude read real stories, edit `.env`:

```bash
ANTHROPIC_API_KEY=your-key-here
EXTRACTOR_MODE=anthropic
```

You need your own [Anthropic API key](https://console.anthropic.com/). With the default model, Claude Sonnet 5.5, a short story of a paragraph or two costs about 1.5 cents, including its chapters and report (about 2,500 input and 1,000 output tokens). Each extraction logs its token count to the server console.

Keep your key safe: `.env` is git-ignored, so never commit it, and never prefix its values with `NEXT_PUBLIC_`, because that would send them to the browser.

| Setting | Default | Purpose |
| --- | --- | --- |
| `EXTRACTOR_MODE` | `anthropic` in code, `fixture` in `.env.example` | `fixture` returns demo events, and `anthropic` calls the API |
| `ANTHROPIC_API_KEY` | none | Your API key, needed only for `anthropic` mode |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | The Claude model to use |

## How the Ride Is Drawn

Each event has a **sentiment** and an **impact** from 1 to 10, which are separate because a neutral event can still matter a lot.

- Positive events sit above the middle, higher the more they mattered.
- Negative events sit below the middle, lower the more they mattered.
- Neutral events keep the track flat.
- Events with an impact of 8 or more get a larger marker.

Height comes from each event's own points, so a 10 followed by a 1 is a sharp drop and a 1 followed by a 10 is a sharp climb, and the bigger the gap, the steeper the move. Stops sit in the order of your list at even spacing, which keeps labels readable and gives undated events a place.

On a metro map, each category is its own line. A stop sits above its line when it felt good and below when it felt hard, and every line meets at events with an impact of 8 or more.

## Privacy

Life stories can be personal, so the app is built to hold on to as little as possible.

- Nothing leaves your browser until you press Generate. The page tells you this before you do.
- In `anthropic` mode, pressing Generate sends your story to the Anthropic API. Anthropic's own data policies apply to that request.
- The app has no database of stories and no accounts. Your story and events live in the page and disappear when you close it.
- On the public site, a small counter store keeps how many readings each visitor started this hour and day, and the day's total spend. A visitor is a keyed one-way hash of their network address, never the address itself, and every counter deletes itself within two days.
- The server never logs story content, only error codes and token counts.
- Images are created on your device and are never uploaded. They contain titles, dates and markers, but not descriptions or your story.
- Nothing is ever shared unless you choose to share it.

## Architecture

A single Next.js app, with TypeScript, Tailwind CSS, zod and hand-drawn SVG.

```text
Story text --> POST /api/extract --> Provider adapter --> Validated events
                                                                |
                 Manual entry --> event editing ----------------+
                                                                v
                                     buildTrack --> Ride stage --> PNG export
                                                        ^
                                                        |
                                              Optional event editing
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

The app covers the full path from story to image. Ideas for later releases include visual themes, life statistics, shareable links and a local-model option. See the [product blueprint](docs/lifecycle-roller-coaster-blueprint.md) for the thinking behind them, and the [changelog](CHANGELOG.md) for what has shipped.

## Contributing

Contributions are welcome. Branch from `develop`, keep each change focused, and open a pull request into `develop`. Lint, typecheck, tests and the build must pass, and CI checks them on every pull request. Please use demo mode for manual testing, and never include real personal stories in issues, tests or examples.

## Security

Please report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md), rather than in a public issue. Every response carries a strict content security policy and refuses framing; the policy lives in `src/lib/security/securityHeaders.ts`.

## Deploying

The app runs on Vercel's free Hobby plan, with a free Upstash Redis database for its limits. Every real reading spends tokens on the host's Anthropic key, so the public site protects that key in four layers:

1. **Per visitor:** 5 readings an hour and 12 a day. After that the visitor sees a friendly message and can still explore sample lives.
2. **Daily budget:** a hard cap on spend across all visitors, $1 a UTC day by default (`DAILY_BUDGET_USD`). Each reading reserves its worst-case cost before calling Claude and settles to the real cost afterwards, so readings started at the same moment cannot overspend.
3. **Bot protection:** Vercel BotID (free Basic mode) blocks scripted requests before any tokens are spent.
4. **Fail closed:** on Vercel, if the limit store is missing or unreachable, Generate refuses to call Claude instead of spending unchecked.

Demo mode (`EXTRACTOR_MODE=fixture`) costs nothing, so it skips the limits.

### Step by step

1. **Make a separate API key with a spend limit.** In the [Anthropic Console](https://console.anthropic.com/), create a workspace for the public site, set a monthly spend limit on it (a little above 30 times the daily budget), and create an API key in that workspace. This is the last line of defence if everything else failed.
2. **Import the repository.** Sign in to [Vercel](https://vercel.com/) with GitHub on the free Hobby plan, choose **Add New → Project**, and import this repository. Leave the framework settings as detected.
3. **Set the production branch.** In **Settings → Environments → Production**, make sure the production branch is `main`, so only releases go live.
4. **Add the limit store.** In the project's **Storage** tab, add **Upstash for Redis** from the Marketplace on the free plan, connect it to the project, and let it add its variables. Under **Settings → Environment Variables**, confirm `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`) are present.
5. **Add environment variables.** In **Settings → Environment Variables**:

   | Name | Value | Environments |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | the key from step 1 | Production only |
   | `EXTRACTOR_MODE` | `anthropic` | Production only |
   | `EXTRACTOR_MODE` | `fixture` | Preview and Development |
   | `DAILY_BUDGET_USD` | `1` | Production |

   Keeping the key out of Preview means preview deployments of pull requests can never spend tokens.
6. **Check a preview first.** Open any preview deployment, generate a ride, and confirm the demo reading appears. This proves BotID and the security headers work on Vercel at no cost.
7. **Deploy production.** Redeploy `main` (Vercel deploys it automatically on each release). Generate one real ride and check the function log for the token count.

To pause real readings at any time, set `DAILY_BUDGET_USD` to `0` and redeploy; sample lives keep working.

## License

[MIT](LICENSE)
