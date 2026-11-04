import { MAX_NAME, cleanColor, cleanDate, cleanInterval, cleanKind, cleanName, sanitizeState } from '@/lib/sanitize';

describe('cleanName', () => {
  it('trims and collapses whitespace', () => {
    expect(cleanName('  Red   mouse \n', 'x')).toBe('Red mouse');
  });
  it('falls back when empty or not a string', () => {
    expect(cleanName('   ', 'Kitty')).toBe('Kitty');
    expect(cleanName(42, 'Kitty')).toBe('Kitty');
    expect(cleanName(null, 'Kitty')).toBe('Kitty');
  });
  it('caps length', () => {
    expect(cleanName('x'.repeat(500), 'k')).toHaveLength(MAX_NAME);
  });
  it('strips control and direction-override characters', () => {
    expect(cleanName('Bad\u0000‮toy', 'k')).toBe('Bad toy');
  });
  it('keeps emoji and non-Latin names', () => {
    expect(cleanName('Мурка 🐟', 'k')).toBe('Мурка 🐟');
  });
});

describe('enum guards', () => {
  it('only accepts known toy kinds and colours', () => {
    expect(cleanKind('wand')).toBe('wand');
    expect(cleanKind('<script>')).toBe('mouse');
    expect(cleanColor('#4F7CC4')).toBe('#4F7CC4');
    expect(cleanColor('red; drop table')).toBeUndefined();
  });
  it('only accepts offered swap intervals', () => {
    expect(cleanInterval(7)).toBe(7);
    expect(cleanInterval(0)).toBeNull();
    expect(cleanInterval(-3)).toBeNull();
    expect(cleanInterval(1e9)).toBeNull();
    expect(cleanInterval('7')).toBeNull();
  });
  it('rejects bad dates and clamps far-future ones', () => {
    expect(cleanDate('not a date')).toBeNull();
    expect(cleanDate(undefined)).toBeNull();
    expect(Date.parse(cleanDate('2999-01-01T00:00:00Z')!)).toBeLessThanOrEqual(Date.now() + 1000);
  });
});

describe('sanitizeState', () => {
  it('survives garbage', () => {
    for (const raw of [null, undefined, 'x', 3, [], { cats: 'nope', toys: {} }]) {
      expect(sanitizeState(raw)).toMatchObject({ cats: [], groups: [], toys: [], activeCatId: null });
    }
  });
  it('drops toys pointing at missing baskets or other cats', () => {
    const s = sanitizeState({
      cats: [{ id: 'c1', name: 'Mochi', energy: 'adult', createdAt: '2026-01-01T00:00:00Z' }],
      groups: [{ id: 'g1', catId: 'c1', name: 'A' }],
      toys: [
        { id: 't1', catId: 'c1', groupId: 'g1', name: 'ok', kind: 'mouse', status: 'active' },
        { id: 't2', catId: 'c1', groupId: 'gone', name: 'orphan', kind: 'mouse', status: 'active' },
        { id: 't3', catId: 'c2', groupId: 'g1', name: 'wrong cat', kind: 'mouse', status: 'active' },
      ],
      activeCatId: 'c1',
      settings: { onboardingComplete: true },
    });
    expect(s.toys.map((t) => t.id)).toEqual(['t1']);
  });
  it('migrates v1 data: removes hunt fields, keeps toys', () => {
    const s = sanitizeState({
      cats: [{ id: 'c1', name: 'Mochi', energy: 'adult', createdAt: '2026-01-01T00:00:00Z' }],
      groups: [{ id: 'g1', catId: 'c1', name: 'Basket A' }],
      toys: [{ id: 't1', catId: 'c1', groupId: 'g1', name: 'Mouse', kind: 'mouse', status: 'resting', playCount: 4, totalPlayMs: 9999, lastUsedAt: '2026-01-02T00:00:00Z' }],
      sessions: [{ id: 's1' }],
      settings: { onboardingComplete: true, rotationIntervalDays: 99 },
    });
    expect(s.toys[0]).not.toHaveProperty('playCount');
    expect(s).not.toHaveProperty('sessions');
    expect(s.toys[0].restStartedAt).not.toBeNull();
    expect(s.settings.rotationIntervalDays).toBeNull();
  });
  it('does not mark setup finished without a cat', () => {
    expect(sanitizeState({ settings: { onboardingComplete: true } }).settings.onboardingComplete).toBe(false);
  });
  it('fixes an unknown active cat', () => {
    const s = sanitizeState({
      cats: [{ id: 'c1', name: 'Mochi', energy: 'adult' }],
      activeCatId: 'ghost',
    });
    expect(s.activeCatId).toBe('c1');
  });
  it('keeps one household from old multi-cat data: the active cat and its toys', () => {
    const s = sanitizeState({
      cats: [
        { id: 'c1', name: 'Mochi', energy: 'adult' },
        { id: 'c2', name: 'Bean', energy: 'kitten' },
      ],
      groups: [
        { id: 'g1', catId: 'c1', name: 'A' },
        { id: 'g2', catId: 'c2', name: 'A' },
      ],
      toys: [
        { id: 't1', catId: 'c1', groupId: 'g1', name: 'Mouse', kind: 'mouse', status: 'active' },
        { id: 't2', catId: 'c2', groupId: 'g2', name: 'Ball', kind: 'ball', status: 'active' },
      ],
      activeCatId: 'c2',
    });
    expect(s.cats.map((c) => c.name)).toEqual(['Bean']);
    expect(s.toys.map((t) => t.id)).toEqual(['t2']);
    expect(s.activeCatId).toBe('c2');
  });
});
