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

const t = i18n.t.bind(i18n);

/**
 * Build practice trials timeline
 */
export const buildPractice = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  // Skip practice if configured
  if (state.getGeneralSettings().skipPractice) {
    return timeline;
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

    timeline.push(trial);
  }

  // Add feedback screen
  timeline.push(practiceFeedbackTrial(state));

  // Option to repeat practice
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="nback-practice-repeat">
        <h2>${t('PRACTICE.FEEDBACK_TITLE')}</h2>
        <p>${t('PRACTICE.PRESS_TO_CONTINUE')}</p>
      </div>
    `,
    choices: ['r', ' '],
    on_finish: (data: unknown) => {
      // If 'r' was pressed, restart practice
      const d = data as Record<string, unknown>;
      if (d.response === 'r') {
        d.repeat_practice = true;
      }
    },
  });

  // Conditional repetition
  const practiceLoop = {
    timeline,
    loop_function: (data: unknown) => {
      // Check the last trial for repeat_practice flag
      const d = data as Record<string, unknown> & { values: () => unknown[] };
      const lastTrial = d.values().slice(-1)[0] as
        | Record<string, unknown>
        | undefined;
      return lastTrial?.repeat_practice === true;
    },
  };

  return [practiceLoop];
};
