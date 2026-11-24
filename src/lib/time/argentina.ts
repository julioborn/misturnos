// Argentina no tiene horario de verano desde 2009: America/Argentina/Cordoba
// es siempre UTC-3, todo el año. Por eso alcanza con aritmética simple y no
// hace falta una librería de zonas horarias.
const ARG_OFFSET_MS = 3 * 60 * 60 * 1000;

// Convierte una fecha/hora local (wall clock en Argentina) a un instante UTC real.
export function localToUtc(dateStr: string, timeStr: string): Date {
  const hhmmss = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return new Date(new Date(`${dateStr}T${hhmmss}Z`).getTime() + ARG_OFFSET_MS);
}

// Dado un instante UTC, devuelve la fecha y hora locales (wall clock) en Argentina.
export function utcToLocal(d: Date): { date: string; time: string } {
  const shifted = new Date(d.getTime() - ARG_OFFSET_MS);
  const iso = shifted.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

export function todayLocal(): string {
  return utcToLocal(new Date()).date;
}

// 0 = domingo ... 6 = sábado, igual que la convención del schema.
export function weekdayOfLocalDate(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

export function addDaysLocal(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
