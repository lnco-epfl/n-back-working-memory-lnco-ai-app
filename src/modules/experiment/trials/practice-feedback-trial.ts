import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Trial } from '../utils/types';

const t = i18n.t.bind(i18n);

export const practiceFeedbackTrial = (state: ExperimentState): Trial => ({
  type: htmlKeyboardResponse,
  stimulus: () => {
    const accuracy = state.getPracticeAccuracy();
    const correct = state.getPracticeCorrectCount();
    const total = state.getPracticeTotalCount();
    const hits = state.getPracticeHitCount();
    const targets = state.getPracticeTargetCount();
    const falsePositives = state.getPracticeFalsePositiveCount();

    return `
      <div class="nback-feedback">
        <h2>${t('PRACTICE.FEEDBACK_TITLE')}</h2>
        <p>${t('PRACTICE.FEEDBACK_TEXT')}</p>
        <div class="feedback-stats">
          <p><strong>${t('PRACTICE.HITS')}</strong> ${hits}/${targets}</p>
          <p><strong>${t('PRACTICE.FALSE_POSITIVES')}</strong> ${falsePositives}</p>
          <p><strong>${t('PRACTICE.CORRECT_COUNT')}</strong> ${correct}/${total}</p>
          <p><strong>${t('PRACTICE.ACCURACY')}</strong> ${accuracy.toFixed(1)}%</p>
        </div>
        <p class="continue-prompt">${t('PRACTICE.PRESS_TO_CONTINUE')}</p>
      </div>
    `;
  },
  choices: [' '],
  post_trial_gap: 500,
});
