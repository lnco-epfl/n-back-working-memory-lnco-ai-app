import { FC, ReactElement, createContext, useContext } from 'react';

import { hooks, mutations } from '../../config/queryClient';
import Loader from '../common/Loader';

export type GeneralSettingsType = {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  language: 'en' | 'fr';
  skipInstructions: boolean;
  skipPractice: boolean;
  showCountdown: boolean;
  enableNarration: boolean;
};

export type NBackSettingsType = {
  nLevel: 1 | 2 | 3 | 4;
  numberOfTrials: number;
  numberOfPracticeTrials: number;
  numberOfPracticeRepetitionsAllowed: number;
  customSequence: string; // comma-separated numbers, empty = random
  customPracticeSequence: string; // comma-separated numbers for practice, empty = random
  displayDuration: number; // milliseconds
  interStimulusInterval: number; // milliseconds
  responseKey: 'space' | 'mouse' | 'both';
};

export type BreakSettingsType = {
  enableBreaks: boolean;
  breakFrequency: number; // trials between breaks
  breakDuration: number; // seconds
};

export type PhotoDiodeSettings = {
  usePhotoDiode: 'top-left' | 'top-right' | 'customize' | 'off';
  photoDiodeLeft?: string;
  photoDiodeTop?: string;
  photoDiodeHeight?: string;
  photoDiodeWidth?: string;
  testPhotoDiode?: boolean;
};

export type NextStepSettings = {
  linkToNextPage: boolean;
  title: string;
  description: string;
  link: string;
  linkText: string;
};

// mapping between Setting names and their data type
export type AllSettingsType = {
  generalSettings: GeneralSettingsType;
  nBackSettings: NBackSettingsType;
  breakSettings: BreakSettingsType;
  photoDiodeSettings: PhotoDiodeSettings;
  nextStepSettings: NextStepSettings;
};

// default values for the data property of settings by name
const defaultSettingsValues: AllSettingsType = {
  generalSettings: {
    fontSize: 'normal',
    language: 'en',
    skipInstructions: false,
    skipPractice: false,
    showCountdown: true,
    enableNarration: true,
  },
  nBackSettings: {
    nLevel: 2,
    numberOfTrials: 74,
    numberOfPracticeTrials: 24,
    numberOfPracticeRepetitionsAllowed: 1,
    customSequence:
      '4,7,3,7,6,2,6,8,5,8,3,9,3,6,2,8,2,4,7,4,6,3,6,8,5,9,5,2,7,3,7,4,6,8,6,3,9,5,9,2,7,4,7,8,3,6,3,9,4,5,4,7,2,8,2,3,6,4,6,8,5,3,5,7,4,9,4,2,6,8,3,7,5,9',
    customPracticeSequence: '5,2,8,2,6,9,6,3,8,3,7,4,7,2,9,5,9,4,6,4,8,3,8,5',
    displayDuration: 500,
    interStimulusInterval: 2000,
    responseKey: 'space',
  },
  breakSettings: {
    enableBreaks: true,
    breakFrequency: 25,
    breakDuration: 30,
  },
  photoDiodeSettings: {
    usePhotoDiode: 'off',
  },
  nextStepSettings: {
    linkToNextPage: false,
    title: '',
    description: '',
    link: '',
    linkText: '',
  },
};

// list of the settings names
const ALL_SETTING_NAMES = [
  'generalSettings',
  'nBackSettings',
  'breakSettings',
  'photoDiodeSettings',
  'nextStepSettings',
] as const;

// automatically generated types
type AllSettingsNameType = (typeof ALL_SETTING_NAMES)[number];
type AllSettingsDataType = AllSettingsType[keyof AllSettingsType];

export type SettingsContextType = AllSettingsType & {
  saveSettings: (
    name: AllSettingsNameType,
    newValue: AllSettingsDataType,
  ) => void;
};

const defaultContextValue = {
  ...defaultSettingsValues,
  saveSettings: () => null,
};

const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

type Prop = {
  children: ReactElement | ReactElement[];
};

export const SettingsProvider: FC<Prop> = ({ children }) => {
  const { mutate: postAppSetting } = mutations.usePostAppSetting();
  const { mutate: patchAppSetting } = mutations.usePatchAppSetting();
  const {
    data: appSettingsList,
    isLoading,
    isSuccess,
  } = hooks.useAppSettings();

  const saveSettings = (
    name: AllSettingsNameType,
    newValue: AllSettingsDataType,
  ): void => {
    if (appSettingsList) {
      const previousSetting = appSettingsList.find((s) => s.name === name);
      // setting does not exist
      if (!previousSetting) {
        postAppSetting({
          data: newValue,
          name,
        });
      } else {
        patchAppSetting({
          id: previousSetting.id,
          data: newValue,
        });
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const getContextValue = (): SettingsContextType => {
    if (isSuccess) {
      const allSettings: AllSettingsType = ALL_SETTING_NAMES.reduce(
        <T extends AllSettingsNameType>(acc: AllSettingsType, key: T) => {
          const setting = appSettingsList.find((s) => s.name === key);
          if (setting) {
            const settingData = setting.data as Partial<AllSettingsType[T]>;
            // Merge persisted data with defaults to keep backward compatibility
            // when newly added fields are absent in older saved settings.
            acc[key] = {
              ...defaultSettingsValues[key],
              ...settingData,
            } as AllSettingsType[T];
          } else {
            acc[key] = defaultSettingsValues[key];
          }
          return acc;
        },
        { ...defaultSettingsValues },
      );
      return {
        ...allSettings,
        saveSettings,
      };
    }
    return defaultContextValue;
  };

  const contextValue = getContextValue();

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType =>
  useContext<SettingsContextType>(SettingsContext);
