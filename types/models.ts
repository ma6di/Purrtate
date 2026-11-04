export type Energy = 'kitten' | 'high' | 'adult' | 'senior';

export type ToyKind =
  | 'wand'
  | 'ball'
  | 'mouse'
  | 'puzzle'
  | 'feather'
  | 'tunnel'
  | 'crinkle'
  | 'laser'
  | 'plush';

/** What part of the hunt a toy feeds. A good basket has one of each. */
export type PlayRole = 'chase' | 'stalk' | 'grab';

export type ToyStatus = 'active' | 'resting' | 'retired';

export type Cat = {
  id: string;
  name: string;
  energy: Energy;
  createdAt: string;
};

export type Group = {
  id: string;
  catId: string;
  name: string;
};

export type Toy = {
  id: string;
  catId: string;
  groupId: string;
  name: string;
  kind: ToyKind;
  /** Optional swatch so owners can tell "red mouse" from "grey mouse". */
  color?: string;
  status: ToyStatus;
  notes: string;
  createdAt: string;
  restStartedAt: string | null;
  retiredAt?: string | null;
};

export type Settings = {
  onboardingComplete: boolean;
  rotationIntervalDays: number | null;
  remindersOn: boolean;
  lastRotationAt: string | null;
  /** "New toy" nudge hidden until this date. */
  newToySnoozedUntil?: string | null;
  /** Recent swaps, newest last, to spot a pattern of swapping early. */
  swapLog?: SwapLogEntry[];
  /** "Swap sooner?" suggestion hidden until a new early swap after this time. */
  intervalPromptDismissedAt?: string | null;
};

export type SwapLogEntry = { at: string; daysOut: number; interval: number };
