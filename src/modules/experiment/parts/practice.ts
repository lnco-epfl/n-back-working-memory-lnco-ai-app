import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AudioNarration } from 'jspsych-audio-narration';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import {
  ExperimentState,
  isTargetTrial,
} from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { buildCountdown } from '../trials/countdown-trial';
import NBackStimulusPlugin from '../trials/nback-stimulus-trial';
import { practiceFeedbackTrial } from '../trials/practice-feedback-trial';
import { FALSE_POSITIVE_PRACTICE } from '../utils/constants';
import { Timeline } from '../utils/types';
import { buildTaskInstructions } from './introduction';

const t = i18n.t.bind(i18n);

const addTrainingBanner = (): void => {
  const progressBar = document.getElementById('jspsych-progressbar-container');
  if (progressBar && !document.getElementById('nback-training-label')) {
    const label = document.createElement('span');
    label.id = 'nback-training-label';
    label.className = 'nback-training-label';
    label.textContent = t('PRACTICE.TRAINING_LABEL');
    progressBar.prepend(label);
  }
};

const removeTrainingBanner = (): void => {
  document.getElementById('nback-training-label')?.remove();
};

/**
 * Build practice trials timeline.
 *
 * Each loop iteration:
 *   1. Reset metrics (+ show instructions again if this is a retry)
 *   2. Practice trials (with TRAINING banner)
 *   3. Feedback
 *   4. Training-complete message (banner removed here)
 *   5. Comprehension check
 *
 * Repeat condition: bad performance (0 hits OR false positives > targets)
 *                   OR wrong comprehension answer — checked at end of each iteration.
 * Both conditions independently trigger a retry, up to maxRepetitions total.
 */
export const buildPractice = (
  state: ExperimentState,
  updateData: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych: JsPsych,
  narration: AudioNarration,
): Timeline => {
  if (state.getGeneralSettings().skipPractice) {
    return [];
  }

  state.initializePracticeSequence();

  const { displayDuration, interStimulusInterval, responseKey, nLevel } =
    state.getNBackSettings();
  const validResponses = responseKey === 'mouse' ? 'NO_KEYS' : [' '];
  const allowMouse = responseKey !== 'space';
  const sequence = state.getSequence();
  const configuredMaxRepetitions =
    state.getNBackSettings().numberOfPracticeRepetitionsAllowed;
  const maxRepetitions = Number.isFinite(configuredMaxRepetitions)
    ? Math.max(0, Math.floor(configuredMaxRepetitions))
    : 1;

  let repetitionsUsed = 0;

  // ── Attempt timeline (runs once per loop iteration) ──────────────────────

  const attemptTimeline: Timeline = [];

  // Reset metrics and shouldRepeat flag at the start of each attempt.
  attemptTimeline.push({
    type: htmlKeyboardResponse,
    stimulus: '',
    choices: 'NO_KEYS' as const,
    trial_duration: 0,
    on_start: () => {
      state.resetPracticeMetrics();
      addTrainingBanner();
    },
  });

  // On retry, show an intermediate notice before re-entering instructions.
  attemptTimeline.push({
    timeline: [
      {
        type: HtmlButtonResponsePlugin,
        stimulus: () =>
          `<div class="nback-instructions">
            <p>${t('PRACTICE.REPEAT_NOTICE')}</p>
            <p>${t(`NBACK.CLICK_TO_CONTINUE`)}</p>
          </div>`,
        choices: [t('NBACK.CONTINUE_BUTTON')],
        on_start() {
          if (repetitionsUsed > 0) {
            narration.play('assets/audio/nback_practice_repeat.mp3');
          }
        },
        on_finish() {
          narration.stop();
        },
      },
    ],
    conditional_function: () => repetitionsUsed > 0,
  });

  // Show instructions again on retry attempts.
  attemptTimeline.push({
    timeline: buildTaskInstructions(state, narration),
    conditional_function: () => repetitionsUsed > 0,
  });

  // Countdown before stimulus trials.
  attemptTimeline.push(...buildCountdown(state));

  // Practice stimulus trials.
  for (let i = 0; i < sequence.length; i += 1) {
    const stimulus = sequence[i];
    const correctResponse = isTargetTrial(sequence, i, nLevel);
    attemptTimeline.push({
      type: NBackStimulusPlugin,
      stimulus,
      display_duration: displayDuration,
      inter_stimulus_interval: interStimulusInterval,
      valid_responses: validResponses,
      allow_mouse_response: allowMouse,
      correct_response: correctResponse,
      trial_index: i,
      state,
      on_finish: () => {
        if (updateData && jsPsych) {
          updateData(jsPsych.data.get(), state.getAllSettings());
        }
      },
    });
  }

  // Feedback screen.
  attemptTimeline.push(practiceFeedbackTrial(state));

  // Training-complete message (also removes the TRAINING banner).
  attemptTimeline.push({
    type: HtmlButtonResponsePlugin,
    choices: [t('NBACK.CONTINUE_BUTTON')],
    stimulus: `
      <div class="nback-instructions">
        <p>${t('PRACTICE.TRAINING_COMPLETE')}</p>
        <p>${t(`NBACK.CLICK_TO_CONTINUE`)}</p>
      </div>
    `,
    on_start: () => {
      removeTrainingBanner();
      narration.play('assets/audio/nback_practice_complete.mp3');
    },
    on_finish: () => {
      narration.stop();
    },
  });

  // Comprehension check — always shown, every iteration.
  attemptTimeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: `
      <style>
        #jspsych-html-button-response-btngroup {
          align-items: flex-start !important;
          width: 100%;
          max-width: 600px;
        }
        #jspsych-html-button-response-btngroup .jspsych-btn {
          text-align: left;
          text-transform: none;
          width: 100%;
          white-space: normal;
        }
      </style>
      <div class="nback-comprehension">
        ${t('PRACTICE.COMPREHENSION_QUESTION')}
      </div>
    `,
    choices: [
      t('PRACTICE.COMPREHENSION_A'),
      t(`PRACTICE.COMPREHENSION_B_${nLevel}`),
      t('PRACTICE.COMPREHENSION_C'),
    ],
    on_start() {
      narration.play('assets/audio/nback_practice_comprehension.mp3');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on_finish: (data: any) => {
      narration.stop();
      const d = data as Record<string, unknown>;
      const badPerformance =
        state.getPracticeHitCount() === 0 ||
        state.getPracticeFalsePositiveCount() > FALSE_POSITIVE_PRACTICE;
      const wrongAnswer = d.response !== 1;
      if ((badPerformance || wrongAnswer) && repetitionsUsed < maxRepetitions) {
        // eslint-disable-next-line no-param-reassign
        data.shouldRepeat = true;
        repetitionsUsed += 1;
      }
    },
  });

  // ── Loop ─────────────────────────────────────────────────────────────────

  const practiceLoop = {
    timeline: attemptTimeline,
    loop_function: () =>
      jsPsych.data.get().last(1).values()[0].shouldRepeat === true,
  };

  return [practiceLoop];
};
