import {
  activeGroup,
  applyRotation,
  basketStatus,
  earlySwapSuggestion,
  freshnessLabel,
  freshnessScore,
  intervalDays,
  nextGroup,
  restDaysFor,
} from '@/lib/rotation';

import { NOW, daysAgo, fullHousehold, household, toy } from './fixtures';

describe('intervalDays', () => {
  it('uses the energy suggestion by default', () => {
    expect(intervalDays('kitten', null)).toBe(2);
    expect(intervalDays('adult', null)).toBe(7);
    expect(intervalDays('senior', null)).toBe(14);
  });
  it('prefers the owner override', () => {
    expect(intervalDays('adult', 3)).toBe(3);
  });
});

describe('basket order', () => {
  it('finds the basket that is out and the next one with toys', () => {
    const h = fullHousehold();
    expect(activeGroup(h)?.id).toBe('a');
    expect(nextGroup(h)?.id).toBe('b');
  });
  it('skips empty baskets', () => {
    const h = household([toy('a', 'mouse', { status: 'active' }), toy('c', 'ball')]);
    expect(nextGroup(h)?.id).toBe('c');
  });
  it('has nothing to swap to with one basket of toys', () => {
    const h = household([toy('a', 'mouse', { status: 'active' })]);
    expect(nextGroup(h)).toBeNull();
    expect(basketStatus(h, NOW).due).toBe(false);
  });
  it('wraps around from the last basket', () => {
    const h = household([toy('a', 'mouse'), toy('c', 'ball', { status: 'active' })]);
    expect(nextGroup(h)?.id).toBe('a');
  });
});

describe('basketStatus', () => {
  it('counts down to the swap', () => {
    const s = basketStatus(fullHousehold({ settings: { lastRotationAt: daysAgo(3) } }), NOW);
    expect(s.daysOut).toBe(3);
    expect(s.daysLeft).toBe(4);
    expect(s.due).toBe(false);
  });
  it('is due once the interval has passed', () => {
    const s = basketStatus(fullHousehold({ settings: { lastRotationAt: daysAgo(7) } }), NOW);
    expect(s.due).toBe(true);
    expect(s.daysLeft).toBe(0);
  });
  it('falls back to the cat creation date', () => {
    const s = basketStatus(fullHousehold({ settings: { lastRotationAt: null }, catCreated: daysAgo(9) }), NOW);
    expect(s.daysOut).toBe(9);
  });
});

describe('restDaysFor', () => {
  it('is the wait for the next turn: interval x (baskets - 1)', () => {
    expect(restDaysFor(fullHousehold())).toBe(14);
    expect(restDaysFor(fullHousehold({ settings: { rotationIntervalDays: 3 } }))).toBe(6);
  });
  it('ignores empty baskets', () => {
    const h = household([toy('a', 'mouse', { status: 'active' }), toy('b', 'ball')]);
    expect(restDaysFor(h)).toBe(7);
  });
});

describe('freshness', () => {
  it('fades for toys that are out', () => {
    const fresh = fullHousehold({ settings: { lastRotationAt: daysAgo(0) } });
    const stale = fullHousehold({ settings: { lastRotationAt: daysAgo(10) } });
    const outToy = fresh.toys[0];
    expect(freshnessScore(outToy, fresh, NOW)).toBe(100);
    expect(freshnessScore(stale.toys[0], stale, NOW)).toBe(15);
  });
  it('recovers for resting toys and reads "Feels new" when rested', () => {
    const h = fullHousehold();
    const rested = { ...h.toys[3], restStartedAt: daysAgo(14) };
    const score = freshnessScore(rested, h, NOW);
    expect(score).toBe(100);
    expect(freshnessLabel(score, 'resting')).toBe('Feels new');
  });
  it('is zero for retired toys', () => {
    const h = fullHousehold();
    expect(freshnessScore({ ...h.toys[0], status: 'retired' }, h, NOW)).toBe(0);
  });
});

describe('applyRotation', () => {
  it('rests the old basket, brings out the next, leaves retired alone', () => {
    const toys = [
      toy('a', 'mouse', { status: 'active' }),
      toy('b', 'ball'),
      toy('a', 'wand', { status: 'retired' }),
      toy('c', 'plush'),
    ];
    const at = NOW.toISOString();
    const [oldOut, next, retired, other] = applyRotation(toys, 'a', 'b', at);
    expect(oldOut).toMatchObject({ status: 'resting', restStartedAt: at });
    expect(next).toMatchObject({ status: 'active', restStartedAt: null });
    expect(retired.status).toBe('retired');
    expect(other).toBe(toys[3]);
  });
});

describe('earlySwapSuggestion', () => {
  const log = (...days: number[]) => days.map((d, i) => ({ at: daysAgo(30 - i * 5), daysOut: d, interval: 7 }));

  it('suggests a shorter interval after two early swaps', () => {
    expect(earlySwapSuggestion(fullHousehold({ settings: { swapLog: log(4, 5) } }))).toEqual({
      current: 7,
      suggested: 5,
      avgDaysOut: 4.5,
    });
  });
  it('waits for a pattern: one early swap is not enough', () => {
    expect(earlySwapSuggestion(fullHousehold({ settings: { swapLog: log(7, 4) } }))).toBeNull();
  });
  it('ignores same-day swaps as likely mis-taps', () => {
    expect(earlySwapSuggestion(fullHousehold({ settings: { swapLog: log(0, 4) } }))).toBeNull();
  });
  it('stays hidden after "Keep" until another early swap', () => {
    const swapLog = log(4, 5);
    const dismissed = fullHousehold({ settings: { swapLog, intervalPromptDismissedAt: daysAgo(0) } });
    expect(earlySwapSuggestion(dismissed)).toBeNull();
  });
  it('stops once the interval has changed', () => {
    expect(
      earlySwapSuggestion(fullHousehold({ settings: { swapLog: log(4, 5), rotationIntervalDays: 5 } }))
    ).toBeNull();
  });
  it('has nothing shorter than 2 days to offer', () => {
    const swapLog = [1, 1].map((d, i) => ({ at: daysAgo(10 - i), daysOut: d, interval: 2 }));
    expect(earlySwapSuggestion(fullHousehold({ energy: 'kitten', settings: { swapLog } }))).toBeNull();
  });
});
