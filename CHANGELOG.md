# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Watercolor art mode:** your life painted in soft washes on textured paper, like a page from a sketchbook. Rolling hills are layered washes with edges that bleed and pool like wet paint, clouds and warm colour blooms drift in the sky, and the track is a sepia ink line over a broad brush of colour, to a gentle, unhurried tune.

- **Dreamland art mode:** your life as a puffy balloon ride floating on a bank of clouds, under soft pastel rainbows and twinkling sparkles. The track is a glossy pink tube on mint legs, a smiling jelly cart carries your rider, and a slow, dreamy tune plays along.

- **8-Bit Life art mode:** your life as a bright daytime pixel adventure, with blocky clouds, stepped green hills and a rail resting on stacked stone blocks. Big climbs fly a LEVEL UP! banner and big drops a CHECKPOINT banner, a place to catch your breath rather than a game over. Labels are square, a pixel cart carries your rider, and a chiptune plays along. All of it is original, taken from no existing game.

- **Comic Book art mode:** your life as a comic strip. Each chapter is a bright panel with halftone dots and a thick black frame, every stop speaks from a speech bubble, the track is inked in bold black and red, and the biggest drops and climbs burst out of the sky with POW! and WOW!. It has its own bouncy tune, and like every look it is drawn in code and free.

- **Random ride:** one press redraws your ride in a surprise style, theme and character, always in a theme you are not already in. Your events stay exactly as they are, and since every look is drawn in your browser from the same events, trying looks never sends your story anywhere or costs anything.

## [0.16.0] - 2026-11-11

### Added

- **Storybook world:** your life as a paper theatre in a picture book. Every chapter is its own page with a fold where it turns, each stop hangs on a thread from a paper garland over cut-paper hills, clouds and trees, the track is a stitched red ribbon, and a paper aeroplane carries your rider to a light storybook tune.

- **River trip world:** your life as a canoe trip down a river through green banks, under a warm afternoon sky. Steep stretches run as white-water rapids with a splash below each big drop, calm stretches carry lily pads and reeds, and an original paddling tune plays along.

- **Your constellation world:** your life as a figure of stars across a midnight sky. Every moment is a star, bigger for bigger moments and warm gold, cool blue or white by how it felt; each chapter is its own figure, with a faint dotted bridge to the next, and a comet carries your rider to a slow, dreamy tune.

- **Growing garden world:** your life as a vine climbing garden canes. Good moments bloom into flowers, hard ones grow a ring of thorns and calm ones sprout leaves, each bigger for bigger moments. The ground changes season with each chapter, from spring to winter, and a ladybug carries your rider to its own gentle tune. Like every look, it is free and drawn in code.

- **Send feedback:** a new page, linked from the footer and the end of the ride screen, to say how it was (Loved it, It was fine, Something was confusing) and share ideas or bugs in an optional message. Only your choice, your words, the language and the day are kept; your story, your events and who you are are never sent with it. It is protected against spam and limited so the free hosting can never run out.

### Changed

- **A calmer ride screen:** your ride and Ride it now come first, and everything else is one tap away in sections you can open: Edit, Ride options (Sound, Music, Narrate, Non-stop, Ride again), Make it yours (style, theme, character, name and lens), Share (images, poster, video, link, embed and Ride together) and More about your ride (statistics). On a phone the drawing now starts on the first screen. Your own ride remembers which sections you left open; a shared ride's page still stores nothing on your device, and Ride together with my ride stays in view there.

## [0.15.3] - 2026-11-11

### Fixed

- The story picture now also keeps Nightmare Mode's neon signs, the balloon and the parachute whole where a long ride wraps onto the next row. When a ride is too crowded to keep everything whole, labels and chapter names win over scenery.

## [0.15.2] - 2026-11-11

### Changed

- Updated TypeScript to 6.0.3 and Tailwind CSS to 4.3.5. Nothing changes for people using the app.

## [0.15.1] - 2026-11-11

### Fixed

- In Minimal Mode, labels are now outlined tags, so where the rail runs behind a label it reads as passing behind it instead of looking cut.

## [0.15.0] - 2026-11-11

### Fixed

- The story picture no longer cuts a stop's label or a chapter name in half where a long ride wraps onto the next row, and a short ride sits centred on the card with its title, instead of between wide empty bands.

### Added

- **Languages:** the rest of the app now speaks Turkish too: a ride someone shared with you, Guess my ride with its questions, reveals, score and shared score message, Ride together with its names, card, ending and share box, adding a friend's ride to a group, the embed page, and the messages for links that do not work. With this, every screen of the app is translated.

## [0.14.0] - 2026-11-10

### Added

- **Languages:** a language picker in the footer, starting with Turkish. A Turkish browser gets Turkish automatically, and the choice is remembered on this device. The landing page, the story box, the event review, My rides and the ride screen are translated so far, including their errors and confirmations: Ride it, the look choices, lenses, statistics, the life report panel, the TODAY sign, export, video and share controls. Narrate speaks in the chosen language, and the story picture, the poster and the ride video carry their words in it too; the rest of the app follows. The AI already writes your events and report in the language of your story.

- **Group rides:** Ride together now takes up to four rides. On a ride together, Add a friend's ride brings in another ride link; everyone's years line up, each ride gets its own cart, and the card names everyone's moment. Two-ride links work as before.

- **Embed your ride:** Copy embed code, in the share panel, gives a snippet to paste into a blog or website. It shows your ride there with Ride it, and links back to the full ride and to make your own, opening in a new tab. The ride lives only in the snippet's link, as with share links, and only the embed page may be shown inside other sites.

- **Download poster:** a print-ready A3 landscape poster of your ride, with its title, years and stops, the whole drawing and the wordmark, at about 290 dpi. It is made on your device like the other images.

- **Music:** a new button next to Sound plays a short looping tune that suits your theme while Ride it plays, from a music box for the toy theme to a chiptune for the arcade world, quietly under the ride sounds. Every tune is original and made in your browser with no audio files. Ride videos include it when Music is on. It starts off and is remembered on this device.

- **Narrate:** a new button next to Sound has your device's own voice read each stop's place, date and title as the cart reaches it during Ride it, and say when the ride ends. Nothing is downloaded or sent anywhere. It starts off and is remembered on this device; pausing or exiting stops the voice at once. Ride videos are not narrated, because browsers cannot record their own voice.

- **My rides:** keep up to 12 rides on this device, such as your life, your career or a parent's story. Start a New ride, open another or delete one (it asks first). Your current saved ride moves into My rides automatically, the last ride you opened opens again next time, and a sample never replaces a saved ride. Story text is still never saved.

### Fixed

- The TODAY sign is now a solid label like a stop's, so it reads over any scenery, and its dashed line shows in every theme, including the Space world.
- An undated stop after a future stop no longer hides the future: undated stops at the end join what is still to come, in the drawing and in the statistics.
- Ride videos keep the whole cart in view at the start, and the ending card's text fades in only once the drawing has faded away, so it never sits over faded labels.

## [0.13.1] - 2026-11-10

### Added

- **Non-stop:** a new button next to Sound makes Ride it roll through every stop without pausing, slowing only a little as the cart passes each one. Each stop's story and chime still come as the cart reaches it. Make a ride video follows the same choice, for a shorter, flowing clip. It starts off and is remembered on this device; with reduced motion the ride keeps its pauses.

## [0.13.0] - 2026-11-10

### Added

- Ride videos: Make a ride video records a portrait 1080 by 1920 clip of the cart riding your life with its sounds, each stop captioned, the camera following the cart, and an ending card with the site's address. Recorded on your device, shared through your phone's share sheet or downloaded, as MP4 where supported and WebM otherwise.
- Guess my ride: on a shared ride, guess how each stop felt and how big it was before a curtain lifts to reveal it. A point for each right guess, a playful verdict at the end, and a score to share with the ride's link. Statistics stay hidden while you play.
- Future stops: add something you are looking forward to with Add a future stop, or date any event after today. The track past a dashed TODAY line is softly veiled, future stops are drawn softer, the cart parks at today, Ride it ends there with a list of what is still to come, and statistics leave future stops out.
- Ride sounds: turn on Sound for a click-clack up each climb, a whoosh down each drop, a chime at highs, a low note at lows and a fanfare at the finish, sized by how big each moment is. Off by default, remembered on the device, and made in the browser with no audio files.

## [0.12.0] - 2026-11-10

### Added

- Anonymous page-view counting on the live site with Vercel Web Analytics (free plan, no cookies). Addresses are cut down to the page before they are sent, so shared rides never leave the browser. It counts nothing in previews, local runs or tests.

- Share my ride now sends a story-sized picture (1080 by 1920) made for phone stories: the ride's title, its years and stops, the ride wrapped onto rows so it stays large, and where to make your own. The share also carries a link to the ride for apps that accept one. Download image still saves the wide drawing.

## [0.11.2] - 2026-11-10

### Fixed

- Ride together: when one life's events end earlier, its rail now runs on to the shared finish, so both carts end side by side instead of one parking off-screen on phones.

## [0.11.1] - 2026-11-10

### Changed

- Tech-debt list updated with the follow-ups from v0.10.0 and v0.11.0.

### Fixed

- Ride together in Loop-the-loops style: both carts now ride round every loop instead of passing under it.
- Ride it and Ride together pause the cart just before each stop, so it no longer covers the stop's marker, flag or label.
- Fit to screen during Ride it keeps the drawing and the cart in view instead of scrolling the page away.
- A lens that loses its events, or its birth year, now switches back to the whole life for good, instead of quietly coming back later.
- Ride together has had its independent review, with new tests for undated, non-overlapping, out-of-order and mixed-precision rides.
- The "Name your ride" placeholder shows the lens title the drawing uses, or a plain example, instead of always "My 20s Roller Coaster".

## [0.11.0] - 2026-11-09

### Added

- Ride together: put your ride and a friend's on one timeline with the same years lined up, ride both carts through time side by side, see the years you both had big moments, and share the pair as a link. Start from a friend's ride link or paste one on your own ride. The same link rules apply: nothing is stored on a server and no descriptions are included.
- Share a link to your ride, with one-tap buttons for X, WhatsApp, Telegram and email, or your device's share sheet. The ride lives only in the link (after "#", never sent to a server) and leaves out descriptions, the life report and your story. Whoever opens it can take the ride, change its look for themselves, download it, and make their own.
- Social preview picture and metadata for links to the site.

## [0.10.0] - 2026-11-09

### Added

- Ride lenses: show one story as several rides, by part of life (My Career Coaster), decade (My 2010s) or age (My 20s, My Life Before 30, with an optional birth year kept on your device). An unnamed ride takes the lens's title.
- Ride it: the cart rides your life stop by stop while the view follows it, each stop shows its story, climbs are slow and drops fast, and the ride ends on your life report. Pause, Back, Next and Exit work by button or key. The metro map steps from station to station, and reduced motion jumps between stops.
- Your ride is saved in your browser on this device, so a reload or a later visit brings it back with its title, style, theme and rider. The story text you typed is never saved. Start over on the ride page deletes the saved ride after asking once.

## [0.9.0] - 2026-11-09

### Changed

- Stops on the ride are now spaced by the time between their dates. Moments in the same year sit close together and long gaps sit wider, capped at twice the normal gap; undated events keep the normal gap. Close moments whose labels sit on the same side keep enough room for both labels. Every ride style follows this.

## [0.8.0] - 2026-11-09

### Added

- The app can now be hosted publicly on Vercel's free plan. Real readings are protected by per-visitor limits (5 an hour, 12 a day), a hard daily budget across all visitors ($1 by default), and Vercel BotID, and refuse to spend when the limit store is missing. The README has a step-by-step deploy guide.

### Changed

- A reading's output is capped at 12,000 tokens instead of 16,000, which bounds the cost of any single reading.

## [0.7.2] - 2026-11-09

### Security

- Lint tooling now uses minimatch 11, which fixes a moderate denial-of-service advisory (GHSA-g3hv-75wg-m249). It is forced with an npm override until ESLint and typescript-eslint upgrade on their own; remove the override then.

## [0.7.1] - 2026-11-09

### Changed

- Updated ESLint to 10, React to 19.3.1, the Node.js type definitions to 26, and the CI checkout and setup-node actions to 7.

### Fixed

- Space planets keep clear of stop labels and metro line names.
- The chapter strip is dark with light names on night-sky themes, instead of a bright bar.
- Years covered names a single year once, such as "2015" rather than "2015 to 2015".
- Ocean voyage loops have a foam lip, so they read as breaking waves.

## [0.7.0] - 2026-11-09

### Changed

- On wide screens the pinned style and theme bar is one short row, about 120 pixels tall instead of about 204, so it covers much less of the drawing while you scroll.

### Fixed

- Life chapter bands stay apart after events are reordered; a chapter split by the new order is shown as separate bands.
- Rockets, boats and other vehicles parked at the end of the ride are no longer cut off at the edge of the drawing or the exported image.
- Claude now marks every feeling it guesses as a best guess, even for events where the feeling seems obvious, such as a divorce or an injury, and gives life chapters varied names instead of ending each with "Era".
- The balloon and parachute now float clear of every label and of each other, in every theme.
- Exported images carry the wordmark on a small badge in the top-right corner, so it reads cleanly on dark themes and never covers the chapter bands.
- Minimal Mode keeps less empty sky above the ride, and its supports no longer run through labels.
- Haunted night has arched, framed windows on the near towers only, so none seem to float in the sky.
- The Retro fairground Ferris wheel is a soft silhouette that stays behind the steel and labels.
- Ocean voyage shows open sea behind deep troughs, and its loops are drawn as curling waves.
- The Arcade level ground uses calm, staggered bricks.

### Tests

- The export tests now open every exported image and check its sky colour, its wordmark badge and that the ride is drawn, for every theme, style and rider, instead of only checking that the file is a PNG.

### Security

- Every page and API response now sends a content security policy and refuses to be framed, along with other standard security headers.
- AI output is capped in size, so a story cannot make the model return a huge or unreadable ride.
- Image export no longer rewrites a title that happens to look like a colour attribute.
- Added a security policy for private vulnerability reports, and Dependabot updates for npm packages and GitHub Actions.

## [0.6.0] - 2026-11-06

### Added

- Four new worlds that tell your story as a different journey: Space mission, Ocean voyage, Mountain trek and Arcade level, each with its own vehicle.
- Life Statistics, worked out from your events with no AI, including your biggest comeback and longest steady stretch.
- Life Chapters and a playful Life Report, written by Claude in the same reading of your story.
- Share my ride, which uses your device's share sheet or copies the image.
- Preview cards for every theme, and a strip of themes on the landing page.

### Changed

- Style and theme now sit in a compact bar right above the drawing, pinned while scrolling, so every choice changes what is on screen.

## [0.5.0] - 2026-11-06

### Added

- Four art modes that each draw the ride in a different way: Classic Ride, a soft pastel toy; Nightmare Mode, a glowing neon city; Minimal Mode, black line art; and Retro Mode, a vintage poster.

### Changed

- The haunted theme is now called Haunted night.

## [0.4.0] - 2026-11-06

### Added

- Retro fairground and Nightmare mode themes, each with its own scenery: tents and Ferris wheels, or haunted towers, a moon and bats.
- Choose your character: Smiley, Cat, Robot, Astronaut, Dino or Ghost rides your cart.
- Fit to screen, an optional toggle that shows a whole long ride without scrolling.

### Changed

- The metro map has more room between stops, so its lines fan out less steeply.
- Golden sunset has a lighter sky, so lines and steel stand out more.

### Fixed

- The balloon and parachute now sit in front of the steel instead of behind it.

## [0.3.0] - 2026-11-06

### Changed

- Track height now comes from each event's own points, so a big gap between two events makes a sharp drop or climb.

### Added

- Ride styles: choose the classic Coaster, Loop-the-loops with a full loop at every big moment, or a Metro map with one line for each part of your life.
- Custom ride titles, shown on the ride and in the downloaded image.
- Illustrated themes: Sunny day, Golden sunset and Starry night scenes with clouds, a city skyline, a steel lattice, flags and label pills, plus the original look as Simple.
- A cart that rides the track through every loop, with Ride again to replay it, and a balloon and parachute that mark the best and hardest moments.
- Sample lives: eight made-up stories that open as a finished ride in one click, for free, with nothing to write.

## [0.2.0] - 2026-11-06

### Changed

- Generate now goes straight from the story to the ride, and editing events is an optional step.
- Demo mode now shows a clear notice that the events are samples and the story was not read.
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
