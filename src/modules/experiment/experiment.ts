/**
 * @title N-Back Working Memory Task
 * @description This experiment implements an N-back working memory task with configurable settings.
 * @version 1.0.0
 *
 * @assets assets/
 */
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Marked } from '@ts-stack/markdown';
import { DataCollection, JsPsych, initJsPsych } from 'jspsych';

import { ExperimentResult } from '../config/appResults';
import { AllSettingsType, NextStepSettings } from '../context/SettingsContext';
import { ExperimentState } from './jspsych/experiment-state-class';
import './jspsych/i18n';
import { buildIntroduction } from './parts/introduction';
import { buildPractice } from './parts/practice';
import { buildMainTask } from './parts/task-core';
import './styles/main.scss';
import { PROGRESS_BAR } from './utils/constants';
import { Timeline, Trial } from './utils/types';
import { changeProgressBar, resolveLink } from './utils/utils';

/**
 * End page with optional link to next experiment
 */
const getEndPage = ({
  title,
  description,
  link,
  linkText,
}: NextStepSettings): Trial => ({
  type: jsPsychHtmlKeyboardResponse,
  choices: 'NO_KEYS',
  stimulus: `<div class='sd-html'><h3>${title}</h3><p>${Marked.parse(description)}</p><a class='link-to-experiment' target="_parent" href=${link}>${linkText}</a></div>`,
});

/**
 * @function run
 * @description Main function to run the N-back experiment
 * @param {Object} config - Configuration object for the experiment
 */
export async function run({
  assetPaths,
  input,
  updateData,
}: {
  assetPaths: { images: string[]; audio: string[]; video: string[] };
  input: {
    settings: AllSettingsType;
    results: ExperimentResult;
    participantName: string;
  };
  updateData: (data: DataCollection, settings: AllSettingsType) => void;
}): Promise<JsPsych> {
  // Initialize experiment state
  const state = new ExperimentState(input.settings);

  // Setup photo-diode if enabled
  if (state.getPhotoDiodeSettings().usePhotoDiode !== 'off') {
    const photoDiodeElement = document.createElement('div');
    photoDiodeElement.id = 'photo-diode-element';
    photoDiodeElement.className = `photo-diode photo-diode-black ${state.getPhotoDiodeSettings().usePhotoDiode} ${state.getPhotoDiodeSettings().testPhotoDiode ? 'photo-diode-test' : ''}`;
    document
      .getElementById('jspsych-display-element')
      ?.appendChild(photoDiodeElement);
    if (state.getPhotoDiodeSettings().usePhotoDiode === 'customize') {
      const left = state.getPhotoDiodeSettings().photoDiodeLeft;
      const top = state.getPhotoDiodeSettings().photoDiodeTop;
      const width = state.getPhotoDiodeSettings().photoDiodeWidth;
      const height = state.getPhotoDiodeSettings().photoDiodeHeight;
      if (photoDiodeElement && left && top && width && height) {
        photoDiodeElement.style.setProperty('--photodiode-left', left);
        photoDiodeElement.style.setProperty('--photodiode-top', top);
        photoDiodeElement.style.setProperty('--photodiode-width', width);
        photoDiodeElement.style.setProperty('--photodiode-height', height);
      }
    }
  }

  // Apply font size setting
  if (state.getGeneralSettings().fontSize) {
    const jspsychDisplayElement = document.getElementById(
      'jspsych-display-element',
    );
    if (jspsychDisplayElement) {
      jspsychDisplayElement.setAttribute(
        'data-font-size',
        state.getGeneralSettings().fontSize,
      );
    }
  }

  const updateDataWithSettings = (data: DataCollection): void => {
    updateData(data, input.settings);
  };

  // Function to create the re-enter fullscreen button
  const addFullscreenButton = (): void => {
    const progressBarContainer = document.getElementById(
      'jspsych-progressbar-container',
    );

    if (progressBarContainer) {
      const fullscreenButton = document.createElement('button');
      fullscreenButton.textContent = 'Fullscreen';
      fullscreenButton.className = 'jspsych-btn-progress-bar';
      fullscreenButton.style.marginLeft = '10px';
      fullscreenButton.style.cursor = 'pointer';

      fullscreenButton.addEventListener('click', () => {
        const docEl = document.documentElement as HTMLElement & {
          mozRequestFullScreen?: () => Promise<void>;
          webkitRequestFullscreen?: () => Promise<void>;
          msRequestFullscreen?: () => Promise<void>;
        };
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      });

      progressBarContainer.appendChild(fullscreenButton);
    }
  };

  const addFontSizeMenu = (): void => {
    const progressBar = document.getElementById(
      'jspsych-progressbar-container',
    );
    if (progressBar && !document.querySelector('.custom-dropdown')) {
      const dropdown = document.createElement('select');
      dropdown.className = 'custom-dropdown';
      dropdown.innerHTML = `
          <option value="small" ${state.getGeneralSettings().fontSize === 'small' ? 'selected' : ''}>Small</option>
          <option value="normal" ${state.getGeneralSettings().fontSize === 'normal' ? 'selected' : ''}>Normal</option>
          <option value="large" ${state.getGeneralSettings().fontSize === 'large' ? 'selected' : ''}>Large</option>
          <option value="extra-large" ${state.getGeneralSettings().fontSize === 'extra-large' ? 'selected' : ''}>Extra Large</option>
        `;
      const fontSizeTitle = document.createElement('span');
      fontSizeTitle.innerHTML = 'Font Size:';
      fontSizeTitle.style.marginLeft = '10px';
      progressBar.appendChild(fontSizeTitle);
      progressBar.appendChild(dropdown);

      dropdown.addEventListener('change', (event) => {
        const { target } = event;
        const jspsychDisplayElement = document.getElementById(
          'jspsych-display-element',
        );
        if (jspsychDisplayElement && target instanceof HTMLSelectElement) {
          jspsychDisplayElement.setAttribute('data-font-size', target.value);
        }
      });
    }
  };

  const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    message_progress_bar: PROGRESS_BAR.PROGRESS_BAR_INTRODUCTION,
    display_element: 'jspsych-display-element',
  });

  const blockUnload = (event: BeforeUnloadEvent): string => {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.returnValue = '';
    updateDataWithSettings(jsPsych.data.get());
    return '';
  };
  window.addEventListener('beforeunload', blockUnload);

  // Build experiment timeline
  const timeline: Timeline = [];

  timeline.push({
    type: PreloadPlugin,
    assetPaths,
    max_load_time: 120000,
    on_load() {
      addFullscreenButton();
      addFontSizeMenu();
    },
  });

  // Introduction
  timeline.push({
    timeline: buildIntroduction(state),
    on_timeline_finish() {
      changeProgressBar('Instructions Complete', 0.2, jsPsych);
    },
  });

  // Practice
  if (!state.getGeneralSettings().skipPractice) {
    timeline.push({
      timeline: buildPractice(state, updateDataWithSettings, jsPsych),
      on_timeline_finish() {
        changeProgressBar('Practice Complete', 0.4, jsPsych);
      },
    });
  }

  // Main task
  timeline.push({
    timeline: buildMainTask(state, updateDataWithSettings, jsPsych),
    on_timeline_start() {
      state.startMainTask();
      changeProgressBar('Main Task', 0.5, jsPsych);
    },
    on_timeline_finish() {
      changeProgressBar('Task Complete', 1.0, jsPsych);
    },
  });

  // End page
  if (state.getNextStepSettings().linkToNextPage) {
    const nextStepLink = resolveLink(
      state.getNextStepSettings().link,
      input.participantName,
    );
    timeline.push({
      ...getEndPage({ ...state.getNextStepSettings(), link: nextStepLink }),
      on_load() {
        window.removeEventListener('beforeunload', blockUnload);
        updateDataWithSettings(jsPsych.data.get());
      },
    });
  }

  await jsPsych.run(timeline);

  return jsPsych;
}
