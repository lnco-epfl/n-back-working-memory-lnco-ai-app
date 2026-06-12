import { FC, useEffect, useRef, useState } from 'react';

import { Typography } from '@mui/material';

import { useLocalContext } from '@lnco-ai/apps-query-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Marked } from '@ts-stack/markdown';
import { DataCollection, JsPsych } from 'jspsych';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AudioNarration } from 'jspsych-audio-narration';

import { hooks } from '@/config/queryClient';
import { parseScreenCalibrationFromLocalContext } from '@/utils/screenCalibration';

import { TrialData } from '../config/appResults';
import useExperimentResults from '../context/ExperimentContext';
import { AllSettingsType, useSettings } from '../context/SettingsContext';
import { run } from '../experiment/experiment';
import { resolveLink } from '../experiment/utils/utils';

interface ExperimentLoaderProps {
  narration: AudioNarration;
}

export const ExperimentLoader: FC<ExperimentLoaderProps> = ({ narration }) => {
  const settings = useSettings();
  const localContext = useLocalContext();
  const { accountId } = localContext;
  const screenCalibration =
    parseScreenCalibrationFromLocalContext(localContext);
  const { data: appContextData } = hooks.useAppContext();
  let participantName = '';

  if (appContextData?.members) {
    participantName =
      appContextData.members.find((member) => member.id === accountId)?.name ??
      '';
  }
  const jsPsychRef = useRef<null | Promise<JsPsych>>(null);

  const { status, experimentResultsAppData, setExperimentResult } =
    useExperimentResults();

  const isCompleted = (
    trials: TrialData[],
    currentSettings: AllSettingsType,
  ): boolean =>
    // For N-back, check if there's any completed data
    trials.length > 0 &&
    trials.filter((trial) => trial.practice === false).length >=
      currentSettings.nBackSettings.numberOfTrials;
  const updateData = (
    rawData: DataCollection,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    currentSettings: AllSettingsType,
  ): void => {
    const responseArray = rawData.values();
    setExperimentResult({
      rawData: { trials: responseArray },
      settings: currentSettings,
    });
  };

  const assetPath = {
    images: ['assets/images/hand.png'],
    audio: [
      'assets/audio/nback_main_ending.mp3',
      'assets/audio/nback_instructions_intro.mp3',
      'assets/audio/nback_instructions_main.mp3',
      'assets/audio/nback_instructions_practice.mp3',
      'assets/audio/nback_practice_repeat.mp3',
      'assets/audio/nback_practice_comprehension.mp3',
      'assets/audio/nback_practice_complete.mp3',
    ],
    video: [],
    misc: [],
  };

  const [completedContent, setCompletedContent] = useState<JSX.Element | null>(
    null,
  );

  useEffect(() => {
    if (status === 'success' && !experimentResultsAppData) {
      setExperimentResult({
        rawData: { trials: [] },
        settings,
      });
    }
    if (!jsPsychRef.current && experimentResultsAppData?.rawData) {
      if (experimentResultsAppData.rawData?.trials.length === 0) {
        jsPsychRef.current = run({
          assetPaths: assetPath,
          input: {
            settings,
            results: experimentResultsAppData,
            participantName,
            screenCalibration,
          },
          narration,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          updateData: (data, settings) => updateData(data, settings),
        });
      } else if (
        isCompleted(experimentResultsAppData.rawData.trials, settings)
      ) {
        const { nextStepSettings } = settings;
        if (nextStepSettings.linkToNextPage) {
          const { title, description, linkText } = nextStepSettings;
          const href = resolveLink(nextStepSettings.link, participantName);
          setCompletedContent(
            <div style={{ backgroundColor: 'white', padding: '2rem' }}>
              <h2>{title}</h2>
              <p
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: Marked.parse(description) }}
              />
              <a className="link-to-experiment" target="_parent" href={href}>
                {linkText}
              </a>
            </div>,
          );
        } else {
          setCompletedContent(
            <Typography variant="h5" style={{ backgroundColor: 'white' }}>
              You have previously completed this experiment, please reach out to
              the experimenter if this is not correct.
            </Typography>,
          );
        }
      } else {
        // Allow restart for N-back
        jsPsychRef.current = run({
          assetPaths: assetPath,
          input: {
            settings,
            results: experimentResultsAppData,
            participantName,
            screenCalibration,
          },
          narration,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          updateData: (data, settings) => updateData(data, settings),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    experimentResultsAppData,
    screenCalibration,
    setExperimentResult,
    settings,
    status,
  ]);

  if (completedContent) {
    return completedContent;
  }
  return <div id="jspsych-display-element" />;
};
