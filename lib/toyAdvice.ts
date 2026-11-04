import { daysBetween } from '@/lib/dates';
import { ENERGY_PRESETS, PLAY_ROLES, roleOf } from '@/lib/presets';
import type { Household } from '@/lib/rotation';
import type { PlayRole, ToyKind } from '@/types/models';

export type BasketMix = {
  have: PlayRole[];
  missing: PlayRole[];
  hasLaserOnly: boolean;
};

/** Which of the three hunt roles a basket covers. */
export function basketMix(kinds: ToyKind[]): BasketMix {
  const have = PLAY_ROLES.map((r) => r.role).filter((role) => kinds.some((k) => roleOf(k) === role));
  const missing = PLAY_ROLES.map((r) => r.role).filter((r) => !have.includes(r));
  const stalkers = kinds.filter((k) => roleOf(k) === 'stalk');
  return {
    have,
    missing,
    hasLaserOnly: stalkers.length > 0 && stalkers.every((k) => k === 'laser'),
  };
}

export function mixHint(name: string, mix: BasketMix, count: number): string | null {
  if (count === 0) return null;
  if (mix.missing.length === 0) {
    return mix.hasLaserOnly ? 'Good mix. End laser chases on a toy they can catch.' : 'Good mix: the whole hunt is in here.';
  }
  const role = PLAY_ROLES.find((r) => r.role === mix.missing[0])!;
  return `${name} has no ${role.label.toLowerCase()} toy yet. Try a ${role.example}.`;
}

export type ToySuggestion = {
  id: string;
  kind: 'add' | 'buy' | 'refresh' | 'safety';
  title: string;
  body: string;
};

export const MIN_PER_BASKET = 2;

export type BasketIssue = {
  id: string;
  kind: 'thin' | 'missing';
  text: string;
  /** A toy in another basket that could move here instead of buying one. */
  move?: { toyId: string; toyName: string; fromName: string };
};

/** Problems with one basket, each with a concrete fix. */
export function basketIssues(household: Household, groupId: string): BasketIssue[] {
  const { groups, toys } = household;
  const group = groups.find((g) => g.id === groupId);
  if (!group) return [];
  const live = toys.filter((t) => t.status !== 'retired');
  const mine = live.filter((t) => t.groupId === groupId);
  const issues: BasketIssue[] = [];

  if (mine.length < MIN_PER_BASKET) {
    const need = MIN_PER_BASKET - mine.length;
    issues.push({
      id: 'thin',
      kind: 'thin',
      text:
        mine.length === 0
          ? `${group.name} is empty, so the rotation skips it. Add at least ${MIN_PER_BASKET} toys.`
          : `Only ${mine.length} toy here. Add ${need} more so this basket feels like a real change.`,
    });
  }

  if (mine.length) {
    for (const role of basketMix(mine.map((t) => t.kind)).missing) {
      const meta = PLAY_ROLES.find((r) => r.role === role)!;
      // Spare = a basket that has 2+ of this role, so moving one leaves it covered.
      const spare = groups
        .filter((g) => g.id !== groupId)
        .map((g) => live.filter((t) => t.groupId === g.id && roleOf(t.kind) === role))
        .find((list) => list.length >= 2)?.[0];
      issues.push({
        id: `missing-${role}`,
        kind: 'missing',
        text: spare
          ? `No ${meta.label.toLowerCase()} toy. Move ${spare.name} here, or add a ${meta.example}.`
          : `No ${meta.label.toLowerCase()} toy. Worth getting a ${meta.example}.`,
        move: spare
          ? {
              toyId: spare.id,
              toyName: spare.name,
              fromName: groups.find((g) => g.id === spare.groupId)?.name ?? '',
            }
          : undefined,
      });
    }
  }
  return issues;
}

export function anyBasketIssues(household: Household) {
  return household.groups.some((g) => basketIssues(household, g.id).length > 0);
}

export type NewToyNudge = { due: boolean; daysSince: number; every: number };

/**
 * Rotation slows habituation but doesn't stop it, so suggest a genuinely new toy
 * every few weeks. Counts from the newest toy added, and respects "Not now".
 */
export function newToyNudge(household: Household, at = new Date()): NewToyNudge {
  const { cat, toys, settings } = household;
  const every = ENERGY_PRESETS[cat.energy].newToyDays;
  const newest = toys.reduce<string | null>(
    (latest, t) => (!latest || t.createdAt > latest ? t.createdAt : latest),
    null
  );
  const daysSince = daysBetween(newest ?? cat.createdAt, at);
  const snoozed = !!settings.newToySnoozedUntil && new Date(settings.newToySnoozedUntil) > at;
  return { due: !snoozed && daysSince >= every, daysSince, every };
}

/**
 * Collection-wide advice. Basket-level problems are shown on each basket instead.
 */
export function toySuggestions(household: Household, at = new Date()): ToySuggestion[] {
  const { cat, groups, toys } = household;
  const live = toys.filter((t) => t.status !== 'retired');
  const out: ToySuggestion[] = [];

  if (!live.length) {
    out.push({
      id: 'empty',
      kind: 'add',
      title: 'Add the toys you have',
      body: `Start with what’s already in the house, around ${MIN_PER_BASKET * groups.length} toys. Even forgotten ones under the sofa feel new after a rest.`,
    });
    return out;
  }

  const mix = basketMix(live.map((t) => t.kind));
  if (mix.missing.includes('chase')) {
    out.push({
      id: 'no-chase',
      kind: 'buy',
      title: 'Worth buying: a feather wand',
      body: `Cats play longest when a person moves a feather wand. ${cat.name} has nothing to chase through the air yet.`,
    });
  }
  if (mix.missing.includes('stalk')) {
    out.push({
      id: 'no-stalk',
      kind: 'buy',
      title: 'Worth buying: small mice or balls',
      body: 'Small, fast floor prey is what most cats stalk. They’re cheap, and a pack gives every basket one.',
    });
  }
  if (mix.missing.includes('grab')) {
    out.push({
      id: 'no-grab',
      kind: 'buy',
      title: 'Worth buying: a kicker or food puzzle',
      body: 'A kicker is the end of the hunt (grab and bunny-kick). A food puzzle turns meals into foraging. Both work on days you can’t play.',
    });
  }
  if (mix.hasLaserOnly) {
    out.push({
      id: 'laser',
      kind: 'safety',
      title: 'Give the laser a catch',
      body: 'Laser-only chasing is linked to fixation on lights. End each laser session on a toy they can grab.',
    });
  }

  const recentRetired = toys
    .filter((t) => t.status === 'retired' && t.retiredAt && daysBetween(t.retiredAt, at) <= 30)
    .sort((a, b) => (a.retiredAt! < b.retiredAt! ? 1 : -1));
  for (const r of recentRetired.slice(0, 1)) {
    const role = roleOf(r.kind);
    const left = live.filter((t) => roleOf(t.kind) === role).length;
    if (left < groups.length) {
      const label = PLAY_ROLES.find((p) => p.role === role)!.label.toLowerCase();
      out.push({
        id: `replace-${r.id}`,
        kind: 'buy',
        title: `Replace ${r.name}`,
        body: `You’re down to ${left} ${label} toy${left === 1 ? '' : 's'} for ${groups.length} baskets. Pick a new texture or sound, so it’s actually new.`,
      });
    }
  }

  return out;
}
