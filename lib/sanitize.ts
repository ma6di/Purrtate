/**
 * Input guards. Everything that reaches the store, from a text field or from
 * storage on launch, goes through here so bad data can't crash a screen.
 */
import { ENERGY_PRESETS, SWAP_OPTIONS, TOY_COLORS, TOY_KINDS } from '@/lib/presets';
import type {
  Cat,
  Energy,
  Group,
  Settings,
  SwapLogEntry,
  Toy,
  ToyKind,
  ToyStatus,
} from '@/types/models';

export const MAX_NAME = 40;
export const MAX_NOTES = 500;
const MAX_TOYS = 300;

const KINDS = new Set<string>(TOY_KINDS.map((k) => k.kind));
const COLORS = new Set<string>(TOY_COLORS.map((c) => c.hex));
const ENERGIES = new Set<string>(Object.keys(ENERGY_PRESETS));
const STATUSES = new Set<string>(['active', 'resting', 'retired']);

/** Trim, collapse whitespace, strip control characters, cap length. */
export function cleanName(value: unknown, fallback: string, max = MAX_NAME): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2066-\u2069]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
  return cleaned || fallback;
}

export function cleanNotes(value: unknown): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').slice(0, MAX_NOTES);
}

export function cleanKind(value: unknown): ToyKind {
  return typeof value === 'string' && KINDS.has(value) ? (value as ToyKind) : 'mouse';
}

export function cleanColor(value: unknown): string | undefined {
  return typeof value === 'string' && COLORS.has(value) ? value : undefined;
}

export function cleanEnergy(value: unknown): Energy {
  return typeof value === 'string' && ENERGIES.has(value) ? (value as Energy) : 'adult';
}

export function cleanInterval(value: unknown): number | null {
  return typeof value === 'number' && (SWAP_OPTIONS as readonly number[]).includes(value) ? value : null;
}

/** A real ISO date string, or null. Future dates beyond a day are treated as clock errors. */
export function cleanDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return null;
  if (t > Date.now() + 86_400_000) return new Date().toISOString();
  return new Date(t).toISOString();
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function cleanId(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 && v.length <= 64 ? v : null;
}

export type PersistedState = {
  cats: Cat[];
  groups: Group[];
  toys: Toy[];
  activeCatId: string | null;
  settings: Settings;
};

export const EMPTY_SETTINGS: Settings = {
  onboardingComplete: false,
  rotationIntervalDays: null,
  remindersOn: false,
  lastRotationAt: null,
  newToySnoozedUntil: null,
  swapLog: [],
  intervalPromptDismissedAt: null,
};

function cleanSettings(raw: unknown): Settings {
  if (!isObj(raw)) return { ...EMPTY_SETTINGS };
  const log: SwapLogEntry[] = Array.isArray(raw.swapLog)
    ? raw.swapLog
        .filter(isObj)
        .map((e) => ({
          at: cleanDate(e.at) ?? '',
          daysOut: typeof e.daysOut === 'number' && e.daysOut >= 0 ? Math.min(365, Math.floor(e.daysOut)) : -1,
          interval: typeof e.interval === 'number' ? e.interval : -1,
        }))
        .filter((e) => e.at && e.daysOut >= 0 && e.interval > 0)
        .slice(-6)
    : [];
  return {
    onboardingComplete: raw.onboardingComplete === true,
    rotationIntervalDays: cleanInterval(raw.rotationIntervalDays),
    remindersOn: raw.remindersOn === true,
    lastRotationAt: cleanDate(raw.lastRotationAt),
    newToySnoozedUntil: cleanDate(raw.newToySnoozedUntil),
    swapLog: log,
    intervalPromptDismissedAt: cleanDate(raw.intervalPromptDismissedAt),
  };
}

/**
 * Rebuild state from whatever is in storage. Drops anything malformed or
 * dangling (a toy whose basket is gone), and fields from older versions.
 */
export function sanitizeState(raw: unknown): PersistedState {
  if (!isObj(raw)) return { cats: [], groups: [], toys: [], activeCatId: null, settings: { ...EMPTY_SETTINGS } };
  const now = new Date().toISOString();

  const cats: Cat[] = (Array.isArray(raw.cats) ? raw.cats : [])
    .filter(isObj)
    .map((c) => ({
      id: cleanId(c.id) ?? '',
      name: cleanName(c.name, 'Kitty'),
      energy: cleanEnergy(c.energy),
      createdAt: cleanDate(c.createdAt) ?? now,
    }))
    .filter((c) => c.id)
    // One household, one schedule. Older versions allowed several cats: keep the active one.
    .sort((a, b) => (a.id === raw.activeCatId ? -1 : b.id === raw.activeCatId ? 1 : 0))
    .slice(0, 1);
  const catIds = new Set(cats.map((c) => c.id));

  const groups: Group[] = (Array.isArray(raw.groups) ? raw.groups : [])
    .filter(isObj)
    .map((g) => ({
      id: cleanId(g.id) ?? '',
      catId: cleanId(g.catId) ?? '',
      name: cleanName(g.name, 'Basket'),
    }))
    .filter((g) => g.id && catIds.has(g.catId));
  const groupCat = new Map(groups.map((g) => [g.id, g.catId]));

  const toys: Toy[] = (Array.isArray(raw.toys) ? raw.toys : [])
    .filter(isObj)
    .map((t) => {
      const status: ToyStatus =
        typeof t.status === 'string' && STATUSES.has(t.status) ? (t.status as ToyStatus) : 'resting';
      return {
        id: cleanId(t.id) ?? '',
        catId: cleanId(t.catId) ?? '',
        groupId: cleanId(t.groupId) ?? '',
        name: cleanName(t.name, 'Mystery toy'),
        kind: cleanKind(t.kind),
        color: cleanColor(t.color),
        status,
        notes: cleanNotes(t.notes),
        createdAt: cleanDate(t.createdAt) ?? now,
        restStartedAt: status === 'resting' ? (cleanDate(t.restStartedAt) ?? now) : null,
        retiredAt: status === 'retired' ? (cleanDate(t.retiredAt) ?? now) : null,
      } satisfies Toy;
    })
    .filter((t) => t.id && groupCat.get(t.groupId) === t.catId)
    .slice(0, MAX_TOYS);

  const activeCatId =
    typeof raw.activeCatId === 'string' && catIds.has(raw.activeCatId) ? raw.activeCatId : (cats[0]?.id ?? null);

  const settings = cleanSettings(raw.settings);
  // Setup can't count as finished if there's no cat to show.
  if (!cats.length) settings.onboardingComplete = false;

  return { cats, groups, toys, activeCatId, settings };
}
