import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { todayLocal, addDaysLocal, utcToLocal } from "@/lib/time/argentina";
import { cancelBooking, markNoShow } from "./turnos/actions";

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
        <p className="text-sm text-gray-500">Todavía no hay canchas activas.</p>
        {role === "owner" && (
          <Link href="/panel/canchas/nueva" className="text-sm font-medium text-emerald-700 underline">
            Crear una cancha
          </Link>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {courts.map((c) => (
          <Link
            key={c.id}
            href={`/panel?court=${c.id}&date=${date}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              c.id === courtId ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/panel?court=${courtId}&date=${addDaysLocal(date, -1)}`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          ← Anterior
        </Link>
        <span className="text-sm font-medium">{date}</span>
        <Link
          href={`/panel?court=${courtId}&date=${addDaysLocal(date, 1)}`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          Siguiente →
        </Link>
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
              <div key={slot.starts_at} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                <span className="text-sm">
                  {startTime} – {endTime} · ${slot.price}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/panel/turnos/nuevo?court=${courtId}&starts_at=${encodeURIComponent(slot.starts_at)}&ends_at=${encodeURIComponent(slot.ends_at)}&price=${slot.price}&mode=manual`}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    Reservar
                  </Link>
                  <Link
                    href={`/panel/turnos/nuevo?court=${courtId}&starts_at=${encodeURIComponent(slot.starts_at)}&ends_at=${encodeURIComponent(slot.ends_at)}&mode=block`}
                    className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium"
                  >
                    Bloquear
                  </Link>
                </div>
              </div>
            );
          }

          const cancelAction = booking ? cancelBooking.bind(null, courtId, slot.starts_at, booking.id) : null;
          const noShowAction = booking ? markNoShow.bind(null, courtId, slot.starts_at, booking.id) : null;
          const statusLabel = booking ? STATUS_LABEL[booking.status] ?? booking.status : "Pasado";

          return (
            <div key={slot.starts_at} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <div className="flex flex-col text-sm">
                <span>
                  {startTime} – {endTime} · {statusLabel}
                </span>
                {booking?.guest_name && (
                  <span className="text-xs text-gray-500">
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
                      <button className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium">
                        Ausente
                      </button>
                    </form>
                  )}
                  <form action={cancelAction!}>
                    <button className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700">
                      {booking.status === "blocked" ? "Desbloquear" : "Cancelar"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}

        {slots.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            Esta cancha no tiene horarios cargados para este día.
          </p>
        )}
      </div>
    </div>
  );
}
