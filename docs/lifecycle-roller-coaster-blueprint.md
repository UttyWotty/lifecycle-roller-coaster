# Lifecycle Roller Coaster

## Product Concept & MVP Blueprint

**Version:** 0.1\
**Project type:** Independent, open-source, AI-powered web application\
**Primary goal:** Turn people's life experiences into a playful, visual
roller-coaster timeline.

------------------------------------------------------------------------

## 1. Project Overview

**Lifecycle Roller Coaster** is a playful AI-powered application that
transforms people's life experiences into a visual roller coaster.

Users describe important events from their lives, including education,
career, relationships, financial situations, personal achievements,
failures, and major transitions. AI interprets these experiences and
converts them into a chronological visual journey.

**Core idea:**\
\> Your life is a journey. Let's see what the ride looks like.

### Product principles

-   Fun before functionality.
-   No complicated onboarding.
-   Natural-language input.
-   AI-assisted interpretation.
-   Visually engaging output.
-   Privacy-first.
-   Open-source friendly.

## 2. User Journey

1.  **Landing page:** The user sees a simple introduction and an example
    roller coaster.
2.  **Tell your story:** The user writes life experiences in free-form
    text.
3.  **AI processing:** AI extracts events, dates, categories, and
    emotional impact.
4.  **Review events:** The user can edit, delete, reorder, or correct
    extracted events.
5.  **Generate the roller coaster:** The application creates a
    personalized visual timeline.
6.  **Share your ride:** The user downloads the graphic as a PNG or
    shares it.

## 3. Input System

The application should accept completely unstructured text. No
predefined questionnaire should be required.

Example:

``` text
I started university in 2015.
I was really excited about it.
In 2017 I had my first serious relationship.
I graduated in 2019 and started working.
In 2020 I lost my job because of the pandemic.
In 2021 I moved to another country.
In 2022 I got married.
In 2023 I experienced a serious financial crisis.
In 2024 I started a new career.
In 2026 I started building my own company.
```

Users may optionally add events individually through the interface.

## 4. AI Processing Layer

AI converts the narrative into structured event data.

### Proposed event schema

``` json
{
  "events": [
    {
      "id": "event_001",
      "date": "2015",
      "title": "Started University",
      "description": "Started a new academic journey.",
      "category": "education",
      "sentiment": "positive",
      "impact": 8,
      "confidence": 0.95
    }
  ]
}
```

### Initial categories

  Category        Examples
  --------------- ---------------------------------
  Education       University, graduation
  Career          New job, promotion, resignation
  Relationships   Marriage, breakup
  Finance         Financial crisis, investment
  Business        Startup, entrepreneurship
  Personal        Moving, achievements
  Health          Personal health milestones
  Other           Uncategorized events

### AI interpretation rules

-   Never invent events.
-   Preserve the user's original meaning.
-   Ask for clarification when dates are ambiguous.
-   Distinguish between positive, negative, and neutral experiences.
-   Allow users to override AI sentiment and impact.
-   Do not treat every negative event as a failure.
-   Treat inferred dates and uncertain interpretations as uncertain, not
    as facts.

## 5. Roller-Coaster Visualization

The visualization is the main product feature.

### Graph dimensions

-   **X-axis:** Time.
-   **Y-axis:** User-perceived emotional impact or experience.
-   **Peaks:** Positive experiences.
-   **Valleys:** Negative experiences.
-   **Flat sections:** Stable periods.
-   **Milestones:** Important life events.

### Visual elements

  Element           Representation
  ----------------- -----------------------
  Positive event    Track rises
  Negative event    Track descends
  Neutral event     Track continues
  Major milestone   Large marker
  Category          Color-coded marker
  Unknown date      Approximate placement

The graph is a creative representation, not a psychological assessment
or objective measurement of someone's life.

Users should be able to change event intensity and immediately see the
graph update.

A useful design distinction: sentiment and impact should be separate
values. A highly impactful event can be positive or negative; a neutral
event can still be significant. The user should remain in control of the
final interpretation.

## 6. MVP Screens

### 01 --- Landing Page

-   Project introduction.
-   "Start your ride" call to action.
-   Example visualization.

### 02 --- Story Editor

-   Large text input.
-   Example prompts.
-   Generate button.

### 03 --- Event Review

-   Editable event cards.
-   Date and category.
-   Sentiment and impact controls.
-   Add, delete, and reorder events.

### 04 --- Roller-Coaster Result

-   Full-size visualization.
-   Interactive event markers.
-   Share and export controls.

## 7. Technical Architecture

Keep the initial implementation deliberately lightweight.

``` text
Frontend — Next.js
  Story input
  Event editor
  Visualization
  Export
       |
       v
Backend — API
  Input validation
  Event processing
  Graph data
       |
       +------ LLM
       |       Narrative extraction and interpretation
       |
       +------ Visualization
               SVG / React-based track generation
```

### Suggested stack

  Component       Technology
  --------------- ---------------------------------
  Frontend        Next.js + TypeScript
  Styling         Tailwind CSS
  Visualization   SVG, optionally D3.js
  Backend         FastAPI or Next.js API
  AI              Provider-agnostic LLM adapter
  Storage         Local browser storage initially
  Export          SVG to PNG

A database is not necessary for the first version. The AI layer should
return structured data, while the frontend visualization should consume
that data independently. This keeps the graph engine usable with
different AI providers---or manually entered events.

## 8. Suggested Repository Structure

``` text
lifecycle-roller-coaster/
│
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── Landing/
│   │   ├── StoryEditor/
│   │   ├── EventTimeline/
│   │   ├── RollerCoaster/
│   │   └── Export/
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── api/
│   ├── services/
│   │   ├── ai_parser.py
│   │   └── event_processor.py
│   ├── schemas/
│   └── main.py
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── AI_SCHEMA.md
│
├── examples/
│
├── LICENSE
└── README.md
```

This is a suggested structure, not a requirement. For a very small first
release, a single Next.js application with a small API layer may be
simpler.

## 9. Development Roadmap

  Phase   Scope                             Priority
  ------- --------------------------------- -----------
  1       Landing page and story input      Essential
  2       AI event extraction               Essential
  3       Event editing                     Essential
  4       Roller-coaster SVG generator      Essential
  5       PNG export                        Essential
  6       Multiple visual themes            Later
  7       Life statistics                   Later
  8       Shareable public links            Later
  9       User accounts and cloud storage   Optional

### MVP definition

The first functional release should allow a user to:

1.  Open the application without creating an account.
2.  Enter a life story as free text.
3.  Generate structured events using AI.
4.  Review and edit those events.
5.  Generate a roller-coaster visualization.
6.  Export the result as an image.

Avoid accounts, payments, social networking, and complex analytics in
v0.1.

## 10. Open-Source Direction

-   **Project name:** Lifecycle Roller Coaster
-   **Repository:** `lifecycle-roller-coaster`
-   **License suggestion:** MIT
-   **Initial release:** v0.1.0
-   **Deployment options:** Vercel or Cloudflare
-   **AI:** Configurable provider, with local-model support as a
    possible future addition.

### Privacy considerations

Users may write about relationships, financial difficulties, health, and
other personal experiences.

-   Do not store raw narratives by default.
-   Explain what is sent to an external AI provider.
-   Avoid logging personal story content.
-   Keep generated data in the browser for the initial version where
    practical.
-   Make sharing opt-in; never publish a user's ride automatically.
-   Consider a local-model option in a later release.

## 11. Future Ideas --- Not MVP Requirements

### Life statistics

-   Number of major life changes.
-   Longest stable period.
-   Most significant turning point.
-   User-selected highlights.

### Share Your Ride

Users can export a polished image for social media. Possible formats
include:

-   My 20s Roller Coaster
-   My Career Roller Coaster
-   My Entrepreneur Journey
-   My Relationship Roller Coaster
-   My Life Before and After 30

### Different ride styles

  Theme            Visual direction
  ---------------- ----------------------------------
  Classic Ride     Fun, colorful, playful
  Nightmare Mode   Dramatic, chaotic, exaggerated
  Minimal Mode     Clean, elegant, shareable
  Retro Mode       Vintage amusement-park aesthetic

These are optional visual themes, not different interpretations of the
user's actual life.

## 12. Product Decisions to Revisit

These questions can be resolved during implementation rather than
blocking the first prototype:

1.  Should the vertical axis represent sentiment, perceived life
    quality, or a user-defined score?
2.  Should users set impact manually, accept AI suggestions, or use
    both?
3.  Should approximate dates be shown as ranges or placed at a
    best-estimate point?
4.  Should the first release use a hosted LLM, a local model, or support
    both?
5.  Should the exported image include event descriptions, or only labels
    and milestones?

## 13. Final Product Recommendation

Keep the first release focused on one delightful experience: **write a
story and watch it turn into a roller coaster.**

Do not turn the project into a serious intelligence or life-coaching
platform. Its appeal is the playful transformation of personal memories
into a visual artifact.

One important technical boundary: keep the AI event schema and the
roller-coaster rendering engine independent. That way, changing the AI
provider will not require rewriting the visualization engine.
