# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

This is a **Graasp App** implementing an N-back working memory cognitive task. It runs inside the Graasp Player (participant-facing) and Builder (experimenter-facing) iframes. The experiment is driven by [jsPsych](https://www.jspsych.org/) and integrates with the Graasp platform via `@graasp/apps-query-client` (an LNCO fork).

## Commands

```bash
# Install dependencies
yarn

# Run in development (opens browser, mock API available)
yarn dev

# Build for production
yarn build

# Type check
yarn type-check

# Lint
yarn lint

# Format check / auto-fix
yarn prettier:check
yarn prettier:write

# Run all checks (lint + prettier + types)
yarn check

# Run Cypress tests (requires .env.test)
yarn test

# Open Cypress UI interactively
yarn cypress:open
```

## Environment Setup

Create `.env.development` for local dev:
```
VITE_PORT=3005
VITE_API_HOST=http://localhost:3000
VITE_ENABLE_MOCK_API=true
VITE_GRAASP_APP_KEY=45678-677889
VITE_VERSION=latest
```

Create `.env.test` for Cypress tests:
```
VITE_PORT=3333
VITE_API_HOST=http://localhost:3636
VITE_ENABLE_MOCK_API=true
VITE_GRAASP_APP_KEY=45678-677889
VITE_VERSION=latest
BROWSER=none
```

## Architecture

### View Routing (`src/modules/main/App.tsx`)

The app renders one of three views based on the Graasp context (injected via `useLocalContext()`):
- **Builder** — experimenter configures settings
- **Player** — participant runs the experiment
- **Analytics** — (stub) data visualization

Both `SettingsProvider` and `ExperimentResultsProvider` wrap all views.

### Settings System (`src/modules/context/SettingsContext.tsx`)

Settings are persisted to the Graasp API as app settings. Five setting groups exist:
- `generalSettings` — font size, skip instructions/practice
- `nBackSettings` — n-level, trial count, timing, response key, custom sequences
- `breakSettings` — break frequency and duration
- `photoDiodeSettings` — photo-diode trigger position
- `nextStepSettings` — end-of-experiment link to next app

`useSettings()` provides access anywhere in the tree. New settings fields are merged with defaults on load, preserving backward compatibility with older saved data.

### Experiment Flow (`src/modules/experiment/experiment.ts`)

The `run()` function builds a jsPsych timeline in order:
1. Asset preload (images, audio, video)
2. Introduction (`buildIntroduction`)
3. Practice block — optional, skippable via settings (`buildPractice`)
4. Main task (`buildMainTask`)
5. End page with optional link to next experiment

`ExperimentState` (a class in `src/modules/experiment/jspsych/experiment-state-class.ts`) holds all runtime state and exposes typed getters for each settings group.

### Data / Results

Results are saved via `updateData(jsPsych.data.get(), settings)` — called on `beforeunload` and at the end of each block. The `ExperimentResultsProvider` context exposes result data to the Analytics and Builder views.

### Mock API

When `VITE_ENABLE_MOCK_API=true`, a MirageJS mock server is configured in `src/mocks/db.ts`. This lets the app run standalone without a live Graasp backend.

## Key Conventions

- Path alias `@` resolves to `src/` — use `@/config/...` etc.
- Dependencies `@graasp/apps-query-client`, `@graasp/sdk`, and `@graasp/ui` are installed from LNCO GitHub forks (`github:lnco-epfl/...`), not from npm.
- Commit messages follow Conventional Commits (enforced by commitlint + husky).
- Cypress tests use `data-cy` selectors defined in `src/config/selectors.ts`.
- Build output goes to `build/` (not `dist/`).