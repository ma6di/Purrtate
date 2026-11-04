import { anyBasketIssues, basketIssues, basketMix, mixHint, newToyNudge, toySuggestions } from '@/lib/toyAdvice';

import { NOW, daysAgo, fullHousehold, household, toy } from './fixtures';

describe('basketMix', () => {
  it('reports which roles are covered', () => {
    expect(basketMix(['wand', 'mouse'])).toEqual({ have: ['chase', 'stalk'], missing: ['grab'], hasLaserOnly: false });
  });
  it('flags a laser as the only stalk toy', () => {
    expect(basketMix(['laser', 'plush']).hasLaserOnly).toBe(true);
    expect(basketMix(['laser', 'mouse']).hasLaserOnly).toBe(false);
  });
  it('praises a full mix', () => {
    expect(mixHint('Basket A', basketMix(['wand', 'mouse', 'plush']), 3)).toMatch(/Good mix/);
  });
});

describe('basketIssues', () => {
  it('has nothing to say about a balanced household', () => {
    const h = fullHousehold();
    expect(h.groups.flatMap((g) => basketIssues(h, g.id))).toEqual([]);
    expect(anyBasketIssues(h)).toBe(false);
  });
  it('flags an empty basket', () => {
    const h = household([toy('a', 'wand', { status: 'active' }), toy('a', 'mouse', { status: 'active' })]);
    expect(basketIssues(h, 'c')[0]).toMatchObject({ kind: 'thin' });
    expect(basketIssues(h, 'c')[0].text).toMatch(/empty/);
  });
  it('flags a thin basket', () => {
    const h = household([toy('a', 'wand', { status: 'active' })]);
    expect(basketIssues(h, 'a').map((i) => i.kind)).toContain('thin');
  });
  it('suggests moving a spare toy instead of buying', () => {
    const h = household([
      toy('a', 'wand', { status: 'active', name: 'Wand 1' }),
      toy('a', 'feather', { status: 'active' }),
      toy('a', 'mouse', { status: 'active' }),
      toy('b', 'ball'),
      toy('b', 'plush'),
    ]);
    const issue = basketIssues(h, 'b').find((i) => i.id === 'missing-chase');
    expect(issue?.move).toMatchObject({ toyName: 'Wand 1', fromName: 'Basket A' });
  });
  it('suggests buying when no basket can spare one', () => {
    const h = household([toy('a', 'wand', { status: 'active' }), toy('a', 'mouse', { status: 'active' }), toy('b', 'ball'), toy('b', 'mouse')]);
    const issue = basketIssues(h, 'b').find((i) => i.id === 'missing-chase');
    expect(issue?.move).toBeUndefined();
    expect(issue?.text).toMatch(/Worth getting/);
  });
  it('does not count retired toys', () => {
    const h = household([toy('a', 'wand', { status: 'retired' }), toy('a', 'mouse', { status: 'retired' })]);
    expect(basketIssues(h, 'a')[0].text).toMatch(/empty/);
  });
});

describe('newToyNudge', () => {
  it('is due after the energy level period with no new toy', () => {
    const h = household([toy('a', 'mouse', { createdAt: daysAgo(43) })]);
    expect(newToyNudge(h, NOW)).toEqual({ due: true, daysSince: 43, every: 42 });
  });
  it('resets when a toy is added', () => {
    const h = household([toy('a', 'mouse', { createdAt: daysAgo(60) }), toy('a', 'ball', { createdAt: daysAgo(2) })]);
    expect(newToyNudge(h, NOW).due).toBe(false);
  });
  it('respects "Not now"', () => {
    const until = new Date(NOW);
    until.setDate(until.getDate() + 3);
    const h = household([toy('a', 'mouse', { createdAt: daysAgo(60) })], {
      settings: { newToySnoozedUntil: until.toISOString() },
    });
    expect(newToyNudge(h, NOW).due).toBe(false);
  });
  it('comes sooner for kittens', () => {
    const h = household([toy('a', 'mouse', { createdAt: daysAgo(22) })], { energy: 'kitten' });
    expect(newToyNudge(h, NOW).due).toBe(true);
  });
});

describe('toySuggestions', () => {
  it('asks for toys when there are none', () => {
    expect(toySuggestions(household([]), NOW)[0].id).toBe('empty');
  });
  it('recommends buying a missing role', () => {
    const h = household([toy('a', 'mouse', { status: 'active' }), toy('b', 'plush')]);
    expect(toySuggestions(h, NOW).map((s) => s.id)).toEqual(['no-chase']);
  });
  it('warns when the laser is the only stalk toy', () => {
    const h = household([toy('a', 'wand', { status: 'active' }), toy('a', 'laser', { status: 'active' }), toy('b', 'plush')]);
    expect(toySuggestions(h, NOW).map((s) => s.id)).toContain('laser');
  });
  it('suggests replacing a recently retired toy when its role runs short', () => {
    const h = household([
      toy('a', 'wand', { status: 'retired', name: 'Old wand', retiredAt: daysAgo(3) }),
      toy('a', 'feather', { status: 'active' }),
      toy('a', 'mouse', { status: 'active' }),
      toy('b', 'plush'),
    ]);
    expect(toySuggestions(h, NOW).find((s) => s.id.startsWith('replace-'))?.title).toBe('Replace Old wand');
  });
  it('is quiet for a balanced household', () => {
    expect(toySuggestions(fullHousehold(), NOW)).toEqual([]);
  });
});
