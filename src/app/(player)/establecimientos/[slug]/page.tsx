import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { todayLocal, utcToLocal, addDaysLocal, weekdayOfLocalDate } from "@/lib/time/argentina";
import { sportLabel, sportEmoji } from "@/lib/sports";
import { cn } from "@/lib/utils";
import { WeekStrip, type WeekDay } from "@/components/player/week-strip";
import { BookingSlots, type BookingSlot } from "@/components/player/booking-slots";

type AvailabilityRow = { starts_at: string; ends_at: string; is_free: boolean; price: number };

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR").format(Math.round(price));
}

export default async function EstablishmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ court?: string; date?: string }>;
}) {
  const { slug } = await params;
  const { court: courtParam, date: dateParam } = await searchParams;

  const supabase = await createClient();
  const { data: establishment } = await supabase
    .from("establishments")
    .select("id,name,address,photos,logo_url")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!establishment) notFound();

  const { data: courts } = await supabase
    .from("courts")
    .select("id,name,sport,variant")
    .eq("establishment_id", establishment.id)
    .eq("active", true)
    .order("sort_order");

  if (!courts || courts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <h1 className="text-2xl font-bold">{establishment.name}</h1>
        <p className="mt-4 text-base text-muted-foreground">Esta cancha todavía no tiene canchas cargadas.</p>
      </div>
    );
  }

  const courtId = courtParam && courts.some((c) => c.id === courtParam) ? courtParam : courts[0].id;
  const court = courts.find((c) => c.id === courtId)!;
  const date = dateParam ?? todayLocal();
  const today = todayLocal();
  const dateLabel = capitalize(format(new Date(`${date}T00:00:00`), "EEEE d 'de' MMMM", { locale: es }));

  // Semana (lunes a domingo) que contiene la fecha seleccionada.
  const mondayOffset = (weekdayOfLocalDate(date) + 6) % 7;
  const weekStart = addDaysLocal(date, -mondayOffset);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDaysLocal(weekStart, i));

  const todayMondayOffset = (weekdayOfLocalDate(today) + 6) % 7;
  const todayWeekStart = addDaysLocal(today, -todayMondayOffset);
  const canGoPrevWeek = weekStart > todayWeekStart;

  const days: WeekDay[] = weekDates.map((d) => ({
    date: d,
    dayAbbrev: capitalize(format(new Date(`${d}T00:00:00`), "EEE", { locale: es })),
    dayNumber: new Date(`${d}T00:00:00`).getDate(),
    isPast: d < today,
    isSelected: d === date,
  }));

  const monthYearLabel = format(new Date(`${date}T00:00:00`), "MMMM yyyy", { locale: es });

  const { data: availability } = await supabase.rpc("get_availability", {
    p_court: courtId,
    p_day: date,
  });

  const rawSlots = (availability ?? []) as AvailabilityRow[];
  const slots: BookingSlot[] = rawSlots.map((slot) => {
    const { time: startTime } = utcToLocal(new Date(slot.starts_at));
    const { time: endTime } = utcToLocal(new Date(slot.ends_at));
    return {
      startsAt: slot.starts_at,
      startTime,
      endTime,
      price: formatPrice(slot.price),
      isFree: slot.is_free,
    };
  });

  const image = establishment.photos?.[0] ?? establishment.logo_url ?? null;
  const sportBadge = `${sportEmoji(court.sport)} ${sportLabel(court.sport)}`;

  return (
    <div
      className="mx-auto flex max-w-2xl flex-col gap-6 bg-[#F2F2F7] p-4 sm:p-6"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
    >
      <div className="relative flex items-center justify-center">
        <Link
          href="/"
          className="absolute left-0 flex size-9 touch-manipulation items-center justify-center rounded-full text-[#111111] active:bg-[#E5E5EA]"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-[18px] font-semibold text-[#111111]">Reservar turno</h1>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E5E5EA]">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={establishment.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[18px] font-semibold text-[#111111]">{establishment.name}</span>
          {establishment.address && (
            <span className="flex items-center gap-1 truncate text-[14px] text-[#636366]">
              <MapPin className="size-3.5 shrink-0" />
              {establishment.address}
            </span>
          )}
          <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[13px] font-medium text-[#111111]">
            {sportBadge}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-[20px] font-semibold text-[#111111]">1. Elegí la cancha</h2>
        <div className="flex gap-2 overflow-x-auto">
          {courts.map((c) => (
            <Link
              key={c.id}
              href={`?court=${c.id}&date=${date}`}
              className={cn(
                "flex h-12 shrink-0 touch-manipulation items-center justify-center rounded-xl px-4 text-[15px] font-semibold transition-all duration-100 ease-out active:scale-95",
                c.id === courtId
                  ? "bg-[#111111] text-white"
                  : "bg-[#F2F2F7] text-[#111111] active:bg-[#E5E5EA]",
              )}
            >
              {c.name}
              {c.variant ? ` (${c.variant})` : ""}
            </Link>
          ))}
        </div>
      </div>

      <WeekStrip
        courtId={courtId}
        date={date}
        monthYearLabel={monthYearLabel}
        days={days}
        prevWeekDate={addDaysLocal(date, -7)}
        nextWeekDate={addDaysLocal(date, 7)}
        canGoPrevWeek={canGoPrevWeek}
      />

      <BookingSlots
        key={`${courtId}|${date}`}
        courtId={courtId}
        courtName={court.name}
        sportBadge={sportBadge}
        dateLabel={dateLabel}
        slots={slots}
      />
    </div>
  );
}
