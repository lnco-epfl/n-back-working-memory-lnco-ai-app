import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import {
  ExperimentState,
  isTargetTrial,
} from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import NBackStimulusPlugin from '../trials/nback-stimulus-trial';
import { practiceFeedbackTrial } from '../trials/practice-feedback-trial';
import { Timeline } from '../utils/types';
import { buildTaskInstructions } from './introduction';

const t = i18n.t.bind(i18n);

/**
 * Build practice trials timeline
 */
export const buildPractice = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
): Timeline => {
  const practiceAttemptTimeline: Timeline = [];

  // Skip practice if configured
  if (state.getGeneralSettings().skipPractice) {
    return practiceAttemptTimeline;
  }

  // Initialize practice sequence
  state.initializePracticeSequence();

  // Get practice settings
  const { displayDuration, interStimulusInterval, responseKey } =
    state.getNBackSettings();

  // Determine valid keyboard responses and mouse setting
  const validResponses = responseKey === 'mouse' ? 'NO_KEYS' : [' '];
  const allowMouse = responseKey !== 'space';

  // Get the full sequence
  const sequence = state.getSequence();
  const configuredMaxRepetitions =
    state.getNBackSettings().numberOfPracticeRepetitionsAllowed;
  const maxRepetitions = Number.isFinite(configuredMaxRepetitions)
    ? Math.max(0, Math.floor(configuredMaxRepetitions))
    : 1;
  let repetitionsUsed = 0;

  // Reset practice counters at the start of each attempt.
  practiceAttemptTimeline.push({
    type: htmlKeyboardResponse,
    stimulus: '',
    choices: 'NO_KEYS',
    trial_duration: 0,
    on_start: () => {
      state.resetPracticeMetrics();
    },
  });

  // If this is a repeated attempt, route participants through instructions again.
  practiceAttemptTimeline.push({
    timeline: buildTaskInstructions(state),
    conditional_function: () => repetitionsUsed > 0,
  });

  // Create practice trials
  for (let i = 0; i < sequence.length; i += 1) {
    const stimulus = sequence[i];
    const correctResponse = isTargetTrial(
      sequence,
      i,
      state.getNBackSettings().nLevel,
    );

    const trial = {
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
        // Save data after each trial
        if (updateData && jsPsych) {
          updateData(jsPsych.data.get(), state.getAllSettings());
        }
      },
    };

    practiceAttemptTimeline.push(trial);
  }

  // Add feedback screen
  practiceAttemptTimeline.push(practiceFeedbackTrial(state));

  // Ask whether to continue or redo practice (if repetitions remain).
  practiceAttemptTimeline.push({
    type: HtmlButtonResponsePlugin,
    stimulus: () => {
      const repetitionsRemaining = Math.max(
        0,
        maxRepetitions - repetitionsUsed,
      );
      const exhaustedMessage =
        repetitionsRemaining === 0
          ? `<p class="continue-prompt">${t('PRACTICE.RETRIES_EXHAUSTED')}</p>`
          : '';

      return `
      <div class="nback-practice-repeat">
        <h2>${t('PRACTICE.NEXT_STEP_TITLE')}</h2>
        <p>${t('PRACTICE.NEXT_STEP_MESSAGE')}</p>
        ${exhaustedMessage}
      </div>
    `;
    },
    choices: () => {
      if (repetitionsUsed >= maxRepetitions) {
        return [t('PRACTICE.CONTINUE_TO_MAIN')];
      }
      return [t('PRACTICE.CONTINUE_TO_MAIN'), t('PRACTICE.REDO_PRACTICE')];
    },
    on_finish: (data: unknown) => {
      const d = data as Record<string, unknown>;
      const buttonPressed = Number(d.response);
      const wantsRepeat =
        repetitionsUsed < maxRepetitions && buttonPressed === 1;
      d.repeat_practice = wantsRepeat;
      if (wantsRepeat) {
        repetitionsUsed += 1;
      }
    },
  });

  const practiceLoop = {
    timeline: practiceAttemptTimeline,
    loop_function: (data: unknown) => {
      const d = data as Record<string, unknown> & { values: () => unknown[] };
      const lastTrial = d.values().slice(-1)[0] as
        | Record<string, unknown>
        | undefined;
      return lastTrial?.repeat_practice === true;
    },
  };

  // Keep one lightweight transition screen to preserve current keyboard flow before main task.
  const continueToMainTrial = {
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="nback-practice-repeat">
        <h2>${t('PRACTICE.FEEDBACK_TITLE')}</h2>
        <p>${t('PRACTICE.PRESS_TO_CONTINUE')}</p>
      </div>
    `,
    choices: [' '],
  };

  return [practiceLoop, continueToMainTrial];
};
