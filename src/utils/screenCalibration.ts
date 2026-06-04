import type { LocalContext, ScreenCalibration } from '@lnco-ai/sdk';

export const FONT_SIZE_OPTIONS = [
  'small',
  'normal',
  'large',
  'extra-large',
] as const;

export type FontSizeOption = (typeof FONT_SIZE_OPTIONS)[number];

export type AppScreenCalibration = ScreenCalibration & {
  participantId?: string;
  participantCode?: string;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export const isValidCalibrationScale = (value: unknown): value is number =>
  typeof value === 'number' && value > MIN_SCALE && value < MAX_SCALE;

export const isValidCalibrationFontSize = (
  value: unknown,
): value is FontSizeOption =>
  typeof value === 'string' &&
  FONT_SIZE_OPTIONS.includes(value as FontSizeOption);

const isValidParticipantString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

export const normalizeScreenCalibration = (
  source: unknown,
): AppScreenCalibration | undefined => {
  if (!source || typeof source !== 'object') {
    return undefined;
  }

  const calibration = source as {
    scale?: unknown;
    fontSize?: unknown;
    participantId?: unknown;
    participantCode?: unknown;
  };

  const scale = isValidCalibrationScale(calibration.scale)
    ? calibration.scale
    : undefined;
  const fontSize = isValidCalibrationFontSize(calibration.fontSize)
    ? calibration.fontSize
    : undefined;
  const participantId = isValidParticipantString(calibration.participantId)
    ? calibration.participantId
    : undefined;
  const participantCode = isValidParticipantString(calibration.participantCode)
    ? calibration.participantCode
    : undefined;

  if (
    scale === undefined &&
    fontSize === undefined &&
    participantId === undefined &&
    participantCode === undefined
  ) {
    return undefined;
  }

  return { scale, fontSize, participantId, participantCode };
};

export const parseScreenCalibrationFromLocalContext = (
  localContext: Pick<LocalContext, 'screenCalibration'> | undefined,
): AppScreenCalibration | undefined => {
  if (!localContext) {
    return undefined;
  }

  const maybeCalibration = localContext.screenCalibration;

  return normalizeScreenCalibration(maybeCalibration);
};
