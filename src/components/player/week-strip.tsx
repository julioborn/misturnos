"use client";

import { WeekCalendarTrigger } from "@/components/player/week-calendar-trigger";
import { cn } from "@/lib/utils";

export type WeekDay = {
  date: string;
  dayAbbrev: string;
  dayNumber: number;
  isPast: boolean;
  isSelected: boolean;
};

export function WeekStrip({
  date,
  monthYearLabel,
  days,
  onSelectDate,
}: {
  date: string;
  monthYearLabel: string;
  days: WeekDay[];
  onSelectDate: (dateKey: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <WeekCalendarTrigger date={date} label={monthYearLabel} onSelect={onSelectDate} />
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) =>
          d.isPast ? (
            <span
              key={d.date}
              className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl bg-[#F2F2F7] text-[#C7C7CC]"
            >
              <span className="text-[11px] font-medium">{d.dayAbbrev}</span>
              <span className="text-[15px] font-semibold [font-variant-numeric:tabular-nums]">
                {d.dayNumber}
              </span>
            </span>
          ) : (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelectDate(d.date)}
              className={cn(
                "flex h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-100 active:scale-95",
                d.isSelected
                  ? "bg-[#111111] text-white"
                  : "bg-[#F2F2F7] text-[#111111] active:bg-[#E5E5EA]",
              )}
            >
              <span className="text-[11px] font-medium">{d.dayAbbrev}</span>
              <span className="text-[15px] font-semibold [font-variant-numeric:tabular-nums]">
                {d.dayNumber}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
