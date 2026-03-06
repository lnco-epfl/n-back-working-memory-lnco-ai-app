import type { ScreenCalibration } from '@/utils/screenCalibration';

declare global {
  interface Window {
    appContext: LocalContext & {
      screenCalibration?: ScreenCalibration;
    };
    Cypress: boolean;
    database: Database;
    apiErrors: object;
  }
}

export {};
