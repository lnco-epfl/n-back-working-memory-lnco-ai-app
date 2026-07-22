// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Timeline = any[];

export type Trial = {
  type?: unknown;
} & Record<string, unknown>;

// Narrow interface covering only what timeline builders need from AudioNarration,
// so narration can be disabled by swapping in a no-op implementation.
export type NarrationPlayer = {
  play: (src: string) => void;
  stop: () => void;
};
