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

type MessagePayload = {
  payload?: {
    screenCalibration?: unknown;
  };
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const CALIBRATION_LOG_PREFIX = '[screenCalibration]';

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
    // eslint-disable-next-line no-console
    console.info(
      `${CALIBRATION_LOG_PREFIX} Missing or non-object calibration payload`,
      source,
    );
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

  if (calibration.scale !== undefined && scale === undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      `${CALIBRATION_LOG_PREFIX} Rejected scale (expected > ${MIN_SCALE} and < ${MAX_SCALE})`,
      calibration.scale,
    );
  }

  if (calibration.fontSize !== undefined && fontSize === undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      `${CALIBRATION_LOG_PREFIX} Rejected fontSize (expected one of ${FONT_SIZE_OPTIONS.join(', ')})`,
      calibration.fontSize,
    );
  }

  if (scale === undefined && fontSize === undefined) {
    // eslint-disable-next-line no-console
    console.info(
      `${CALIBRATION_LOG_PREFIX} No valid calibration fields found`,
      calibration,
    );
    return undefined;
  }

  // eslint-disable-next-line no-console
  console.info(`${CALIBRATION_LOG_PREFIX} Parsed calibration`, {
    scale,
    fontSize,
  });

  return { scale, fontSize };
};

export const parseScreenCalibrationFromLocalContext = (
  localContext: unknown,
): ScreenCalibration | undefined => {
  if (!localContext || typeof localContext !== 'object') {
    // eslint-disable-next-line no-console
    console.info(
      `${CALIBRATION_LOG_PREFIX} Local context unavailable for calibration parsing`,
    );
    return undefined;
  }

  const maybeCalibration = (localContext as { screenCalibration?: unknown })
    .screenCalibration;

  // eslint-disable-next-line no-console
  console.info(
    `${CALIBRATION_LOG_PREFIX} Raw localContext.screenCalibration`,
    maybeCalibration,
  );

  return normalizeScreenCalibration(maybeCalibration);
};

export const parseScreenCalibrationFromMessagePayload = (
  payload: MessagePayload | undefined,
): ScreenCalibration | undefined =>
  normalizeScreenCalibration(payload?.payload?.screenCalibration);

export const isGetContextSuccessType = (
  messageType: unknown,
  itemId: string,
): boolean => messageType === `GET_CONTEXT_SUCCESS_${itemId}`;

export const buildPostCalibrationScaleMessage = (
  itemId: string,
  calibration: ScreenCalibration,
): string =>
  JSON.stringify({
    type: `POST_CALIBRATION_SCALE_${itemId}`,
    payload: {
      screenCalibration: calibration,
    },
  });

export const buildGetContextSuccessMessage = (
  itemId: string,
  calibration: ScreenCalibration,
): string =>
  JSON.stringify({
    type: `GET_CONTEXT_SUCCESS_${itemId}`,
    payload: {
      screenCalibration: calibration,
    },
  });
