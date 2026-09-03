import type { Energy, ToyKind } from '@/types/models';

export const ENERGY_PRESETS: Record<
  Energy,
  {
    label: string;
    blurb: string;
    intervalDays: number;
    restDays: number;
    sessionMin: number;
    sessionsPerDay: number;
    unusedDays: number;
  }
> = {
  kitten: {
    label: 'Kitten',
    blurb: 'Tiny hunter. Swap toys every couple of days.',
    intervalDays: 2,
    restDays: 7,
    sessionMin: 12,
    sessionsPerDay: 2,
    unusedDays: 2,
  },
  high: {
    label: 'Zoomies',
    blurb: 'High energy. Keep novelty coming every few days.',
    intervalDays: 3,
    restDays: 7,
    sessionMin: 15,
    sessionsPerDay: 2,
    unusedDays: 3,
  },
  adult: {
    label: 'Adult',
    blurb: 'A weekly basket swap keeps play feeling new.',
    intervalDays: 7,
    restDays: 21,
    sessionMin: 12,
    sessionsPerDay: 2,
    unusedDays: 7,
  },
  senior: {
    label: 'Senior',
    blurb: 'Gentle pace. Rotate weekly or every other week.',
    intervalDays: 14,
    restDays: 28,
    sessionMin: 8,
    sessionsPerDay: 2,
    unusedDays: 10,
  },
};

export const TOY_KINDS: { kind: ToyKind; label: string; hint: string }[] = [
  { kind: 'wand', label: 'Wand', hint: 'Interactive hunt' },
  { kind: 'feather', label: 'Feather', hint: 'Air prey' },
  { kind: 'mouse', label: 'Mouse', hint: 'Solo stalk' },
  { kind: 'ball', label: 'Ball', hint: 'Chase & bat' },
  { kind: 'puzzle', label: 'Puzzle', hint: 'Forage & think' },
  { kind: 'plush', label: 'Plush', hint: 'Kick & bunny' },
  { kind: 'tunnel', label: 'Tunnel', hint: 'Ambush run' },
  { kind: 'crinkle', label: 'Crinkle', hint: 'Sound play' },
  { kind: 'laser', label: 'Light', hint: 'Short chase' },
];

export const STARTER_TOYS: { name: string; kind: ToyKind }[] = [
  { name: 'Feather wand', kind: 'wand' },
  { name: 'Crinkle mouse', kind: 'mouse' },
  { name: 'Yarn ball', kind: 'ball' },
  { name: 'Treat puzzle', kind: 'puzzle' },
  { name: 'Kick fish', kind: 'plush' },
  { name: 'Dash tunnel', kind: 'tunnel' },
];
