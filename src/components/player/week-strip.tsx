"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeekCalendarTrigger } from "@/components/player/week-calendar-trigger";

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
  canGoPrevWeek,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: {
  date: string;
  monthYearLabel: string;
  days: WeekDay[];
  canGoPrevWeek: boolean;
  onSelectDate: (dateKey: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-wide text-[#636366] uppercase">Fecha</span>
        <WeekCalendarTrigger date={date} label={monthYearLabel} onSelect={onSelectDate} />
      </div>

      <div className="flex items-center gap-1">
        {canGoPrevWeek ? (
          <button
            type="button"
            onClick={onPrevWeek}
            className="flex size-9 shrink-0 touch-manipulation items-center justify-center rounded-full text-[#636366] active:bg-[#E5E5EA]"
          >
            <ChevronLeft className="size-4" />
          </button>
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center text-[#E5E5EA]">
            <ChevronLeft className="size-4" />
          </span>
        )}

        <div className="grid flex-1 grid-cols-7 gap-1">
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

        <button
          type="button"
          onClick={onNextWeek}
          className="flex size-9 shrink-0 touch-manipulation items-center justify-center rounded-full text-[#636366] active:bg-[#E5E5EA]"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
