import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import type { DataCollection, JsPsych } from 'jspsych';

import { AllSettingsType } from '@/modules/context/SettingsContext';

import {
  ExperimentState,
  isTargetTrial,
} from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';
import { breakTrial } from '../trials/break-trial';
import NBackStimulusPlugin from '../trials/nback-stimulus-trial';
import { Timeline } from '../utils/types';

const t = i18n.t.bind(i18n);

/**
 * Build main task timeline with breaks
 */
export const buildMainTask = (
  state: ExperimentState,
  updateData?: (data: DataCollection, settings: AllSettingsType) => void,
  jsPsych?: JsPsych,
): Timeline => {
  const timeline: Timeline = [];

  // Initialize main sequence
  state.initializeMainSequence();

  // Get settings
  const { displayDuration, interStimulusInterval, responseKey } =
    state.getNBackSettings();

  // Determine valid keyboard responses and mouse setting
  const validResponses = responseKey === 'mouse' ? 'NO_KEYS' : [' '];
  const allowMouse = responseKey !== 'space';

  // Add ready screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="nback-ready">
        <h2>${t('MAIN_TASK.READY_TITLE')}</h2>
        <p>${t('MAIN_TASK.READY_MESSAGE')}</p>
        <p class="continue-prompt">${t('MAIN_TASK.PRESS_TO_BEGIN')}</p>
      </div>
    `,
    choices: [' '],
  });

  // Get the full sequence
  const sequence = state.getSequence();

  // Create main task trials
  for (let i = 0; i < sequence.length; i += 1) {
    // Add break if needed
    if (state.shouldShowBreak()) {
      timeline.push(breakTrial(state));
    }

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

  // Add completion screen
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div class="nback-complete">
        <h2>${t('MAIN_TASK.COMPLETE_TITLE')}</h2>
        <p>${t('MAIN_TASK.COMPLETE_MESSAGE')}</p>
        <p class="continue-prompt">${t('MAIN_TASK.PRESS_TO_CONTINUE')}</p>
      </div>
    `,
    choices: [' '],
  });

  return timeline;
};
