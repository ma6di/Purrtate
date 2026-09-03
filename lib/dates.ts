export function nowIso() {
  return new Date().toISOString();
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysBetween(iso: string | null, at = new Date()) {
  if (!iso) return Infinity;
  const ms = startOfDay(at).getTime() - startOfDay(new Date(iso)).getTime();
  return Math.floor(ms / 86_400_000);
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatMinutes(ms: number) {
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return `${Math.max(1, Math.round(ms / 1000))}s`;
  return `${mins} min`;
}

export function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function greeting(at = new Date()) {
  const h = at.getHours();
  if (h < 12) return 'Morning hunt';
  if (h < 17) return 'Afternoon stretch';
  return 'Evening pounce';
}

export function weekday(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' });
}
