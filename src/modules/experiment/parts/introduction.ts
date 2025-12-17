import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Timeline, Trial } from '../utils/types';

const t = i18n.t.bind(i18n);

/**
 * Fullscreen entry screen with instructions
 */
const experimentBeginTrial = (state: ExperimentState): Trial => {
  const { nLevel } = state.getNBackSettings();
  const { responseKey } = state.getNBackSettings();

  let responseText = 'spacebar';
  if (responseKey === 'mouse') {
    responseText = 'mouse click';
  } else if (responseKey === 'both') {
    responseText = 'spacebar or mouse click';
  }

  return {
    type: FullscreenPlugin,
    choices: [t('NBACK.START_BUTTON')],
    message: `
      <div class="nback-intro">
        <h1>${t('NBACK.WELCOME_TITLE')}</h1>
        <p>${t('NBACK.WELCOME_MESSAGE')}</p>
        <p>${t(`NBACK.TASK_DESCRIPTION_${nLevel}`)}</p>
        <p>${t('NBACK.RESPONSE_METHOD')}: <strong>${responseText}</strong></p>
      </div>
    `,
    fullscreen_mode: true,
  };
};

/**
 * Detailed task instructions
 */
const taskInstructions = (state: ExperimentState): Trial[] => {
  const { nLevel } = state.getNBackSettings();

  return [
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.CONTINUE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <h2>${t('NBACK.INSTRUCTIONS_TITLE')}</h2>
          <p>${t('NBACK.INSTRUCTIONS_OVERVIEW')}</p>
          <p>${t('NBACK.INSTRUCTIONS_SEQUENCE')}</p>
        </div>
      `,
    },
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.CONTINUE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <h2>${t('NBACK.TASK_RULES_TITLE')}</h2>
          <p>${t(`NBACK.TASK_RULES_${nLevel}`)}</p>
          <p>${t(`NBACK.EXAMPLES_${nLevel}`)}</p>
        </div>
      `,
    },
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.CONTINUE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <h2>${t('NBACK.RESPONSE_INSTRUCTIONS_TITLE')}</h2>
          <p>${t('NBACK.RESPONSE_WHEN_MATCH')}</p>
          <p>${t('NBACK.RESPONSE_WHEN_NO_MATCH')}</p>
          <p class="important">${t('NBACK.SPEED_ACCURACY_BALANCE')}</p>
        </div>
      `,
    },
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.START_PRACTICE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <h2>${t('NBACK.PRACTICE_INTRO_TITLE')}</h2>
          <p>${t('NBACK.PRACTICE_INTRO_MESSAGE')}</p>
          <p>${t('NBACK.READY_MESSAGE')}</p>
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

  // Skip instructions if configured
  if (state.getGeneralSettings().skipInstructions) {
    instructionTimeline.push(experimentBeginTrial(state));
    return instructionTimeline;
  }

  // Full introduction sequence
  instructionTimeline.push(experimentBeginTrial(state));
  instructionTimeline.push(...taskInstructions(state));

  return instructionTimeline;
};
