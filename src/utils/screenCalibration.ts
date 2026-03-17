export const FONT_SIZE_OPTIONS = [
  'small',
  'normal',
  'large',
  'extra-large',
] as const;

export type FontSizeOption = (typeof FONT_SIZE_OPTIONS)[number];

export type ScreenCalibration = {
  scale?: number;
  fontSize?: FontSizeOption;
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

export const normalizeScreenCalibration = (
  source: unknown,
): ScreenCalibration | undefined => {
  if (!source || typeof source !== 'object') {
    return undefined;
  }

  const calibration = source as {
    scale?: unknown;
    fontSize?: unknown;
  };

  const scale = isValidCalibrationScale(calibration.scale)
    ? calibration.scale
    : undefined;
  const fontSize = isValidCalibrationFontSize(calibration.fontSize)
    ? calibration.fontSize
    : undefined;

  if (scale === undefined && fontSize === undefined) {
    return undefined;
  }

  return { scale, fontSize };
};

export const parseScreenCalibrationFromLocalContext = (
  localContext: unknown,
): ScreenCalibration | undefined => {
  if (!localContext || typeof localContext !== 'object') {
    return undefined;
  }

  const maybeCalibration = (localContext as { screenCalibration?: unknown })
    .screenCalibration;

  return normalizeScreenCalibration(maybeCalibration);
};
