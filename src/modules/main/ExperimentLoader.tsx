import { FC, useEffect, useRef, useState } from 'react';

import { Typography } from '@mui/material';

import { useLocalContext } from '@graasp/apps-query-client';

import { DataCollection, JsPsych } from 'jspsych';

import { hooks } from '@/config/queryClient';

import { TrialData } from '../config/appResults';
import useExperimentResults from '../context/ExperimentContext';
import { AllSettingsType, useSettings } from '../context/SettingsContext';
import { run } from '../experiment/experiment';

export const ExperimentLoader: FC = () => {
  const settings = useSettings();
  const { memberId } = useLocalContext();
  const { data: appContextData } = hooks.useAppContext();
  let participantName = '';

  if (appContextData?.members) {
    participantName =
      appContextData.members.find((member) => member.id === memberId)?.name ??
      '';
  }
  const jsPsychRef = useRef<null | Promise<JsPsych>>(null);

  const { status, experimentResultsAppData, setExperimentResult } =
    useExperimentResults();

  const isCompleted = (
    trials: TrialData[],
    // eslint-disable-next-line @typescript-eslint/no-shadow
    _settings: AllSettingsType,
  ): boolean =>
    // For N-back, check if there's any completed data
    trials.length > 0 && trials.some((trial) => trial.correct !== undefined);
  const updateData = (
    rawData: DataCollection,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    settings: AllSettingsType,
  ): void => {
    const responseArray = rawData.values();
    setExperimentResult({
      rawData: { trials: responseArray },
      settings,
    });
  };

  const assetPath = {
    images: [],
    audio: [],
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
          },
          // eslint-disable-next-line @typescript-eslint/no-shadow
          updateData: (data, settings) => updateData(data, settings),
        });
      } else if (
        isCompleted(experimentResultsAppData.rawData.trials, settings)
      ) {
        setCompletedContent(
          <Typography variant="h5" style={{ backgroundColor: 'white' }}>
            You have previously completed this experiment, please reach out to
            the experimenter if this is not correct.
          </Typography>,
        );
      } else {
        // Allow restart for N-back
        jsPsychRef.current = run({
          assetPaths: assetPath,
          input: {
            settings,
            results: experimentResultsAppData,
            participantName,
          },
          // eslint-disable-next-line @typescript-eslint/no-shadow
          updateData: (data, settings) => updateData(data, settings),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentResultsAppData, setExperimentResult, settings, status]);

  if (completedContent) {
    return completedContent;
  }
  return <div id="jspsych-display-element" />;
};
