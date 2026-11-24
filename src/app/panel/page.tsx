import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { todayLocal, addDaysLocal, utcToLocal } from "@/lib/time/argentina";
import { cancelBooking, markNoShow } from "./turnos/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type AvailabilityRow = { starts_at: string; ends_at: string; is_free: boolean; price: number };
type BookingRow = {
  id: string;
  starts_at: string;
  status: string;
  source: string;
  guest_name: string | null;
  guest_phone: string | null;
  note: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Reservado",
  blocked: "Bloqueado",
  no_show: "Ausente",
  completed: "Completado",
  cancelled: "Cancelado",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ court?: string; date?: string }>;
}) {
  const { court: courtParam, date: dateParam } = await searchParams;
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment) return null;

  const supabase = await createClient();
  const { data: courts } = await supabase
    .from("courts")
    .select("id,name,sport,active")
    .eq("establishment_id", establishment.id)
    .eq("active", true)
    .order("sort_order");

  if (!courts || courts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">Todavía no hay canchas activas.</p>
        {role === "owner" && (
          <Button variant="outline" size="sm" render={<Link href="/panel/canchas/nueva" />}>
            Crear una cancha
          </Button>
        )}
      </div>
    );
  }

  const courtId = courtParam && courts.some((c) => c.id === courtParam) ? courtParam : courts[0].id;
  const date = dateParam ?? todayLocal();
  // Servidor sin cache de componentes: la hora actual es dato legítimo para
  // decidir si un turno ya empezó, no un problema de pureza de render.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const { data: availability } = await supabase.rpc("get_availability", {
    p_court: courtId,
    p_day: date,
  });

  const slots = (availability ?? []) as AvailabilityRow[];

  let bookings: BookingRow[] = [];
  if (slots.length > 0) {
    const { data } = await supabase
      .from("bookings")
      .select("id,starts_at,status,source,guest_name,guest_phone,note")
      .eq("court_id", courtId)
      .neq("status", "cancelled")
      .gte("starts_at", slots[0].starts_at)
      .lte("starts_at", slots[slots.length - 1].starts_at);
    bookings = data ?? [];
  }

  const bookingByStart = new Map(bookings.map((b) => [new Date(b.starts_at).getTime(), b]));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {courts.map((c) => (
          <Link key={c.id} href={`/panel?court=${c.id}&date=${date}`}>
            <Badge variant={c.id === courtId ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" render={<Link href={`/panel?court=${courtId}&date=${addDaysLocal(date, -1)}`} />}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">{date}</span>
        <Button variant="outline" size="icon" render={<Link href={`/panel?court=${courtId}&date=${addDaysLocal(date, 1)}`} />}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {slots.map((slot) => {
          const start = new Date(slot.starts_at);
          const booking = bookingByStart.get(start.getTime());
          const { time: startTime } = utcToLocal(start);
          const { time: endTime } = utcToLocal(new Date(slot.ends_at));
          const started = start.getTime() <= now;

          if (slot.is_free) {
            return (
              <Card key={slot.starts_at} className="flex-row items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm">
                  {startTime} – {endTime} · ${slot.price}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    render={
                      <Link
                        href={`/panel/turnos/nuevo?court=${courtId}&starts_at=${encodeURIComponent(slot.starts_at)}&ends_at=${encodeURIComponent(slot.ends_at)}&price=${slot.price}&mode=manual`}
                      />
                    }
                  >
                    Reservar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    render={
                      <Link
                        href={`/panel/turnos/nuevo?court=${courtId}&starts_at=${encodeURIComponent(slot.starts_at)}&ends_at=${encodeURIComponent(slot.ends_at)}&mode=block`}
                      />
                    }
                  >
                    Bloquear
                  </Button>
                </div>
              </Card>
            );
          }

          const cancelAction = booking ? cancelBooking.bind(null, courtId, slot.starts_at, booking.id) : null;
          const noShowAction = booking ? markNoShow.bind(null, courtId, slot.starts_at, booking.id) : null;
          const statusLabel = booking ? STATUS_LABEL[booking.status] ?? booking.status : "Pasado";

          return (
            <Card key={slot.starts_at} className="flex-row items-center justify-between gap-3 bg-muted/40 px-4 py-3">
              <div className="flex flex-col text-sm">
                <span>
                  {startTime} – {endTime} · {statusLabel}
                </span>
                {booking?.guest_name && (
                  <span className="text-xs text-muted-foreground">
                    {booking.guest_name}
                    {booking.guest_phone ? ` · ${booking.guest_phone}` : ""}
                    {booking.source === "manual" ? " (manual)" : ""}
                  </span>
                )}
              </div>
              {booking && (booking.status === "confirmed" || booking.status === "blocked") && (
                <div className="flex gap-2">
                  {booking.status === "confirmed" && started && (
                    <form action={noShowAction!}>
                      <Button type="submit" variant="outline" size="sm">
                        Ausente
                      </Button>
                    </form>
                  )}
                  <form action={cancelAction!}>
                    <Button type="submit" variant="outline" size="sm" className="text-destructive">
                      {booking.status === "blocked" ? "Desbloquear" : "Cancelar"}
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          );
        })}

        {slots.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Esta cancha no tiene horarios cargados para este día.
          </p>
        )}
      </div>
    </div>
  );
}
