import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from 'jspsych';

import { ExperimentState } from '../jspsych/experiment-state-class';
import i18n from '../jspsych/i18n';

const t = i18n.t.bind(i18n);

const info = {
  name: 'nback-stimulus',
  parameters: {
    stimulus: {
      type: ParameterType.INT,
      default: undefined,
    },
    display_duration: {
      type: ParameterType.INT,
      default: 500,
    },
    inter_stimulus_interval: {
      type: ParameterType.INT,
      default: 2000,
    },
    valid_responses: {
      type: ParameterType.KEYS,
      default: [' '],
    },
    allow_mouse_response: {
      type: ParameterType.BOOL,
      default: false,
    },
    correct_response: {
      type: ParameterType.BOOL,
      default: false,
    },
    trial_index: {
      type: ParameterType.INT,
      default: 0,
    },
    state: {
      type: ParameterType.COMPLEX,
      default: undefined,
    },
    show_training_feedback: {
      type: ParameterType.BOOL,
      default: false,
    },
  },
};

type Info = typeof info;

class NBackStimulusPlugin implements JsPsychPlugin<Info> {
  static info = info;

  private responseAllowed = false;

  private responseGiven = false;

  private responseTime: number | null = null;

  private startTime: number = 0;

  constructor(private jsPsych: JsPsych) {}

  trial(displayElement: HTMLElement, trial: TrialType<Info>): void {
    const state = trial.state as ExperimentState;
    // eslint-disable-next-line no-param-reassign
    displayElement.className = 'nback-trial';

    const stimulusDiv = document.createElement('div');
    stimulusDiv.className = 'nback-stimulus';
    stimulusDiv.innerHTML = `<div class="number-display">${trial.stimulus}</div>`;
    displayElement.appendChild(stimulusDiv);

    let response = false;
    this.responseGiven = false;
    this.responseAllowed = true;
    this.startTime = performance.now();

    type FeedbackType = 'hit' | 'false-positive' | 'miss';

    const showFeedback = (type: FeedbackType): void => {
      const feedbackDiv = document.createElement('div');
      if (type === 'hit') {
        feedbackDiv.className =
          'nback-trial-feedback nback-trial-feedback--correct';
        feedbackDiv.textContent = '✓';
      } else {
        feedbackDiv.className =
          'nback-trial-feedback nback-trial-feedback--incorrect';
        feedbackDiv.textContent =
          type === 'miss'
            ? t('PRACTICE.TRIAL_FEEDBACK_MISS')
            : t('PRACTICE.TRIAL_FEEDBACK_FALSE_POSITIVE');
      }
      displayElement.appendChild(feedbackDiv);
    };

    const onResponse = (): void => {
      this.responseGiven = true;
      response = true;
      this.responseTime = performance.now() - this.startTime;
      if (trial.show_training_feedback) {
        stimulusDiv.style.display = 'none';
        showFeedback(trial.correct_response ? 'hit' : 'false-positive');
      }
    };

    const keyboardListener = (e: KeyboardEvent): void => {
      if (!this.responseAllowed || this.responseGiven) return;
      if (trial.valid_responses.includes(e.key)) onResponse();
    };

    const mouseListener = (): void => {
      if (
        !this.responseAllowed ||
        this.responseGiven ||
        !trial.allow_mouse_response
      )
        return;
      onResponse();
    };

    document.addEventListener('keydown', keyboardListener);
    if (trial.allow_mouse_response) {
      displayElement.addEventListener('click', mouseListener);
    }

    NBackStimulusPlugin.togglePhotoDiode(true);

    this.jsPsych.pluginAPI.setTimeout(() => {
      stimulusDiv.style.display = 'none';
      NBackStimulusPlugin.togglePhotoDiode(false);
    }, trial.display_duration);

    this.jsPsych.pluginAPI.setTimeout(() => {
      this.responseAllowed = false;
      document.removeEventListener('keydown', keyboardListener);
      displayElement.removeEventListener('click', mouseListener);

      const correct = response === trial.correct_response;

      if (state.isPracticeMode()) {
        state.recordPracticeResponse(correct, response, trial.correct_response);
      }

      state.incrementTrial();

      const trialData = {
        stimulus: trial.stimulus,
        response,
        correct_response: trial.correct_response,
        correct,
        rt: this.responseTime,
        trial_index: trial.trial_index,
        practice: state.isPracticeMode(),
      };

      const endTrial = (): void => {
        // eslint-disable-next-line no-param-reassign
        displayElement.innerHTML = '';
        this.jsPsych.finishTrial(trialData);
      };

      const finishAfterBlank = (): void => {
        // eslint-disable-next-line no-param-reassign
        displayElement.innerHTML = '';
        this.jsPsych.pluginAPI.setTimeout(endTrial, 500);
      };

      if (trial.show_training_feedback) {
        if (!response && trial.correct_response) {
          // Miss: show negative feedback now, then blank + finish
          showFeedback('miss');
          this.jsPsych.pluginAPI.setTimeout(finishAfterBlank, 1000);
        } else if (response) {
          // Hit or false positive: feedback shown since responseTime; ensure 1s total
          const feedbackShownFor =
            trial.inter_stimulus_interval - (this.responseTime ?? 0);
          const remaining = Math.max(0, 1000 - feedbackShownFor);
          if (remaining > 0) {
            this.jsPsych.pluginAPI.setTimeout(finishAfterBlank, remaining);
          } else {
            finishAfterBlank();
          }
        } else {
          // Correct ignore: no feedback, no blank
          endTrial();
        }
      } else {
        endTrial();
      }
    }, trial.inter_stimulus_interval);
  }

  private static togglePhotoDiode(white: boolean): void {
    const photoDiode = document.getElementById('photo-diode-element');
    if (photoDiode) {
      if (white) {
        photoDiode.classList.remove('photo-diode-black');
        photoDiode.classList.add('photo-diode-white');
      } else {
        photoDiode.classList.remove('photo-diode-white');
        photoDiode.classList.add('photo-diode-black');
      }
    }
  }
}

export default NBackStimulusPlugin;
