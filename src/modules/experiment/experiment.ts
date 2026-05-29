/**
 * @title N-Back Working Memory Task
 * @description This experiment implements an N-back working memory task with configurable settings.
 * @version 1.0.0
 *
 * @assets assets/
 */
import type { ScreenCalibration } from '@graasp/sdk';

import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import PreloadPlugin from '@jspsych/plugin-preload';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Marked } from '@ts-stack/markdown';
import { DataCollection, JsPsych, initJsPsych } from 'jspsych';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AudioNarration } from 'jspsych-audio-narration';

import { ExperimentResult } from '../config/appResults';
import { AllSettingsType, NextStepSettings } from '../context/SettingsContext';
import { ExperimentState } from './jspsych/experiment-state-class';
import i18n from './jspsych/i18n';
import { buildIntroduction } from './parts/introduction';
import { buildPractice } from './parts/practice';
import { buildMainTask } from './parts/task-core';
import './styles/main.scss';
import { Timeline, Trial } from './utils/types';
import { resolveLink } from './utils/utils';

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
  stimulus: `<h2>${title}</h2><p>${Marked.parse(description)}<a class='link-to-experiment' target="_parent" href=${link}>${linkText}</a></p>`,
});

/**
 * @function run
 * @description Main function to run the N-back experiment
 * @param {Object} config - Configuration object for the experiment
 */
export async function run({
  assetPaths,
  input,
  narration,
  updateData,
}: {
  assetPaths: { images: string[]; audio: string[]; video: string[] };
  input: {
    settings: AllSettingsType;
    results: ExperimentResult;
    participantName: string;
    screenCalibration?: ScreenCalibration;
  };
  narration: AudioNarration;
  updateData: (data: DataCollection, settings: AllSettingsType) => void;
}): Promise<JsPsych> {
  // Apply language setting before building any timeline strings.
  await i18n.changeLanguage(input.settings.generalSettings.language ?? 'en');

  // Initialize experiment state
  const state = new ExperimentState(input.settings);
  const calibratedFontSize =
    input.screenCalibration?.fontSize ?? state.getGeneralSettings().fontSize;
  const calibratedNumberScale = input.screenCalibration?.scale ?? 1;

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

  // Apply dynamic text and stimulus scaling from settings/calibration.
  const jspsychDisplayElement = document.getElementById(
    'jspsych-display-element',
  );
  if (jspsychDisplayElement) {
    jspsychDisplayElement.setAttribute('data-font-size', calibratedFontSize);
    jspsychDisplayElement.style.setProperty(
      '--nback-calibration-scale',
      String(calibratedNumberScale),
    );
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
      fullscreenButton.textContent = i18n.t('FULLSCREEN_BUTTON');
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
          <option value="small" ${calibratedFontSize === 'small' ? 'selected' : ''}>${i18n.t('FONT_SIZE_SMALL')}</option>
          <option value="normal" ${calibratedFontSize === 'normal' ? 'selected' : ''}>${i18n.t('FONT_SIZE_NORMAL')}</option>
          <option value="large" ${calibratedFontSize === 'large' ? 'selected' : ''}>${i18n.t('FONT_SIZE_LARGE')}</option>
          <option value="extra-large" ${calibratedFontSize === 'extra-large' ? 'selected' : ''}>${i18n.t('FONT_SIZE_EXTRA_LARGE')}</option>
        `;
      const fontSizeTitle = document.createElement('span');
      fontSizeTitle.innerHTML = i18n.t('FONT_SIZE_LABEL');
      fontSizeTitle.style.marginLeft = '10px';
      progressBar.appendChild(fontSizeTitle);
      progressBar.appendChild(dropdown);

      dropdown.addEventListener('change', (event) => {
        const { target } = event;
        if (jspsychDisplayElement && target instanceof HTMLSelectElement) {
          jspsychDisplayElement.setAttribute('data-font-size', target.value);
        }
      });
    }
  };

  const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    message_progress_bar: i18n.t('PROGRESS_BAR_MESSAGE'),
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
    images: assetPaths.images,
    audio: assetPaths.audio,
    max_load_time: 120000,
    on_load() {
      addFullscreenButton();
      addFontSizeMenu();
    },
  });

  // Introduction
  timeline.push({
    timeline: buildIntroduction(state, narration),
    on_timeline_start() {
      if (jsPsych.progressBar) jsPsych.progressBar.progress = 0.0;
    },
  });

  // Practice
  if (!state.getGeneralSettings().skipPractice) {
    timeline.push({
      timeline: buildPractice(
        state,
        updateDataWithSettings,
        jsPsych,
        narration,
      ),
      on_timeline_start() {
        if (jsPsych.progressBar) jsPsych.progressBar.progress = 0.2;
      },
    });
  }

  // Main task
  timeline.push({
    timeline: buildMainTask(state, updateDataWithSettings, jsPsych, narration),
    on_timeline_start() {
      state.startMainTask();
      if (jsPsych.progressBar) {
        jsPsych.progressBar.progress = 0.5;
      }
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
        if (jsPsych.progressBar) {
          jsPsych.progressBar.progress = 1.0;
        }
      },
    });
  }

  await jsPsych.run(timeline);

  return jsPsych;
}
