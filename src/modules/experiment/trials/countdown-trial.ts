import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Timeline } from '../utils/types';

const t = i18n.t.bind(i18n);

export const buildCountdown = (state: ExperimentState): Timeline => {
  if (!state.getGeneralSettings().showCountdown) return [];

  return [
    {
      type: htmlKeyboardResponse,
      stimulus: `<div class="nback-countdown">${t('COUNTDOWN.GET_READY')}</div>`,
      choices: 'NO_KEYS' as const,
      trial_duration: 2000,
    },
    {
      type: htmlKeyboardResponse,
      stimulus: `<div class="nback-countdown nback-countdown-go">${t('COUNTDOWN.GO')}</div>`,
      choices: 'NO_KEYS' as const,
      trial_duration: 800,
    },
  ];
};
