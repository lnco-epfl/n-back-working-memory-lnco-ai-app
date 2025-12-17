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

export default i18n;
