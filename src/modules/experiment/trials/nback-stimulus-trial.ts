import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from 'jspsych';

import { ExperimentState } from '../jspsych/experiment-state-class';

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
  },
};

type Info = typeof info;

class NBackStimulusPlugin implements JsPsychPlugin<Info> {
  static info = info;

  private display: HTMLElement | null = null;

  private responseAllowed = false;

  private responseGiven = false;

  private responseTime: number | null = null;

  private startTime: number = 0;

  constructor(private jsPsych: JsPsych) {}

  trial(displayElement: HTMLElement, trial: TrialType<Info>): void {
    const state = trial.state as ExperimentState;
    const { fontSize } = state.getGeneralSettings();
    const element = displayElement;
    element.className = `nback-trial font-${fontSize}`;

    const stimulusDiv = document.createElement('div');
    stimulusDiv.className = 'nback-stimulus';
    stimulusDiv.innerHTML = `<div class="number-display">${trial.stimulus}</div>`;
    displayElement.appendChild(stimulusDiv);

    let response = false;
    this.responseGiven = false;
    this.responseAllowed = true;
    this.startTime = performance.now();

    const keyboardListener = (e: KeyboardEvent): void => {
      if (!this.responseAllowed || this.responseGiven) return;
      if (trial.valid_responses.includes(e.key)) {
        this.responseGiven = true;
        response = true;
        this.responseTime = performance.now() - this.startTime;
      }
    };

    const mouseListener = (): void => {
      if (
        !this.responseAllowed ||
        this.responseGiven ||
        !trial.allow_mouse_response
      )
        return;
      this.responseGiven = true;
      response = true;
      this.responseTime = performance.now() - this.startTime;
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

      const el = displayElement;
      el.innerHTML = '';
      this.jsPsych.finishTrial(trialData);
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
