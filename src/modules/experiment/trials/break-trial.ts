import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { Trial } from '../utils/types';

const t = i18n.t.bind(i18n);

export const breakTrial = (state: ExperimentState): Trial => {
  const remaining = state.getRemainingTrials();
  const duration = state.getBreakDuration();

  return {
    type: htmlKeyboardResponse,
    stimulus: () => `
        <div class="nback-break">
          <h2>${t('BREAK.TITLE')}</h2>
          <p>${t('BREAK.MESSAGE')}</p>
          <p><strong>${t('BREAK.REMAINING')}</strong> ${remaining}</p>
          <p class="countdown-text">${t('BREAK.COUNTDOWN')} <span id="break-countdown">${duration}</span>s</p>
          <p class="continue-prompt">${t('BREAK.PRESS_TO_CONTINUE')}</p>
        </div>
      `,
    choices: [' '],
    on_load: () => {
      let timeLeft = duration;
      const countdownElement = document.getElementById('break-countdown');

      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        if (countdownElement) {
          countdownElement.textContent = timeLeft.toString();
        }
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      // Store interval ID for cleanup
      const windowRecord = window as unknown as Record<string, unknown>;
      windowRecord.breakCountdownInterval = countdownInterval;
    },
    on_finish: () => {
      // Clean up interval
      const windowRecord = window as unknown as Record<string, unknown>;
      if (windowRecord.breakCountdownInterval) {
        clearInterval(windowRecord.breakCountdownInterval as NodeJS.Timeout);
        delete windowRecord.breakCountdownInterval;
      }
    },
    post_trial_gap: 500,
  };
};
