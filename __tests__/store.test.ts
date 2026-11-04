import { emptyBaskets, starterBaskets } from '@/components/BasketBuilder';
import { useAppStore } from '@/store/useAppStore';

const state = () => useAppStore.getState();

function setup(baskets = starterBaskets()) {
  state().resetAll();
  state().completeOnboarding({ name: '  Mochi  ', energy: 'adult', baskets });
}

describe('completeOnboarding', () => {
  it('creates the cat, three baskets and their toys with Basket A out', () => {
    setup();
    const s = state();
    expect(s.cats).toHaveLength(1);
    expect(s.cats[0].name).toBe('Mochi');
    expect(s.groups.map((g) => g.name)).toEqual(['Basket A', 'Basket B', 'Basket C']);
    expect(s.toys).toHaveLength(9);
    const out = s.toys.filter((t) => t.status === 'active');
    expect(new Set(out.map((t) => t.groupId))).toEqual(new Set([s.groups[0].id]));
    expect(s.settings.onboardingComplete).toBe(true);
  });
  it('works with empty baskets and a blank name', () => {
    state().resetAll();
    state().completeOnboarding({ name: '   ', energy: 'adult', baskets: emptyBaskets() });
    expect(state().cats[0].name).toBe('Kitty');
    expect(state().toys).toEqual([]);
  });
  it('ignores blank toy names and bad kinds from the builder', () => {
    const baskets = emptyBaskets();
    baskets[0].toys = [
      { key: '1', name: '  ', kind: 'mouse' },
      { key: '2', name: 'Fish', kind: 'not-a-kind' as never },
    ];
    setup(baskets);
    expect(state().toys.map((t) => [t.name, t.kind])).toEqual([['Fish', 'mouse']]);
  });
});

describe('rotate', () => {
  it('brings out the next basket and logs the swap', () => {
    setup();
    const [a, b] = state().groups;
    state().rotate();
    const s = state();
    expect(s.toys.filter((t) => t.status === 'active').every((t) => t.groupId === b.id)).toBe(true);
    expect(s.toys.filter((t) => t.groupId === a.id).every((t) => t.status === 'resting')).toBe(true);
    expect(s.settings.swapLog).toHaveLength(1);
  });
  it('keeps the swap log short', () => {
    setup();
    for (let i = 0; i < 10; i++) state().rotate();
    expect(state().settings.swapLog).toHaveLength(6);
  });
});

describe('updateToy', () => {
  it('moving a toy into the resting basket rests it', () => {
    setup();
    const [a, b] = state().groups;
    const outToy = state().toys.find((t) => t.groupId === a.id)!;
    state().updateToy(outToy.id, { groupId: b.id });
    expect(state().toys.find((t) => t.id === outToy.id)).toMatchObject({ groupId: b.id, status: 'resting' });
  });
  it('moving a toy into the out basket brings it out', () => {
    setup();
    const [a, , c] = state().groups;
    const restToy = state().toys.find((t) => t.groupId === c.id)!;
    state().updateToy(restToy.id, { groupId: a.id });
    expect(state().toys.find((t) => t.id === restToy.id)).toMatchObject({ status: 'active', restStartedAt: null });
  });
  it('refuses a basket that does not exist', () => {
    setup();
    const t = state().toys[0];
    state().updateToy(t.id, { groupId: 'ghost' });
    expect(state().toys[0].groupId).toBe(t.groupId);
  });
  it('cleans names and ignores bad colours', () => {
    setup();
    const t = state().toys[0];
    state().updateToy(t.id, { name: '   ', color: 'javascript:alert(1)' });
    expect(state().toys[0].name).toBe(t.name);
    expect(state().toys[0].color).toBeUndefined();
  });
});

describe('addToy', () => {
  it('puts a toy in the requested basket with the right status', () => {
    setup();
    const [, b] = state().groups;
    state().addToy({ name: 'Spring', kind: 'ball', groupId: b.id });
    expect(state().toys.at(-1)).toMatchObject({ name: 'Spring', groupId: b.id, status: 'resting' });
  });
  it('ignores a basket from another cat', () => {
    setup();
    state().addToy({ name: 'Spring', kind: 'ball', groupId: 'someone-else' });
    expect(state().groups.map((g) => g.id)).toContain(state().toys.at(-1)!.groupId);
  });
});

describe('updateSettings', () => {
  it('only accepts offered intervals', () => {
    setup();
    state().updateSettings({ rotationIntervalDays: 5 });
    expect(state().settings.rotationIntervalDays).toBe(5);
    state().updateSettings({ rotationIntervalDays: -1 });
    expect(state().settings.rotationIntervalDays).toBeNull();
  });
  it('drops unknown keys', () => {
    setup();
    state().updateSettings({ evil: true } as never);
    expect(state().settings).not.toHaveProperty('evil');
  });
});

describe('setToyStatus', () => {
  it('stamps retiredAt and clears it on return', () => {
    setup();
    const t = state().toys[0];
    state().setToyStatus(t.id, 'retired');
    expect(state().toys[0].retiredAt).toBeTruthy();
    state().setToyStatus(t.id, 'resting');
    expect(state().toys[0].retiredAt).toBeNull();
  });
});
