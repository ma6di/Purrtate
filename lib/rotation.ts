import { daysBetween, dayKey, startOfDay } from '@/lib/dates';
import { ENERGY_PRESETS } from '@/lib/presets';
import type {
  Cat,
  Energy,
  Group,
  RotationAlert,
  Session,
  Settings,
  Toy,
} from '@/types/models';

export type Household = {
  cat: Cat;
  toys: Toy[];
  groups: Group[];
  sessions: Session[];
  settings: Settings;
};

export function intervalDays(energy: Energy, override: number | null) {
  return override ?? ENERGY_PRESETS[energy].intervalDays;
}

export function restDaysFor(energy: Energy) {
  return ENERGY_PRESETS[energy].restDays;
}

export function dailyTargetMs(energy: Energy) {
  const p = ENERGY_PRESETS[energy];
  return p.sessionMin * p.sessionsPerDay * 60_000;
}

export function freshnessScore(toy: Toy, energy: Energy, at = new Date()) {
  const preset = ENERGY_PRESETS[energy];
  if (toy.status === 'retired') return 0;
  if (toy.status === 'resting') {
    const rested = Number.isFinite(daysBetween(toy.restStartedAt, at))
      ? daysBetween(toy.restStartedAt, at)
      : 0;
    return Math.min(100, 35 + (rested / preset.restDays) * 65);
  }
  if (!toy.lastUsedAt) return 88;
  const idle = daysBetween(toy.lastUsedAt, at);
  let score = 100 - idle * (100 / Math.max(preset.unusedDays + 2, 4));
  if (toy.playCount >= 4) score -= 8;
  return Math.max(8, Math.min(100, Math.round(score)));
}

export function freshnessLabel(score: number, status: Toy['status']) {
  if (status === 'retired') return 'Retired';
  if (status === 'resting') {
    if (score >= 85) return 'Feels new';
    if (score >= 60) return 'Napping';
    return 'Resting';
  }
  if (score >= 80) return 'Fresh';
  if (score >= 55) return 'Familiar';
  if (score >= 35) return 'Going stale';
  return 'Habituated';
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

export function todaySessions(sessions: Session[], catId: string, at = new Date()) {
  const key = dayKey(at.toISOString());
  return sessions.filter((s) => s.catId === catId && dayKey(s.endedAt) === key);
}

export function playByDay(sessions: Session[], catId: string, days = 14, at = new Date()) {
  const start = startOfDay(at);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = dayKey(d.toISOString());
    const ms = sessions
      .filter((s) => s.catId === catId && dayKey(s.endedAt) === key)
      .reduce((sum, s) => sum + s.durationMs, 0);
    return { date: key, ms };
  });
}

export function favoriteToy(household: Household) {
  return [...household.toys].sort((a, b) => b.totalPlayMs - a.totalPlayMs)[0] ?? null;
}

function engagementDropped(household: Household, toy: Toy) {
  const recent = household.sessions
    .filter((s) => s.toyId === toy.id)
    .sort((a, b) => (a.endedAt < b.endedAt ? 1 : -1))
    .slice(0, 4);
  if (recent.length < 3) return false;
  const latest = recent[0].durationMs;
  const prior =
    recent.slice(1).reduce((sum, s) => sum + s.durationMs, 0) / (recent.length - 1);
  return prior > 0 && latest < prior * 0.5;
}

export function rotationAlerts(household: Household, at = new Date()): RotationAlert[] {
  const { cat, toys, sessions, settings } = household;
  const preset = ENERGY_PRESETS[cat.energy];
  const interval = intervalDays(cat.energy, settings.rotationIntervalDays);
  const alerts: RotationAlert[] = [];
  const activeToys = toys.filter((t) => t.status === 'active');
  const current = activeGroup(household);
  const nxt = nextGroup(household);

  const daysSinceRotate = daysBetween(settings.lastRotationAt ?? cat.createdAt, at);
  const stale = activeToys.filter((t) => freshnessScore(t, cat.energy, at) < 38);
  const ignored = activeToys.filter((t) => {
    const since = t.lastUsedAt ?? t.createdAt;
    return daysBetween(since, at) >= preset.unusedDays;
  });
  const dropped = activeToys.filter((t) => engagementDropped(household, t));

  if (nxt && (daysSinceRotate >= interval || stale.length >= Math.max(1, activeToys.length - 1))) {
    alerts.push({
      kind: 'rotate',
      title: `Swap in ${nxt.name}`,
      body:
        daysSinceRotate >= interval
          ? `${current?.name ?? 'This basket'} has been out for ${daysSinceRotate} days. ${cat.name} will treat ${nxt.name} as new.`
          : `Play with ${current?.name ?? 'these toys'} is flattening. A fresh basket usually restores the pounce.`,
    });
  } else if (ignored.length && nxt) {
    alerts.push({
      kind: 'rotate',
      title: 'Quiet toys',
      body: `${ignored[0].name} has been ignored for ${daysBetween(ignored[0].lastUsedAt, at)} days. Time to rotate.`,
    });
  } else if (dropped.length && nxt) {
    alerts.push({
      kind: 'rotate',
      title: 'Habituation blip',
      body: `${dropped[0].name} sessions just halved. A swap will likely spike interest again.`,
    });
  }

  const todayMs = todaySessions(sessions, cat.id, at).reduce((sum, s) => sum + s.durationMs, 0);
  const target = dailyTargetMs(cat.energy);
  if (todayMs < target * 0.4) {
    alerts.push({
      kind: 'play',
      title: 'Hunt still open',
      body: `${cat.name} is at ${Math.round(todayMs / 60_000)} of ${Math.round(target / 60_000)} min today. A short wand burst counts.`,
    });
  }

  const ready = toys.filter(
    (t) =>
      t.status === 'resting' &&
      daysBetween(t.restStartedAt, at) >= preset.restDays
  );
  if (ready.length) {
    alerts.push({
      kind: 'reintroduce',
      title: `${ready[0].name} feels new`,
      body: `Rested about a week or more. Bring it back, or wait for the next group swap.`,
    });
  }

  return alerts.slice(0, 3);
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
