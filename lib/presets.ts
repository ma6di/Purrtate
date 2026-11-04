import type { Energy, PlayRole, ToyKind } from '@/types/models';

/**
 * Starting points only. No study gives day counts for toy rotation: habituation research
 * works in minutes and hours. The order (kittens swap most often) follows the finding that
 * young cats play more. Owners can override the interval in Settings.
 */
export const ENERGY_PRESETS: Record<
  Energy,
  {
    label: string;
    blurb: string;
    /** Suggested days a basket stays out. */
    intervalDays: number;
    /** Suggest a brand-new toy this often. */
    newToyDays: number;
  }
> = {
  kitten: {
    label: 'Kitten',
    blurb: 'Plays the most. Suggested start: swap every 2 days.',
    intervalDays: 2,
    newToyDays: 21,
  },
  high: {
    label: 'Zoomies',
    blurb: 'Bored quickly. Suggested start: swap every 3 days.',
    intervalDays: 3,
    newToyDays: 28,
  },
  adult: {
    label: 'Adult',
    blurb: 'Suggested start: swap once a week.',
    intervalDays: 7,
    newToyDays: 42,
  },
  senior: {
    label: 'Senior',
    blurb: 'Plays less. Suggested start: swap every 2 weeks.',
    intervalDays: 14,
    newToyDays: 56,
  },
};

/** Choices for "Swap every" in Settings. */
export const SWAP_OPTIONS = [2, 3, 5, 7, 10, 14] as const;

export const TOY_KINDS: { kind: ToyKind; label: string; hint: string; role: PlayRole }[] = [
  { kind: 'wand', label: 'Wand', hint: 'Interactive hunt', role: 'chase' },
  { kind: 'feather', label: 'Feather', hint: 'Air prey', role: 'chase' },
  { kind: 'mouse', label: 'Mouse', hint: 'Solo stalk', role: 'stalk' },
  { kind: 'ball', label: 'Ball', hint: 'Chase & bat', role: 'stalk' },
  { kind: 'laser', label: 'Light', hint: 'Short chase', role: 'stalk' },
  { kind: 'plush', label: 'Plush', hint: 'Kick & bunny', role: 'grab' },
  { kind: 'puzzle', label: 'Puzzle', hint: 'Forage & think', role: 'grab' },
  { kind: 'tunnel', label: 'Tunnel', hint: 'Ambush run', role: 'grab' },
  { kind: 'crinkle', label: 'Crinkle', hint: 'Sound play', role: 'grab' },
];

export function roleOf(kind: ToyKind): PlayRole {
  return TOY_KINDS.find((k) => k.kind === kind)?.role ?? 'grab';
}

/** Three slots every basket should fill, so each rotation offers the whole hunt. */
export const PLAY_ROLES: { role: PlayRole; label: string; blurb: string; example: string }[] = [
  {
    role: 'chase',
    label: 'Chase',
    blurb: 'Flies or flutters. Best when you move it.',
    example: 'feather wand',
  },
  {
    role: 'stalk',
    label: 'Stalk',
    blurb: 'Small and scurrying on the floor.',
    example: 'mouse or ball',
  },
  {
    role: 'grab',
    label: 'Grab',
    blurb: 'Something to kick, forage or ambush.',
    example: 'kicker, puzzle or tunnel',
  },
];

/** Swatches for telling similar toys apart. Optional. */
export const TOY_COLORS: { id: string; hex: string; label: string }[] = [
  { id: 'red', hex: '#D4654A', label: 'Red' },
  { id: 'orange', hex: '#E08A3C', label: 'Orange' },
  { id: 'yellow', hex: '#E2B542', label: 'Yellow' },
  { id: 'green', hex: '#6B8F71', label: 'Green' },
  { id: 'blue', hex: '#4F7CC4', label: 'Blue' },
  { id: 'purple', hex: '#8A6BB8', label: 'Purple' },
  { id: 'pink', hex: '#E59AAE', label: 'Pink' },
  { id: 'grey', hex: '#9A9088', label: 'Grey' },
  { id: 'brown', hex: '#8A5A3C', label: 'Brown' },
  { id: 'white', hex: '#F4EEE6', label: 'White' },
];

export type DraftToy = { key: string; name: string; kind: ToyKind; color?: string };
export type DraftBasket = { key: string; name: string; toys: DraftToy[] };

/** Nine toys, one of each role per basket. */
export const STARTER_BASKETS: { name: string; toys: { name: string; kind: ToyKind }[] }[] = [
  {
    name: 'Basket A',
    toys: [
      { name: 'Feather wand', kind: 'wand' },
      { name: 'Fur mouse', kind: 'mouse' },
      { name: 'Kick fish', kind: 'plush' },
    ],
  },
  {
    name: 'Basket B',
    toys: [
      { name: 'Bird on a string', kind: 'feather' },
      { name: 'Jingle ball', kind: 'ball' },
      { name: 'Treat puzzle', kind: 'puzzle' },
    ],
  },
  {
    name: 'Basket C',
    toys: [
      { name: 'Ribbon wand', kind: 'wand' },
      { name: 'Crinkle mouse', kind: 'mouse' },
      { name: 'Crinkle tunnel', kind: 'tunnel' },
    ],
  },
];

export const STARTER_TOYS: { name: string; kind: ToyKind }[] = STARTER_BASKETS.flatMap((b) => b.toys);

/** Shown on the basket setup step. Sources in docs/toy-rotation-research.md. */
export const BASKET_TIPS: { id: string; title: string; body: string }[] = [
  {
    id: 'baskets',
    title: 'Why three baskets',
    body: 'Cats lose interest in the same toy fast, then perk up when something changes. Keep one basket out and let the other two rest, so each swap feels new.',
  },
  {
    id: 'mix',
    title: 'Mix the hunt',
    body: 'Put one chase, one stalk and one grab toy in every basket. Each swap then covers the whole hunt, and you’ll learn whether your cat prefers birds, mice or bugs.',
  },
  {
    id: 'wand',
    title: 'Wands are for together',
    body: 'Cats play longest when a person moves a feather wand. Strings and ribbons go back in a drawer after each play session, because swallowed string is a vet emergency.',
  },
  {
    id: 'colour',
    title: 'Colour helps you, not them',
    body: 'Cats see blues and yellows better than reds. A colour tag is mostly so you can tell the red mouse from the grey one.',
  },
  {
    id: 'laser',
    title: 'Lights need a catch',
    body: 'A laser dot can never be caught. If you use one, end on a toy they can grab.',
  },
];
