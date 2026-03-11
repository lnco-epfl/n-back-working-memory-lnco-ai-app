import { FC, useEffect, useRef, useState } from 'react';

import { Typography } from '@mui/material';

import { useLocalContext } from '@graasp/apps-query-client';

import { DataCollection, JsPsych } from 'jspsych';

import { GRAASP_APP_KEY } from '@/config/env';
import { hooks } from '@/config/queryClient';
import {
  ScreenCalibration,
  buildGetContextMessage,
  isGetContextSuccessType,
  parseMessageData,
  parseScreenCalibrationFromLocalContext,
  parseScreenCalibrationFromMessagePayload,
} from '@/utils/screenCalibration';

import { TrialData } from '../config/appResults';
import useExperimentResults from '../context/ExperimentContext';
import { AllSettingsType, useSettings } from '../context/SettingsContext';
import { run } from '../experiment/experiment';

export const ExperimentLoader: FC = () => {
  const settings = useSettings();
  const localContext = useLocalContext();
  const { itemId, memberId } = localContext;
  const localContextCalibration =
    parseScreenCalibrationFromLocalContext(localContext);
  const [messageCalibration, setMessageCalibration] = useState<
    ScreenCalibration | undefined
  >();
  const screenCalibration = messageCalibration ?? localContextCalibration;

  useEffect(() => {
    if (!itemId) {
      return undefined;
    }

    const handleMessage = (event: MessageEvent): void => {
      const message = parseMessageData(event.data);
      if (!message || !isGetContextSuccessType(message.type, itemId)) {
        return;
      }

      // eslint-disable-next-line no-console
      console.info(
        '[screenCalibration] Received GET_CONTEXT_SUCCESS payload',
        message,
      );

      const parsedCalibration =
        parseScreenCalibrationFromMessagePayload(message);

      if (parsedCalibration) {
        // eslint-disable-next-line no-console
        console.info(
          '[screenCalibration] Using calibration from GET_CONTEXT_SUCCESS',
          parsedCalibration,
        );
        setMessageCalibration(parsedCalibration);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          '[screenCalibration] GET_CONTEXT_SUCCESS received without valid screenCalibration',
          message,
        );
      }
    };

    window.addEventListener('message', handleMessage);

    const requestContext = (): void => {
      const payload = buildGetContextMessage(
        itemId,
        GRAASP_APP_KEY,
        window.location.origin,
      );

      // eslint-disable-next-line no-console
      console.info('[screenCalibration] Requesting context from parent', {
        itemId,
        origin: window.location.origin,
      });

      window.parent.postMessage(payload, '*');
    };

    requestContext();

    let attempt = 0;
    const maxAttempts = 8;
    const retryId = window.setInterval(() => {
      attempt += 1;
      if (messageCalibration || attempt >= maxAttempts) {
        window.clearInterval(retryId);
        return;
      }
      requestContext();
    }, 250);

    return () => {
      window.clearInterval(retryId);
      window.removeEventListener('message', handleMessage);
    };
  }, [itemId, messageCalibration]);

  useEffect(() => {
    const jspsychDisplayElement = document.getElementById(
      'jspsych-display-element',
    );

    if (!jspsychDisplayElement || !screenCalibration) {
      return;
    }

    if (screenCalibration.fontSize) {
      jspsychDisplayElement.setAttribute(
        'data-font-size',
        screenCalibration.fontSize,
      );
    }

    if (screenCalibration.scale) {
      jspsychDisplayElement.style.setProperty(
        '--nback-calibration-scale',
        String(screenCalibration.scale),
      );
    }

    // eslint-disable-next-line no-console
    console.info('[screenCalibration] Applied late calibration update to DOM', {
      fontSize: jspsychDisplayElement.getAttribute('data-font-size'),
      scale: jspsychDisplayElement.style.getPropertyValue(
        '--nback-calibration-scale',
      ),
    });
  }, [screenCalibration]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info('[screenCalibration] Local context item/member', {
      itemId: localContext.itemId,
      memberId: localContext.memberId,
    });
    // eslint-disable-next-line no-console
    console.info(
      '[screenCalibration] Effective calibration from localContext/message',
      screenCalibration,
    );
  }, [localContext.itemId, localContext.memberId, screenCalibration]);

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
            screenCalibration,
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
            screenCalibration,
          },
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
