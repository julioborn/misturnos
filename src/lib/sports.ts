export const SPORT_META: Record<string, { label: string; emoji: string }> = {
  padel: { label: "Pádel", emoji: "🎾" },
  futbol: { label: "Fútbol", emoji: "⚽" },
  basquet: { label: "Básquet", emoji: "🏀" },
  voley: { label: "Vóley", emoji: "🏐" },
};

export function sportLabel(sport: string): string {
  return SPORT_META[sport]?.label ?? sport;
}

export function sportEmoji(sport: string): string {
  return SPORT_META[sport]?.emoji ?? "🏟️";
}
