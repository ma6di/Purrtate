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
