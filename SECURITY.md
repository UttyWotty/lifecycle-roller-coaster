# Security Policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue. Use **Report a vulnerability** on the repository's Security tab, which opens a private advisory that only the maintainer can see.

Include what you found, how to reproduce it and what it could affect. Please do not include real personal stories in a report; a made-up one is enough to show the problem.

You should get a first reply within a week. Fixes are released as patch versions and noted in `CHANGELOG.md`.

## Supported versions

Only the latest release receives security fixes.

## Scope notes

- Real readings spend the host's Anthropic API key. The public site limits them per visitor and with a daily budget, and blocks bots. A way to get around those limits, or to make a reading spend more than the budget allows, counts as a vulnerability. Self-hosted copies should follow the README's Deploying guide, including a spend limit on the key.
- Stories are sent to the AI provider only when the user presses Generate, and the server never logs story text. A way to make story text reach logs, error messages or exported images counts as a vulnerability.
