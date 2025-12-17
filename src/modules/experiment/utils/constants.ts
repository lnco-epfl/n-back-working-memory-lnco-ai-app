// eslint-disable-next-line import/no-cycle
import i18n from '../jspsych/i18n';

// Stub types for EBDM code compatibility
export type DelayType = 'short' | 'long';
export type BoundsType = 'easy' | 'medium' | 'hard';
export type RewardType = 'low' | 'medium' | 'high';

export const LOADING_BAR_SPEED_NO = 50;
export const LOADING_BAR_SPEED_YES = 5;

export const AUTO_DECREASE_AMOUNT = 2;
export const AUTO_DECREASE_RATE = 100;
export const AUTO_INCREASE_AMOUNT = 10;
export const MAXIMUM_THERMOMETER_HEIGHT = 100;
export const EXPECTED_MAXIMUM_PERCENTAGE = 100;
export const NUM_TAPS_WITHOUT_DELAY = 5;

export const DELAY_DEFINITIONS: { [key in DelayType]: [number, number] } = {
  short: [0, 0],
  long: [400, 600],
};

export const BOUNDS_DEFINITIONS: { [key in BoundsType]: [number, number] } = {
  easy: [5, 23],
  medium: [41, 59],
  hard: [77, 95],
};

export const REWARD_DEFINITIONS: {
  [key in RewardType]: number;
} = {
  low: 1,
  medium: 10,
  high: 40,
};

export const DEFAULT_REWARD_YITTER = 0.5;
export const DEFAULT_BOUNDS_VARIATION = 3;
export const TOTAL_REWARD_MONEY = 6;
export const CURRENCY = 'GBP';

export const NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS = 4; // 4 default
export const NUM_CALIBRATION_WITH_FEEDBACK_TRIALS = 3; // 3 default
export const NUM_CALIBRATION_TRIALS =
  NUM_CALIBRATION_WITHOUT_FEEDBACK_TRIALS +
  NUM_CALIBRATION_WITH_FEEDBACK_TRIALS;

export const NUM_FINAL_CALIBRATION_TRIALS_PART_1 = 3; // 3 default
export const NUM_FINAL_CALIBRATION_TRIALS_PART_2 = 3; // 3 default

export const MINIMUM_CALIBRATION_MEDIAN = 10;
export const EXPECTED_MAXIMUM_PERCENTAGE_FOR_CALIBRATION = 50;

export const PERCENTAGE_VALIDATION_TRIALS_SUCCESSFUL = 0.75;
export const NUM_VALIDATION_TRIALS = 4; // 4 default
export const NUM_EXTRA_VALIDATION_TRIALS = 3; // 3 default

export const NUM_DEMO_TRIALS = 3; // 3 default
export const MINIMUM_DEMO_TAPS = 10;
export const FAILED_MINIMUM_DEMO_TAPS_DURATION = 3000;

export const NUM_TRIALS = 63; // 63 default
export const TRIAL_DURATION = 7000; // 7000 default

export const GO_DURATION = 500;
export const SUCCESS_SCREEN_DURATION = 500;
export const COUNTDOWN_TIME = 3;
export const PREMATURE_KEY_RELEASE_ERROR_TIME = 1000;
export const KEY_TAPPED_EARLY_ERROR_TIME = 3000;
export const KEYBOARD_LAYOUT = '';

export const PROGRESS_BAR = {
  PROGRESS_BAR_INTRODUCTION: i18n.t('PROGRESS_BAR.PROGRESS_BAR_INTRODUCTION'),
  PROGRESS_BAR_PRACTICE: i18n.t('PROGRESS_BAR.PROGRESS_BAR_PRACTICE'),
  PROGRESS_BAR_CALIBRATION: i18n.t('PROGRESS_BAR.PROGRESS_BAR_CALIBRATION'),
  PROGRESS_BAR_VALIDATION: i18n.t('PROGRESS_BAR.PROGRESS_BAR_VALIDATION'),
  PROGRESS_BAR_TRIAL_BLOCKS: i18n.t('PROGRESS_BAR.PROGRESS_BAR_TRIAL_BLOCKS'),
  PROGRESS_BAR_FINAL_CALIBRATION: i18n.t(
    'PROGRESS_BAR.PROGRESS_BAR_FINAL_CALIBRATION',
  ),
};

export const SIT_COMFORTABLY_MESSAGE = i18n.t('SIT_COMFORTABLY_MESSAGE');
export const INTRODUCTION_HEADER = i18n.t('INTRODUCTION_HEADER');

export const EXPERIMENT_HAS_ENDED_MESSAGE = i18n.t(
  'EXPERIMENT_HAS_ENDED_MESSAGE',
);
export const CLICK_BUTTON_TO_PROCEED_MESSAGE = i18n.t(
  'CLICK_BUTTON_TO_PROCEED_MESSAGE',
);
export const ENABLE_BUTTON_AFTER_TIME = 15000; // default is 15000 ms
export const HAND_TUTORIAL_MESSAGE = i18n.t('HAND_TUTORIAL_MESSAGE');
export const TUTORIAL_HEADER = i18n.t('TUTORIAL_HEADER');
export const CONTINUE_MESSAGE_TITLE = i18n.t('CONTINUE_MESSAGE_TITLE');
export const TRIAL_BLOCKS_TITLE = i18n.t('TRIAL_BLOCKS_TITLE');
export const REWARD_PAGE_TITLE = i18n.t('REWARD_PAGE_TITLE');
export const REMEMBER_PAGE_TITLE = i18n.t('REMEMBER_PAGE_TITLE');
