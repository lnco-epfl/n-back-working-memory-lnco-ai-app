import i18n from 'i18next';

import enTranslation from '../../../langs/en.json';
import frTranslation from '../../../langs/fr.json';

/**
 * @function getQueryParam
 * @description Retrieves the value of a specified query parameter from the URL. Current options are ?lang=en and ?lang=fr
 *
 * @param {string} param - The name of the query parameter to retrieve.
 * @returns {string | null} - The value of the query parameter, or null if not found.
 */
export const getQueryParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Initialize i18next
const language = getQueryParam('lang') || 'en'; // Default to 'en' if not specified

i18n.init({
  resources: {
    en: {
      translation: enTranslation.translations,
    },
    fr: {
      translation: frTranslation.translations,
    },
  },
  lng: language, // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export const NARRATION_BASE_NAMES = [
  'nback_instructions_intro',
  'nback_instructions_practice',
  'nback_instructions_main',
  'nback_main_ending',
  'nback_practice_repeat',
  'nback_practice_complete',
  'nback_practice_comprehension',
] as const;

export type NarrationBaseName = (typeof NARRATION_BASE_NAMES)[number];

/**
 * Builds the narration audio path for the currently active language.
 */
export const getNarrationSrc = (baseName: NarrationBaseName): string =>
  `assets/audio/${baseName}-${i18n.language}.mp3`;

/**
 * All narration audio paths, in every supported language, for preloading
 * ahead of the language being applied from settings.
 */
export const getNarrationPreloadPaths = (): string[] =>
  NARRATION_BASE_NAMES.flatMap((baseName) => [
    `assets/audio/${baseName}-en.mp3`,
    `assets/audio/${baseName}-fr.mp3`,
  ]);

export default i18n;
