import { daysBetween } from '@/lib/dates';
import { PLAY_ROLES, roleOf } from '@/lib/presets';
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

const MIN_PER_BASKET = 2;

/**
 * Should the owner add or buy toys? Rules, most urgent first:
 * thin baskets, missing hunt roles, laser as the only chaser,
 * retired toys not replaced, and a collection that has gone flat even after rest.
 */
export function toySuggestions(household: Household, at = new Date()): ToySuggestion[] {
  const { cat, groups, toys, sessions } = household;
  const live = toys.filter((t) => t.status !== 'retired');
  const out: ToySuggestion[] = [];

  const thin = groups.filter((g) => live.filter((t) => t.groupId === g.id).length < MIN_PER_BASKET);
  if (thin.length) {
    const need = thin.reduce(
      (n, g) => n + MIN_PER_BASKET - live.filter((t) => t.groupId === g.id).length,
      0
    );
    out.push({
      id: 'thin',
      kind: 'add',
      title: thin.length === groups.length ? 'Fill the baskets' : `${thin.map((g) => g.name).join(' & ')} ${thin.length > 1 ? 'are' : 'is'} thin`,
      body: `Rotation works best with at least ${MIN_PER_BASKET} toys per basket. Add ${need} more. Toys lost under the sofa count.`,
    });
  }

  const mix = basketMix(live.map((t) => t.kind));
  if (live.length && mix.missing.includes('chase')) {
    out.push({
      id: 'no-chase',
      kind: 'buy',
      title: 'Worth buying: a feather wand',
      body: `Cats spend the most time playing when a person moves a feather wand. ${cat.name} has nothing to chase through the air yet.`,
    });
  }
  if (live.length && mix.missing.includes('stalk')) {
    out.push({
      id: 'no-stalk',
      kind: 'buy',
      title: 'Worth buying: a small mouse or ball',
      body: 'Small, furry, fast floor prey is what most cats stalk. These are cheap, and a few of them give every basket one.',
    });
  }
  if (live.length && mix.missing.includes('grab')) {
    out.push({
      id: 'no-grab',
      kind: 'buy',
      title: 'Worth buying: a kicker or food puzzle',
      body: 'A kicker gives the end of the hunt (the grab-and-bunny-kick). A food puzzle turns meals into foraging. Both help on days you can’t play.',
    });
  }
  if (live.length && mix.hasLaserOnly) {
    out.push({
      id: 'laser',
      kind: 'safety',
      title: 'Give the laser a catch',
      body: 'Laser-only chasing is linked to frustration and fixation on lights. Finish each laser session on a toy they can grab, or add a mouse.',
    });
  }

  // Retired in the last 30 days and its role is now thin.
  const recentRetired = toys.filter(
    (t) => t.status === 'retired' && daysBetween(t.lastUsedAt ?? t.createdAt, at) <= 30
  );
  for (const r of recentRetired.slice(0, 1)) {
    const role = roleOf(r.kind);
    const left = live.filter((t) => roleOf(t.kind) === role).length;
    if (left < groups.length) {
      const label = PLAY_ROLES.find((p) => p.role === role)!.label.toLowerCase();
      out.push({
        id: `replace-${r.id}`,
        kind: 'buy',
        title: `Replace ${r.name}`,
        body: `You’re down to ${left} ${label} toy${left === 1 ? '' : 's'} for ${groups.length} baskets. Pick a different texture or sound than before, so it’s actually new.`,
      });
    }
  }

  // Collection gone flat: plenty of recent play, but sessions are short across most toys.
  const recent = sessions.filter((s) => daysBetween(s.endedAt, at) <= 14);
  if (recent.length >= 8 && live.length >= 3) {
    const byToy = new Map<string, number[]>();
    for (const s of recent) byToy.set(s.toyId, [...(byToy.get(s.toyId) ?? []), s.durationMs]);
    const avgs = [...byToy.values()].map((d) => d.reduce((a, b) => a + b, 0) / d.length);
    const flat = avgs.filter((ms) => ms < 3 * 60_000).length;
    if (byToy.size >= 3 && flat / byToy.size >= 0.6) {
      out.push({
        id: 'flat',
        kind: 'refresh',
        title: 'Time for something new',
        body: `Most hunts in the last two weeks stopped under 3 minutes, even with rotation. A toy with a texture, sound or movement ${cat.name} hasn’t met yet is the best way to bring play back.`,
      });
    }
  }

  return out;
}
