import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Timeline, Trial } from '../utils/types';

const t = i18n.t.bind(i18n);

/**
 * Fullscreen entry screen
 */
const experimentBeginTrial = (): Trial => ({
  type: FullscreenPlugin,
  choices: [t('NBACK.START_BUTTON')],
  message: `
    <div class="nback-intro">
      <h1>${t('NBACK.WELCOME_TITLE')}</h1>
      <p>${t('NBACK.WELCOME_MESSAGE')}</p>
    </div>
  `,
  fullscreen_mode: true,
});

/**
 * Two-screen instruction sequence matching the study protocol.
 * Screen 1: task description + rule emphasis + examples (n-level specific)
 * Screen 2: speed/accuracy guidance + practice announcement
 */
export const buildTaskInstructions = (state: ExperimentState): Trial[] => {
  const { nLevel } = state.getNBackSettings();

  return [
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.CONTINUE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <p>${t(`NBACK.INSTRUCTIONS_INTRO_${nLevel}`)}</p>
          <p class="important">${t(`NBACK.TASK_RULE_EMPHASIS_${nLevel}`)}</p>
          ${t(`NBACK.EXAMPLES_${nLevel}`)}
        </div>
      `,
    },
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.START_PRACTICE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <p>${t('NBACK.SPEED_ACCURACY')}</p>
          <p>${t('NBACK.DURATION')}</p>
          <p class="important">${t(`NBACK.PRACTICE_REMINDER_${nLevel}`)}</p>
        </div>
      `,
    },
  ];
};

/**
 * Build introduction timeline
 */
export const buildIntroduction = (state: ExperimentState): Timeline => {
  const instructionTimeline: Timeline = [];

  instructionTimeline.push(experimentBeginTrial());

  if (!state.getGeneralSettings().skipInstructions) {
    instructionTimeline.push(...buildTaskInstructions(state));
  }

  return instructionTimeline;
};
