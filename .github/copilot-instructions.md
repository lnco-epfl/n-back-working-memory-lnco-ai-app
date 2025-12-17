# N-Back Working Memory - AI Agent Instructions

## Project Overview

This is a **Graasp App** implementing an **N-back working memory task** using jsPsych. Built with React 18 + TypeScript + Vite, it integrates with the Graasp platform to provide configurable cognitive neuroscience experiments with practice, main task, and optional breaks.

## Architecture

### Three-Context Model

The app operates in **three distinct contexts** determined by `@graasp/apps-query-client`:

- **Builder**: Admin configuration UI with settings panels (`BuilderView` → `SettingsView`)
- **Player**: Experiment execution for participants (`PlayerView` → `ExperimentLoader`)
- **Analytics**: Results dashboard for researchers (`AnalyticsView`)

Context is detected via `useLocalContext().context` and routing happens in `src/modules/main/App.tsx`.

### Experiment State Management

Experiments use a **simple state machine pattern** (`ExperimentState` class in `src/modules/experiment/jspsych/experiment-state-class.ts`):

- Manages N-back sequences (0-9 digits) with ~33% target match rate
- Tracks current trial index, practice mode, and break points
- Records practice accuracy and main task correctness per trial
- Handles photo-diode white/black toggle for EEG/MEG triggers

Settings stored as Graasp `AppSettings` via `SettingsContext`, results as `AppData` via `ExperimentContext`.

### jsPsych Integration

N-back experiment flow in `src/modules/experiment/parts/`:

- `buildIntroduction()` - 4-screen task instructions (welcome, overview, rules, practice intro)
- `buildPractice()` - Practice trials with feedback and repeat loop
- `buildMainTask()` - Main experiment with break support and completion screen
- Custom plugins in `src/modules/experiment/trials/`:
  - `NBackStimulusPlugin` - Displays digit, captures response, toggles photo-diode
  - `PracticeFeedbackTrial` - Accuracy summary after practice
  - `BreakTrial` - Break screen with countdown timer
- Timeline assembled in `src/modules/experiment/experiment.ts`'s `run()` function

## N-Back Specific Features

### Sequence Generation

- **Random**: `generateNBackSequence(length, nLevel, targetPercentage)` - Creates valid sequences with configurable target match rate (~33%)
- **Custom**: `parseCustomSequence(string)` - Parses comma-separated digits (0-9)
- **Constraints**: No consecutive matches, no n+1 ambiguity

### Settings Structure

```typescript
// Core N-back configuration
nBackSettings: {
  nLevel: 1 | 2 | 3 | 4,           // Which position back to match
  numberOfTrials: number,           // Main task trials (default: 50)
  numberOfPracticeTrials: number,   // Practice trials (default: 15)
  displayDuration: number,          // Stimulus display (ms, default: 500)
  interStimulusInterval: number,    // Pause between stimuli (ms, default: 2000)
  responseKey: 'space' | 'mouse' | 'both',  // How to respond
  customSequence: string,           // Optional: "3,5,2,5,7" format
}

// Break configuration
breakSettings: {
  enableBreaks: boolean,
  breakFrequency: number,           // Show break every N trials
  breakDuration: number,            // Minimum break duration (seconds)
}

// General UI settings
generalSettings: {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large',
  skipInstructions: boolean,
  skipPractice: boolean,
}

// Photo-diode for neuroscience recording
photoDiodeSettings: {
  usePhotoDiode: boolean,
  position: 'top-left' | 'top-right' | 'customize' | 'off',
  testPhotoDiode: boolean,          // Show white rectangle for testing
}
```

## Key Development Patterns

### Data Persistence

Use Graasp hooks from `src/config/queryClient.tsx`:

```tsx
// Settings (AppSettings)
const { data: settings } = hooks.useAppSettings();
const { mutate: patchSetting } = mutations.usePatchAppSetting();

// Results (AppData - N-back trial data)
const { data: results } = hooks.useAppData<ExperimentResult>();
const { mutate: postResult } = mutations.usePostAppData();
```

### Trial Data Structure

Each N-back trial records:

```typescript
{
  stimulus: 5,                    // The displayed digit (0-9)
  response: true,                 // Whether participant responded
  correct_response: true,         // Whether they should have responded
  correct: true,                  // response === correct_response
  rt: 450,                        // Response time in milliseconds
  trial_index: 23,               // Position in sequence
  practice: false,               // Is this practice or main task?
}
```

### Custom Trial Creation

Follow the jsPsych plugin pattern:

1. Create class implementing `JsPsychPlugin<Info>`
2. Define `info` object with parameters
3. Implement `trial()` method with experiment logic
4. Export as default or factory function
5. Use in timeline builders via `buildIntroduction()`, `buildPractice()`, `buildMainTask()`

### i18n Support

Strings managed in `src/langs/{en,fr}.json`:

```typescript
import i18n from '../jspsych/i18n';

const t = i18n.t.bind(i18n);

// Use in HTML stimulus
stimulus: `<h1>${t('NBACK.WELCOME_TITLE')}</h1>`;
```

### Settings Modifications

When adding new settings:

1. Update type in `src/modules/context/SettingsContext.tsx` (e.g., `TaskSettingsType`)
2. Add default in `getDefaultSettings()` within same file
3. Create UI in `src/modules/settings/[Category]SettingsView.tsx`
4. Access via `useSettings()` hook in experiment code

## Commands & Workflows

### Development

```bash
yarn dev              # Start dev server (uses .env.development)
yarn start:test       # Start with mock API for testing
yarn check            # Run lint + prettier + type-check
```

### Testing

```bash
yarn test             # Run Cypress E2E tests with coverage
yarn cypress:open     # Open Cypress UI
```

Requires `.env.test` with `VITE_ENABLE_MOCK_API=true`. Tests validate all three contexts (builder/player/analytics).

### Mock API

When `VITE_ENABLE_MOCK_API=true`, uses:

- **ServiceWorker** (MSW) for standalone dev
- **MirageJS** for Cypress tests
  Mock data defined in `src/mocks/db.ts` with `mockMembers` and `defaultMockContext`.

## Critical Conventions

### Alias Imports

Always use `@/` prefix for src imports (configured in `vite.config.ts`):

```tsx
import { hooks } from '@/config/queryClient';
import { ExperimentState } from '@/modules/experiment/jspsych/experiment-state-class';
```

### Environment Variables

Access via `src/config/env.ts`, never `import.meta.env` directly:

```typescript
import { API_HOST, GRAASP_APP_KEY, MOCK_API } from '@/config/env';
```

This handles Cypress environment injection (`window.Cypress ? Cypress.env() : import.meta.env`).

### i18n Strings

Use `react-i18next` with namespaces in `src/langs/*.json`:

```tsx
const { t } = useTranslation();
return <p>{t('EXPERIMENT.INSTRUCTIONS')}</p>;
```

### Photo-Diode Support

For hardware-triggered experiments, photo-diode element is dynamically created in `experiment.ts` based on `photoDiodeSettings.usePhotoDiode` (positions: `top-left`, `top-right`, `customize`, `off`).

## Integration Points

### Graasp Platform

- Authentication via `@graasp/apps-query-client` with `GRAASP_APP_KEY`
- Member permissions checked with `PermissionLevel` enum
- API proxied through Vite config (`/app-items` → `http://localhost:3000`)

### Serial Port Triggers

Optional hardware triggers via `src/modules/experiment/triggers/serialport.ts`:

- Web Serial API for sending numeric triggers to EEG/MEG systems
- Connection flow in `deviceConnectPages()` function
- Trigger sending wrapped in `DeviceType` interface

## Common Pitfalls

1. **Context Confusion**: Always check current context before rendering admin-only UI
2. **State Mutations**: `ExperimentState` methods return new state; don't mutate directly
3. **Trial Timing**: jsPsych timeline runs asynchronously; use `on_finish` callbacks for data updates
4. **Mock API Toggle**: Disable mocks in production builds (controlled by VITE env vars)
5. **Type Safety**: Trial parameters must match jsPsych plugin expectations; use defined types

## File Structure Highlights

- `src/modules/experiment/parts/`: Experiment phase builders (modular timeline construction)
- `src/modules/settings/`: Admin configuration panels per settings category
- `src/modules/context/`: React contexts for settings and results persistence
- `src/config/`: App configuration, query client setup, env variables
- `cypress/e2e/`: E2E tests per context (builder/player/analytics)
