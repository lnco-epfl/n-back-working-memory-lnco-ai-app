import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { NarrationPlayer, Timeline, Trial } from '../utils/types';

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
export const buildTaskInstructions = (
  state: ExperimentState,
  narration: NarrationPlayer,
): Trial[] => {
  const { nLevel } = state.getNBackSettings();

  return [
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.CONTINUE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <h2>${t('NBACK.INSTRUCTIONS_INTRO_TITLE')}</h2>

          <p>${t(`NBACK.INSTRUCTIONS_INTRO_${nLevel}`)}</p>
          <img src='${t('NBACK.HAND_IMAGE')}' alt="Spacebar Image" class="instructions-example-image" />
          <p class="important">${t(`NBACK.TASK_RULE_EMPHASIS_${nLevel}`)}</p>
          <p>${t(`NBACK.EXAMPLE_INTRO`)}</p>
          ${t(`NBACK.EXAMPLES_${nLevel}`)}
          ${t(`NBACK.CLICK_TO_CONTINUE`)}
        </div>
      `,
      on_start() {
        narration.play('assets/audio/nback_instructions_intro.mp3');
      },
      on_finish() {
        narration.stop();
      },
    },
    {
      type: HtmlButtonResponsePlugin,
      choices: [t('NBACK.START_PRACTICE_BUTTON')],
      stimulus: `
        <div class="nback-instructions">
          <p>${t(`NBACK.PRACTICE_REMINDER_${nLevel}`)}</p>
          <p>${t('NBACK.DURATION')}</p>
          <p>${t('NBACK.SPEED_ACCURACY')}</p>
          <p class="important">${t('NBACK.REMINDER_INSTRUCTIONS')}</p>
          ${t(`NBACK.CLICK_TO_CONTINUE`)}
        </div>
      `,
      on_start() {
        narration.play('assets/audio/nback_instructions_practice.mp3');
      },
      on_finish() {
        narration.stop();
      },
    },
  ];
};

/**
 * Build introduction timeline
 */
export const buildIntroduction = (
  state: ExperimentState,
  narration: NarrationPlayer,
): Timeline => {
  const instructionTimeline: Timeline = [];

  instructionTimeline.push(experimentBeginTrial());

  if (!state.getGeneralSettings().skipInstructions) {
    instructionTimeline.push(...buildTaskInstructions(state, narration));
  }

  return instructionTimeline;
};
