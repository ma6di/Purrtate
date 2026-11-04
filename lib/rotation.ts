import { addDays, daysBetween } from '@/lib/dates';
import { ENERGY_PRESETS, SWAP_OPTIONS } from '@/lib/presets';
import type { Cat, Energy, Group, Settings, Toy } from '@/types/models';

export type Household = {
  cat: Cat;
  toys: Toy[];
  groups: Group[];
  settings: Settings;
};

export function intervalDays(energy: Energy, override: number | null) {
  return override ?? ENERGY_PRESETS[energy].intervalDays;
}

/**
 * How long a basket rests before its turn comes round again: one swap interval
 * for every other basket in the rotation. Toys count as fully rested at that point.
 */
export function restDaysFor(household: Household) {
  const interval = intervalDays(household.cat.energy, household.settings.rotationIntervalDays);
  const baskets = household.groups.filter((g) =>
    household.toys.some((t) => t.groupId === g.id && t.status !== 'retired')
  ).length;
  return interval * Math.max(1, baskets - 1);
}

export function activeGroup(household: Household) {
  const active = household.toys.find((t) => t.status === 'active');
  return household.groups.find((g) => g.id === active?.groupId) ?? household.groups[0] ?? null;
}

export function toysInGroup(household: Household, groupId: string) {
  return household.toys.filter((t) => t.groupId === groupId && t.status !== 'retired');
}

export function nextGroup(household: Household) {
  const current = activeGroup(household);
  const usable = household.groups.filter((g) =>
    household.toys.some((t) => t.groupId === g.id && t.status !== 'retired')
  );
  if (usable.length < 2) return null;
  const idx = usable.findIndex((g) => g.id === current?.id);
  return usable[(idx + 1) % usable.length];
}

/** When the basket that's out now came out. */
export function outSince(household: Household) {
  return household.settings.lastRotationAt ?? household.cat.createdAt;
}

export type BasketStatus = {
  group: Group | null;
  next: Group | null;
  daysOut: number;
  interval: number;
  /** Days until the swap is due; 0 or less means due now. */
  daysLeft: number;
  due: boolean;
  dueAt: string;
};

export function basketStatus(household: Household, at = new Date()): BasketStatus {
  const { cat, settings } = household;
  const since = outSince(household);
  const interval = intervalDays(cat.energy, settings.rotationIntervalDays);
  const daysOut = Math.max(0, daysBetween(since, at));
  const next = nextGroup(household);
  return {
    group: activeGroup(household),
    next,
    daysOut,
    interval,
    daysLeft: interval - daysOut,
    due: !!next && daysOut >= interval,
    dueAt: addDays(since, interval),
  };
}

/**
 * 0–100. Toys that are out lose freshness the longer the basket stays out.
 * Resting toys regain it until they've rested long enough to feel new.
 */
export function freshnessScore(toy: Toy, household: Household, at = new Date()) {
  if (toy.status === 'retired') return 0;
  const { cat, settings } = household;
  if (toy.status === 'resting') {
    const rested = daysBetween(toy.restStartedAt, at);
    const days = Number.isFinite(rested) ? rested : 0;
    return Math.round(Math.min(100, 35 + (days / restDaysFor(household)) * 65));
  }
  const interval = intervalDays(cat.energy, settings.rotationIntervalDays);
  const daysOut = Math.max(0, daysBetween(outSince(household), at));
  return Math.round(Math.max(15, 100 - (daysOut / interval) * 70));
}

export function freshnessLabel(score: number, status: Toy['status']) {
  if (status === 'retired') return 'Retired';
  if (status === 'resting') {
    if (score >= 85) return 'Feels new';
    if (score >= 60) return 'Napping';
    return 'Resting';
  }
  if (score >= 75) return 'Fresh';
  if (score >= 45) return 'Familiar';
  return 'Needs a rest';
}

export type IntervalSuggestion = { current: number; suggested: number; avgDaysOut: number };

/**
 * After two early swaps in a row at the current interval, suggest a shorter one.
 * One early swap could be a bad day; two is a pattern.
 */
export function earlySwapSuggestion(household: Household): IntervalSuggestion | null {
  const { cat, settings } = household;
  const current = intervalDays(cat.energy, settings.rotationIntervalDays);
  const log = settings.swapLog ?? [];
  const last = log.slice(-2);
  if (last.length < 2) return null;
  // Same-day swaps are more likely a mis-tap than a bored cat, so they don't count.
  if (!last.every((e) => e.interval === current && e.daysOut >= 1 && e.daysOut < current)) return null;
  const dismissed = settings.intervalPromptDismissedAt;
  if (dismissed && last[1].at <= dismissed) return null;

  const avg = (last[0].daysOut + last[1].daysOut) / 2;
  const shorter = SWAP_OPTIONS.filter((d) => d < current);
  if (!shorter.length) return null;
  // Closest option to how long the baskets actually lasted.
  const suggested = shorter.reduce((best, d) => (Math.abs(d - avg) < Math.abs(best - avg) ? d : best));
  return { current, suggested, avgDaysOut: Math.round(avg * 10) / 10 };
}

export function applyRotation(toys: Toy[], fromId: string, toId: string, at: string) {
  return toys.map((toy) => {
    if (toy.status === 'retired') return toy;
    if (toy.groupId === fromId) {
      return { ...toy, status: 'resting' as const, restStartedAt: at };
    }
    if (toy.groupId === toId) {
      return { ...toy, status: 'active' as const, restStartedAt: null };
    }
    return toy;
  });
}

export function balancedGroupId(groups: Group[], toys: Toy[]) {
  if (!groups.length) return '';
  const counts = groups.map((g) => ({
    id: g.id,
    n: toys.filter((t) => t.groupId === g.id && t.status !== 'retired').length,
  }));
  counts.sort((a, b) => a.n - b.n);
  return counts[0].id;
}
