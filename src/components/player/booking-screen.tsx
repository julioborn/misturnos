"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { todayLocal, addDaysLocal, weekdayOfLocalDate } from "@/lib/time/argentina";
import { SPORT_META, sportLabel, sportEmoji } from "@/lib/sports";
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
  const [selectedSport, setSelectedSport] = useState(court.sport);
  const today = todayLocal();

  const sports = Object.keys(SPORT_META).filter((key) => courts.some((c) => c.sport === key));
  const visibleCourts = sports.length > 1 ? courts.filter((c) => c.sport === selectedSport) : courts;

  function reload(nextCourtId: string, nextDate: string) {
    setCourtId(nextCourtId);
    setDate(nextDate);
    startTransition(async () => {
      const { slots: next } = await getAvailabilityAction(nextCourtId, nextDate);
      setSlots(next);
    });
  }

  function selectSport(sport: string) {
    setSelectedSport(sport);
    const firstCourt = courts.find((c) => c.sport === sport);
    if (firstCourt) reload(firstCourt.id, date);
  }

  const { days, monthYearLabel, canGoPrevWeek, dateLabel } = useMemo(() => {
    // Semana (lunes a domingo) que contiene la fecha elegida — siempre una
    // fila completa de lunes a domingo, nunca una ventana corrida de 7 días.
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
      {sports.length > 1 && (
        <div className="flex justify-center gap-2">
          {sports.map((s) => {
            const isSelected = s === selectedSport;
            return (
              <button
                key={s}
                type="button"
                onClick={() => selectSport(s)}
                className={cn(
                  "flex h-14 w-20 shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-100 ease-out active:scale-95",
                  isSelected
                    ? "bg-[#111111] text-white"
                    : "bg-[#F2F2F7] text-[#111111] active:bg-[#E5E5EA]",
                )}
              >
                <span className="text-[24px] leading-none">{sportEmoji(s)}</span>
                <span className="text-[11px] font-medium leading-none">{sportLabel(s)}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-center gap-2 overflow-x-auto">
        {visibleCourts.map((c) => {
          const isSelected = c.id === courtId;
          const subtitle = c.variant ?? (sports.length <= 1 ? `${sportEmoji(c.sport)} ${sportLabel(c.sport)}` : null);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => reload(c.id, date)}
              className={cn(
                "flex h-14 shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl px-4 transition-all duration-100 ease-out active:scale-95",
                isSelected
                  ? "bg-[#111111] text-white"
                  : "bg-[#F2F2F7] text-[#111111] active:bg-[#E5E5EA]",
              )}
            >
              <span className="text-[15px] font-semibold">{c.name}</span>
              {subtitle && (
                <span className={cn("text-[11px]", isSelected ? "text-white/70" : "text-[#636366]")}>
                  {subtitle}
                </span>
              )}
            </button>
          );
        })}
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
