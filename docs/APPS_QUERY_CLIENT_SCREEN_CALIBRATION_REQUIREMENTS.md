# apps-query-client screenCalibration support

This document describes the package-level changes needed in `@graasp/apps-query-client` so Graasp apps can reliably consume screen calibration data through `useLocalContext()` without app-specific workarounds.

## Goal

Expose a nested optional `screenCalibration` object on `LocalContext`, populated from the `GET_CONTEXT_SUCCESS_<itemId>` payload, so apps can read:

```ts
const localContext = useLocalContext();
const calibration = localContext.screenCalibration;
```

without manually listening to `window.postMessage`.

## Expected contract

The host/player sends:

```json
{
  "type": "GET_CONTEXT_SUCCESS_<itemId>",
  "payload": {
    "screenCalibration": {
      "scale": 1.25,
      "fontSize": "normal"
    }
  }
}
```

The app receives via `useLocalContext()`:

```ts
type LocalContext = {
  apiHost: string;
  itemId: string;
  memberId: string;
  context: string;
  permission: PermissionLevel;
  screenCalibration?: {
    scale?: number;
    fontSize?: 'small' | 'normal' | 'large' | 'extra-large';
  };
};
```

Fields inside `screenCalibration` remain individually optional, but the object itself should be preserved if present in the payload. Note also that more fields might follow in the future.

## Required package changes

### 1. Extend `LocalContext`

Update the exported `LocalContext` type in the package to include:

```ts
type ScreenCalibration = {
  scale?: number;
  fontSize?: 'small' | 'normal' | 'large' | 'extra-large';
};

type LocalContext = {
  ...existingFields,
  screenCalibration?: ScreenCalibration;
};
```

This is the main blocker right now. The currently installed package type does not include `screenCalibration`, so app code cannot rely on it being part of the context contract.

### 2. Preserve `screenCalibration` when building local context from postMessage payloads

Wherever the package converts the `GET_CONTEXT_SUCCESS_*` message payload into `LocalContext`, make sure the nested `payload.screenCalibration` is copied into the returned context object.

Important: this should not be dropped during normalization or narrowed away by the current `LocalContext` typing.

Conceptually:

```ts
return {
  ...existingContextFields,
  screenCalibration: payload.screenCalibration,
};
```

### 3. Keep backward compatibility

Apps that do not use calibration must continue to work unchanged.

Required behavior:

- If `payload.screenCalibration` is absent, `localContext.screenCalibration` is `undefined`
- Existing apps using `useLocalContext()` without calibration continue to compile and run
- Existing host payloads without calibration remain valid

### 4. Support mocks/dev tooling

Any package mock/dev helpers that produce or store `LocalContext` should accept the new optional field as well.

That includes any helpers around:

- mock local context builders
- mock server context fixtures
- window typings for mock mode
- dev tools that edit/display local context

The point is that local testing should allow:

```ts
appContext: {
  itemId: '...',
  memberId: '...',
  apiHost: '...',
  context: 'player',
  permission: 'write',
  screenCalibration: {
    scale: 1.25,
    fontSize: 'large',
  },
}
```

## Validation expectations

At package level, the minimum requirement is transport and typing support.

Optional but preferred:

- preserve the object as-is if provided by the host
- do not silently strip valid nested fields
- if package validation exists, accept:
  - `scale` as a number
  - `fontSize` as one of `small | normal | large | extra-large`

App-level validation can still be performed by consuming apps, so package support does not need to be overly strict as long as it does not discard valid data.

## Suggested implementation areas

These names are based on the currently installed package structure and may differ slightly in source files:

- `src/types.ts`
  - extend `LocalContext`
- `src/hooks/postMessage.ts`
  - ensure `buildContext(...)` preserves `screenCalibration`
- `src/components/withContext.tsx`
  - no API change likely needed, but resulting context should now carry the new field
- mock server / fixtures
  - update builders and mock typing to allow optional `screenCalibration`
- package window typings
  - ensure mock/dev app context shape can include the optional field

## Acceptance criteria

The package change is complete when all of the following are true:

1. `useLocalContext()` returns a `LocalContext` type that includes optional `screenCalibration`
2. A host message with `payload.screenCalibration` results in `localContext.screenCalibration` being present in the app
3. Existing apps without calibration continue to work unchanged
4. Mock/dev context setup can inject `screenCalibration`
5. TypeScript consumers do not need local type augmentation or postMessage workarounds

## Why this matters for this app

This app scales:

- all experiment text from calibrated `fontSize`
- the N-back number display from calibrated `scale`

That logic is already implemented in the app, but it depends on the calibration being available through `useLocalContext()`. Right now, the host sends the calibration in `GET_CONTEXT_SUCCESS_<itemId>`, but the package does not expose it on `LocalContext`, which forces app-specific workarounds.

## Short prompt version

If you want to give this to another engineer or AI as a short task description:

"Update `@graasp/apps-query-client` so `LocalContext` includes an optional nested `screenCalibration` object with `{ scale?: number; fontSize?: 'small' | 'normal' | 'large' | 'extra-large' }`, and ensure the `GET_CONTEXT_SUCCESS_<itemId>` postMessage payload preserves `payload.screenCalibration` into the context returned by `useLocalContext()`. Also update mock/dev helpers so this field can be injected locally. Keep the change backward compatible for apps that do not use calibration."
