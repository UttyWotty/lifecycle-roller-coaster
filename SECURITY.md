# Security Policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue. Use **Report a vulnerability** on the repository's Security tab, which opens a private advisory that only the maintainer can see.

Include what you found, how to reproduce it and what it could affect. Please do not include real personal stories in a report; a made-up one is enough to show the problem.

You should get a first reply within a week. Fixes are released as patch versions and noted in `CHANGELOG.md`.

## Supported versions

Only the latest release receives security fixes.

## Scope notes

- The app is not publicly hosted. Anyone running it supplies their own Anthropic API key, and `/api/extract` has no rate limiting yet, so do not expose a self-hosted copy to the internet without adding rate limiting and setting a spend limit on the key.
- Stories are sent to the AI provider only when the user presses Generate, and the server never logs story text. A way to make story text reach logs, error messages or exported images counts as a vulnerability.
