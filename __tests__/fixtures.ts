import type { Household } from '@/lib/rotation';
import type { Energy, Settings, Toy, ToyKind, ToyStatus } from '@/types/models';

export const NOW = new Date('2026-06-15T12:00:00');

export function daysAgo(n: number, from = NOW) {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

let seq = 0;
export function toy(
  groupId: string,
  kind: ToyKind = 'mouse',
  overrides: Partial<Toy> = {}
): Toy {
  seq += 1;
  const status: ToyStatus = overrides.status ?? 'resting';
  return {
    id: `toy${seq}`,
    catId: 'cat',
    groupId,
    name: overrides.name ?? `${kind} ${seq}`,
    kind,
    status,
    notes: '',
    createdAt: daysAgo(60),
    restStartedAt: status === 'resting' ? daysAgo(0) : null,
    retiredAt: null,
    ...overrides,
  };
}

export function household(
  toys: Toy[],
  opts: { energy?: Energy; settings?: Partial<Settings>; catCreated?: string } = {}
): Household {
  return {
    cat: { id: 'cat', name: 'Mochi', energy: opts.energy ?? 'adult', createdAt: opts.catCreated ?? daysAgo(60) },
    groups: [
      { id: 'a', catId: 'cat', name: 'Basket A' },
      { id: 'b', catId: 'cat', name: 'Basket B' },
      { id: 'c', catId: 'cat', name: 'Basket C' },
    ],
    toys,
    settings: {
      onboardingComplete: true,
      rotationIntervalDays: null,
      remindersOn: false,
      lastRotationAt: daysAgo(0),
      ...opts.settings,
    },
  };
}

/** Three baskets, one of each role in each, A out. */
export function fullHousehold(opts: Parameters<typeof household>[1] = {}) {
  const out = (k: ToyKind) => toy('a', k, { status: 'active' });
  return household(
    [
      out('wand'), out('mouse'), out('plush'),
      toy('b', 'feather'), toy('b', 'ball'), toy('b', 'puzzle'),
      toy('c', 'wand'), toy('c', 'mouse'), toy('c', 'tunnel'),
    ],
    opts
  );
}
