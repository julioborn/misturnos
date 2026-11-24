import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { todayLocal, utcToLocal } from "@/lib/time/argentina";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePickerNav } from "@/components/player/date-picker-nav";
import { ReservarDialog } from "@/components/player/reservar-dialog";

type AvailabilityRow = { starts_at: string; ends_at: string; is_free: boolean; price: number };

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
    .select("id,name,description,address,phone")
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
  const dateLabel = format(new Date(`${date}T00:00:00`), "EEEE d 'de' MMMM", { locale: es });

  const { data: availability } = await supabase.rpc("get_availability", {
    p_court: courtId,
    p_day: date,
  });

  const slots = (availability ?? []) as AvailabilityRow[];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">{establishment.name}</h1>
        {establishment.address && (
          <p className="text-base text-muted-foreground">{establishment.address}</p>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold">Canchas disponibles</h2>
        <div className="flex flex-wrap gap-2">
          {courts.map((c) => (
            <a key={c.id} href={`?court=${c.id}&date=${date}`}>
              <Badge
                variant={c.id === courtId ? "default" : "outline"}
                className="h-11 cursor-pointer px-4 text-base"
              >
                {c.name}
                {c.variant ? ` · ${c.variant}` : ""}
              </Badge>
            </a>
          ))}
        </div>
      </div>

      <DatePickerNav courtId={courtId} date={date} label={dateLabel} />

      <div className="flex flex-col gap-2">
        {slots.map((slot) => {
          const { time: startTime } = utcToLocal(new Date(slot.starts_at));
          const { time: endTime } = utcToLocal(new Date(slot.ends_at));

          return (
            <div
              key={slot.starts_at}
              className="flex items-center justify-between rounded-lg border px-4 py-3.5"
            >
              <span className="text-base">
                {startTime} – {endTime} · ${slot.price}
              </span>
              {slot.is_free ? (
                <ReservarDialog
                  courtId={courtId}
                  courtName={court.name}
                  startsAt={slot.starts_at}
                  startLabel={startTime}
                  endLabel={endTime}
                  price={slot.price}
                />
              ) : (
                <Button variant="secondary" className="h-11 px-5 text-base" disabled>
                  Ocupado
                </Button>
              )}
            </div>
          );
        })}

        {slots.length === 0 && (
          <p className="py-10 text-center text-base text-muted-foreground">
            No hay horarios cargados para este día.
          </p>
        )}
      </div>
    </div>
  );
}
