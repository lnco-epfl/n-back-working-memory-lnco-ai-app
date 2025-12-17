import { JsPsych } from 'jspsych';

/**
 * Change progress bar text and width
 */
export const changeProgressBar = (
  text: string,
  progress: number,
  jsPsych: JsPsych,
): void => {
  const textElement = jsPsych
    .getDisplayElement()
    .querySelector('.progress-bar-text') as HTMLElement;
  const progressElement = jsPsych
    .getDisplayElement()
    .querySelector('.progress-bar-fill') as HTMLElement;
  if (textElement) {
    textElement.innerText = text;
  }
  if (progressElement) {
    progressElement.style.width = `${progress * 100}%`;
  }
};

/**
 * Resolve link with participant name
 */
export const resolveLink = (link: string, participantName: string): string =>
  link.replace(/\{participantName\}/g, participantName);
