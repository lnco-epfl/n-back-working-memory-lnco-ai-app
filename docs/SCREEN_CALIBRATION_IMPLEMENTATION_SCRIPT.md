# Screen Calibration Implementation Script

## Goal

Implement host-driven screen calibration so the app reads `localContext.screenCalibration` and applies:

- global text scaling via `fontSize`
- N-back number scaling via `scale`

This runbook captures the exact sequence used in this app and the migration pitfalls.

## 1. Update Graasp Dependencies to Forks

Update these dependencies in [package.json](package.json):

- [package.json](package.json) `@graasp/apps-query-client`
- [package.json](package.json) `@graasp/sdk`
- [package.json](package.json) `@graasp/ui`

Recommended format:

- `github:owner/repo#<commit-sha>`

Then run install and verify lockfile commit resolutions in [yarn.lock](yarn.lock).

## 2. Add Screen Calibration Parser Utility

Implement parser/validator in [src/utils/screenCalibration.ts](src/utils/screenCalibration.ts):

- accepted `fontSize` values: `small | normal | large | extra-large`
- accepted `scale`: number where `scale > 0.5 && scale < 3`
- parser reads from `localContext.screenCalibration`

Keep parser tolerant:

- ignore invalid values
- return `undefined` when neither field is valid

## 3. Read Calibration from Local Context

In [src/modules/main/ExperimentLoader.tsx](src/modules/main/ExperimentLoader.tsx):

- read `localContext` via `useLocalContext()`
- parse calibration via utility
- pass parsed calibration into experiment `run(...)` input

Also for account-era packages:

- use `accountId` for local actor identity

## 4. Apply Calibration in Experiment Runtime

In [src/modules/experiment/experiment.ts](src/modules/experiment/experiment.ts):

- accept `screenCalibration?: ScreenCalibration` in run input
- resolve:
  - applied font size = `screenCalibration.fontSize ?? settings.generalSettings.fontSize`
  - applied scale = `screenCalibration.scale ?? 1`
- apply to jsPsych root display:
  - `data-font-size`
  - CSS variable `--nback-calibration-scale`

## 5. Connect CSS to Calibration Variables

In [src/modules/experiment/styles/main.scss](src/modules/experiment/styles/main.scss):

- text styles read from `data-font-size` mapping
- number display multiplies by calibration scale var

Use formula pattern:

- `font-size: calc(var(--font-scale, 1) * var(--nback-calibration-scale, 1) * <base>)`

## 6. Account vs Member Compatibility (Minimal)

When query-client/sdk is account-era:

- context identity uses `accountId`
- app data ownership checks use `d.account.id`

Applied in:

- [src/modules/context/ExperimentContext.tsx](src/modules/context/ExperimentContext.tsx)
- [src/modules/main/ExperimentLoader.tsx](src/modules/main/ExperimentLoader.tsx)

## 7. Mock DB Schema Migration Pitfall (Dexie)

If mock schema changed primary key (for example `memberId` -> `accountId`), old IndexedDB data causes:

- `UpgradeError Not yet support for changing primary key`

Fix in app bootstrap by changing mock DB name in [src/main.tsx](src/main.tsx):

- use a new name like `graasp-app-mocks-v3`

This forces a fresh DB with new schema.

## 8. Query-Client Mock Handler Pitfall to Verify

Confirm query-client mock handlers use the same key as Dexie schema for `appContext`.

Mismatch example to avoid:

- schema key/index uses `accountId`
- handlers still query with `memberId`

Symptom:

- `KeyPath memberId on object store appContext is not indexed`

## 9. Validation Steps

Run in this order:

1. `yarn run tsc --noEmit`
2. `yarn build`
3. `yarn dev`
4. verify calibration at runtime:
   - `#jspsych-display-element` has expected `data-font-size`
   - `#jspsych-display-element` has expected `--nback-calibration-scale`

## 10. Reusable Checklist for Next Apps

1. Pin 3 Graasp deps to fork SHAs in [package.json](package.json)
2. Add parser in [src/utils/screenCalibration.ts](src/utils/screenCalibration.ts)
3. Pass calibration from [src/modules/main/ExperimentLoader.tsx](src/modules/main/ExperimentLoader.tsx)
4. Apply calibration in [src/modules/experiment/experiment.ts](src/modules/experiment/experiment.ts)
5. Wire CSS in [src/modules/experiment/styles/main.scss](src/modules/experiment/styles/main.scss)
6. Use account-based identity in context-sensitive files
7. Bump mock DB name in [src/main.tsx](src/main.tsx) if Dexie migration errors appear
8. Re-run type-check and build
