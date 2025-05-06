/* eslint-disable no-console */
import { safePromise } from '@secretkeylabs/xverse-core';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enJSON from './en.json';

const resources = {
  en: { translation: enJSON },
};

export async function initI18n() {
  const [error] = await safePromise(
    i18n.use(initReactI18next).init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false,
      },
    }),
  );

  if (error) {
    console.error('Error initializing i18n.');
    console.error(error);
  }
}
