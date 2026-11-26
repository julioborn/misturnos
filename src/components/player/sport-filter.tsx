"use client";

import { cn } from "@/lib/utils";
import { SPORT_META } from "@/lib/sports";

export const SPORTS = [
  { key: "all" as const, label: "Todo", emoji: "▦" },
  { key: "padel" as const, ...SPORT_META.padel },
  { key: "futbol" as const, ...SPORT_META.futbol },
  { key: "basquet" as const, ...SPORT_META.basquet },
  { key: "voley" as const, ...SPORT_META.voley },
];

export type SportKey = (typeof SPORTS)[number]["key"];

export function SportFilter({
  selected,
  onSelect,
}: {
  selected: SportKey;
  onSelect: (key: SportKey) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {SPORTS.map((sport) => {
        const active = sport.key === selected;
        return (
          <button
            key={sport.key}
            type="button"
            onClick={() => onSelect(sport.key)}
            className={cn(
              "flex touch-manipulation flex-col items-center justify-center gap-1.5 rounded-[20px] py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-100 ease-out active:scale-95",
              active ? "bg-[#111111] text-white" : "bg-white text-[#111111] active:bg-[#E5E5EA]",
            )}
          >
            <span className="text-[32px] leading-none">{sport.emoji}</span>
            <span className="text-[13px] font-semibold leading-none">{sport.label}</span>
          </button>
        );
      })}
    </div>
  );
}
