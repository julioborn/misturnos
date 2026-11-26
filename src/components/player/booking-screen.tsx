"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { todayLocal, addDaysLocal, weekdayOfLocalDate } from "@/lib/time/argentina";
import { sportLabel, sportEmoji } from "@/lib/sports";
import { WeekStrip, type WeekDay } from "@/components/player/week-strip";
import { BookingSlots, type BookingSlot } from "@/components/player/booking-slots";
import { getAvailabilityAction } from "@/app/(player)/actions";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Court = { id: string; name: string; sport: string; variant: string | null };

export function BookingScreen({
  courts,
  initialCourtId,
  initialDate,
  initialSlots,
}: {
  courts: Court[];
  initialCourtId: string;
  initialDate: string;
  initialSlots: BookingSlot[];
}) {
  const [courtId, setCourtId] = useState(initialCourtId);
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState(initialSlots);
  const [isPending, startTransition] = useTransition();

  const court = courts.find((c) => c.id === courtId)!;
  const today = todayLocal();

  function reload(nextCourtId: string, nextDate: string) {
    setCourtId(nextCourtId);
    setDate(nextDate);
    startTransition(async () => {
      const { slots: next } = await getAvailabilityAction(nextCourtId, nextDate);
      setSlots(next);
    });
  }

  const { days, monthYearLabel, canGoPrevWeek, dateLabel } = useMemo(() => {
    const mondayOffset = (weekdayOfLocalDate(date) + 6) % 7;
    const weekStart = addDaysLocal(date, -mondayOffset);
    const weekDates = Array.from({ length: 7 }, (_, i) => addDaysLocal(weekStart, i));

    const todayMondayOffset = (weekdayOfLocalDate(today) + 6) % 7;
    const todayWeekStart = addDaysLocal(today, -todayMondayOffset);

    const days: WeekDay[] = weekDates.map((d) => ({
      date: d,
      dayAbbrev: capitalize(format(new Date(`${d}T00:00:00`), "EEE", { locale: es })),
      dayNumber: new Date(`${d}T00:00:00`).getDate(),
      isPast: d < today,
      isSelected: d === date,
    }));

    return {
      days,
      monthYearLabel: format(new Date(`${date}T00:00:00`), "MMMM yyyy", { locale: es }),
      canGoPrevWeek: weekStart > todayWeekStart,
      dateLabel: capitalize(format(new Date(`${date}T00:00:00`), "EEEE d 'de' MMMM", { locale: es })),
    };
  }, [date, today]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-wide text-[#636366] uppercase">Cancha</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[13px] font-medium text-[#111111]">
            {sportEmoji(court.sport)} {sportLabel(court.sport)}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {courts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => reload(c.id, date)}
              className={cn(
                "flex h-12 shrink-0 touch-manipulation items-center justify-center rounded-xl px-4 text-[15px] font-semibold transition-all duration-100 ease-out active:scale-95",
                c.id === courtId
                  ? "bg-[#111111] text-white"
                  : "bg-[#F2F2F7] text-[#111111] active:bg-[#E5E5EA]",
              )}
            >
              {c.name}
              {c.variant ? ` (${c.variant})` : ""}
            </button>
          ))}
        </div>
      </div>

      <WeekStrip
        date={date}
        monthYearLabel={monthYearLabel}
        days={days}
        canGoPrevWeek={canGoPrevWeek}
        onSelectDate={(d) => reload(courtId, d)}
        onPrevWeek={() => reload(courtId, addDaysLocal(date, -7))}
        onNextWeek={() => reload(courtId, addDaysLocal(date, 7))}
      />

      <BookingSlots
        key={`${courtId}|${date}`}
        courtId={courtId}
        courtName={court.name}
        sportBadge={`${sportEmoji(court.sport)} ${sportLabel(court.sport)}`}
        dateLabel={dateLabel}
        slots={slots}
        isLoading={isPending}
      />
    </div>
  );
}
