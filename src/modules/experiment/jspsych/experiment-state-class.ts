import {
  AllSettingsType,
  BreakSettingsType,
  GeneralSettingsType,
  NBackSettingsType,
  NextStepSettings,
  PhotoDiodeSettings,
} from '@/modules/context/SettingsContext';

/**
 * Generates a random N-back sequence with specified parameters
 * @param length - Total number of trials
 * @param nLevel - N-back level (1, 2, 3, or 4)
 * @param targetPercentage - Percentage of target trials (default 33%)
 * @returns Array of single-digit numbers
 */
export function generateNBackSequence(
  length: number,
  nLevel: number,
  targetPercentage: number = 33,
): number[] {
  const sequence: number[] = [];
  const targetCount = Math.max(
    1,
    Math.floor((length * targetPercentage) / 100),
  ); // Ensure at least 1 target
  const targetPositions = new Set<number>();

  // Ensure at least one target position for this n-level (must be >= nLevel)
  const minTargetPos = nLevel;
  const maxTargetPos = length - 1;

  // First, ensure we have at least one match at a valid position
  if (minTargetPos <= maxTargetPos) {
    const firstTargetPos =
      minTargetPos +
      Math.floor(Math.random() * (maxTargetPos - minTargetPos + 1));
    targetPositions.add(firstTargetPos);
  }

  // Select additional random positions for targets if needed
  while (
    targetPositions.size < targetCount &&
    targetPositions.size < length - nLevel
  ) {
    const pos = Math.floor(Math.random() * (length - nLevel)) + nLevel;
    targetPositions.add(pos);
  }

  // Generate sequence
  for (let i = 0; i < length; i += 1) {
    if (targetPositions.has(i)) {
      // This should be a target - match the n-back position
      sequence[i] = sequence[i - nLevel];
    } else {
      // Non-target - ensure it doesn't match n-back position
      let num: number;
      do {
        num = Math.floor(Math.random() * 10); // 0-9
      } while (
        (i >= nLevel && num === sequence[i - nLevel]) || // Avoid n-back match
        (i >= 1 && num === sequence[i - 1]) // Avoid immediate repeats
      );
      sequence[i] = num;
    }
  }

  return sequence;
}

/**
 * Parses a custom sequence string into an array of numbers
 * @param sequenceString - Comma-separated numbers
 * @returns Array of numbers or null if invalid
 */
export function parseCustomSequence(sequenceString: string): number[] | null {
  if (!sequenceString || sequenceString.trim() === '') {
    return null;
  }

  const numbers = sequenceString
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => parseInt(s, 10));

  // Validate all are single digits
  // eslint-disable-next-line no-restricted-globals
  if (numbers.some((n) => isNaN(n) || n < 0 || n > 9)) {
    return null;
  }

  return numbers;
}

/**
 * Determines if a trial should be a target based on n-back logic
 * @param sequence - The full stimulus sequence
 * @param currentIndex - Current trial index
 * @param nLevel - N-back level
 * @returns true if current stimulus matches n-back position
 */
export function isTargetTrial(
  sequence: number[],
  currentIndex: number,
  nLevel: number,
): boolean {
  if (currentIndex < nLevel) {
    return false; // First N trials can never be targets
  }
  return sequence[currentIndex] === sequence[currentIndex - nLevel];
}

interface State {
  sequence: number[];
  currentTrialIndex: number;
  practiceMode: boolean;
  practiceResponses: boolean[]; // Track correct/incorrect for practice feedback
  practiceTargetCount: number; // How many target trials (should-respond)
  practiceHitCount: number; // Responded correctly on target
  practiceFalsePositiveCount: number; // Responded when no target
}

export class ExperimentState {
  private state: State;

  private generalSettings: GeneralSettingsType;

  private nBackSettings: NBackSettingsType;

  private breakSettings: BreakSettingsType;

  private photoDiodeSettings: PhotoDiodeSettings;

  private nextStepSettings: NextStepSettings;

  constructor(settings: AllSettingsType) {
    this.generalSettings = settings.generalSettings;
    this.nBackSettings = settings.nBackSettings;
    this.breakSettings = settings.breakSettings;
    this.photoDiodeSettings = settings.photoDiodeSettings;
    this.nextStepSettings = settings.nextStepSettings;

    // Initialize with empty state - will be set when experiment starts
    this.state = {
      sequence: [],
      currentTrialIndex: 0,
      practiceMode: false,
      practiceResponses: [],
      practiceTargetCount: 0,
      practiceHitCount: 0,
      practiceFalsePositiveCount: 0,
    };
  }

  // Getters for settings
  getGeneralSettings(): GeneralSettingsType {
    return this.generalSettings;
  }

  getNBackSettings(): NBackSettingsType {
    return this.nBackSettings;
  }

  getBreakSettings(): BreakSettingsType {
    return this.breakSettings;
  }

  getPhotoDiodeSettings(): PhotoDiodeSettings {
    return this.photoDiodeSettings;
  }

  getNextStepSettings(): NextStepSettings {
    return this.nextStepSettings;
  }

  getAllSettings(): AllSettingsType {
    return {
      generalSettings: this.generalSettings,
      nBackSettings: this.nBackSettings,
      breakSettings: this.breakSettings,
      photoDiodeSettings: this.photoDiodeSettings,
      nextStepSettings: this.nextStepSettings,
    };
  }

  // Sequence management
  initializePracticeSequence(): void {
    const customSeq = parseCustomSequence(
      this.nBackSettings.customPracticeSequence,
    );
    if (
      customSeq &&
      customSeq.length >= this.nBackSettings.numberOfPracticeTrials
    ) {
      // Use first N trials from custom practice sequence
      this.state.sequence = customSeq.slice(
        0,
        this.nBackSettings.numberOfPracticeTrials,
      );
    } else {
      // Generate random practice sequence
      this.state.sequence = generateNBackSequence(
        this.nBackSettings.numberOfPracticeTrials,
        this.nBackSettings.nLevel,
      );
    }
    this.state.currentTrialIndex = 0;
    this.state.practiceMode = true;
    this.state.practiceResponses = [];
    this.state.practiceTargetCount = 0;
    this.state.practiceHitCount = 0;
    this.state.practiceFalsePositiveCount = 0;
  }

  initializeMainSequence(): void {
    const customSeq = parseCustomSequence(this.nBackSettings.customSequence);
    if (customSeq && customSeq.length >= this.nBackSettings.numberOfTrials) {
      // Use custom sequence
      this.state.sequence = customSeq.slice(
        0,
        this.nBackSettings.numberOfTrials,
      );
    } else {
      // Generate random sequence
      this.state.sequence = generateNBackSequence(
        this.nBackSettings.numberOfTrials,
        this.nBackSettings.nLevel,
      );
    }
    this.state.currentTrialIndex = 0;
  }

  startMainTask(): void {
    this.state.practiceMode = false;
    this.state.currentTrialIndex = 0;
  }

  getSequence(): number[] {
    return this.state.sequence;
  }

  getCurrentStimulus(): number {
    return this.state.sequence[this.state.currentTrialIndex];
  }

  getCurrentTrialIndex(): number {
    return this.state.currentTrialIndex;
  }

  incrementTrial(): void {
    this.state.currentTrialIndex += 1;
  }

  isCurrentTrialTarget(): boolean {
    return isTargetTrial(
      this.state.sequence,
      this.state.currentTrialIndex,
      this.nBackSettings.nLevel,
    );
  }

  // Practice management
  isPracticeMode(): boolean {
    return this.state.practiceMode;
  }

  recordPracticeResponse(
    correct: boolean,
    responded: boolean,
    shouldRespond: boolean,
  ): void {
    if (!this.state.practiceMode) {
      return;
    }

    this.state.practiceResponses.push(correct);

    if (shouldRespond) {
      this.state.practiceTargetCount += 1;
      if (responded) {
        this.state.practiceHitCount += 1;
      }
    } else if (responded) {
      this.state.practiceFalsePositiveCount += 1;
    }
  }

  getPracticeAccuracy(): number {
    if (this.state.practiceResponses.length === 0) {
      return 0;
    }
    const correct = this.state.practiceResponses.filter((r) => r).length;
    return (correct / this.state.practiceResponses.length) * 100;
  }

  getPracticeCorrectCount(): number {
    return this.state.practiceResponses.filter((r) => r).length;
  }

  getPracticeTotalCount(): number {
    return this.state.practiceResponses.length;
  }

  getPracticeHitCount(): number {
    return this.state.practiceHitCount;
  }

  getPracticeTargetCount(): number {
    return this.state.practiceTargetCount;
  }

  getPracticeFalsePositiveCount(): number {
    return this.state.practiceFalsePositiveCount;
  }

  // Break management
  shouldShowBreak(): boolean {
    if (!this.breakSettings.enableBreaks || this.state.practiceMode) {
      return false;
    }

    const trialsSinceStart = this.state.currentTrialIndex;
    return (
      trialsSinceStart > 0 &&
      trialsSinceStart % this.breakSettings.breakFrequency === 0 &&
      trialsSinceStart < this.state.sequence.length
    );
  }

  getBreakDuration(): number {
    return this.breakSettings.breakDuration;
  }

  // Check if experiment is complete
  isComplete(): boolean {
    return this.state.currentTrialIndex >= this.state.sequence.length;
  }

  getTotalTrials(): number {
    return this.state.sequence.length;
  }

  getRemainingTrials(): number {
    return this.state.sequence.length - this.state.currentTrialIndex;
  }
}
