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
  lastUsedAt: string | null;
  restStartedAt: string | null;
  totalPlayMs: number;
  playCount: number;
};

export type Session = {
  id: string;
  catId: string;
  toyId: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  pounces: number;
  timeToEngageSec: number | null;
};

export type LiveSession = {
  toyId: string;
  startedAt: string;
  pounces: number;
  firstEngageAt: string | null;
};

export type Settings = {
  onboardingComplete: boolean;
  rotationIntervalDays: number | null;
  remindersOn: boolean;
  lastRotationAt: string | null;
};

export type AlertKind = 'rotate' | 'play' | 'reintroduce' | 'retire';

export type RotationAlert = {
  kind: AlertKind;
  title: string;
  body: string;
};
