import { redirect } from "next/navigation";
import { utcToLocal } from "@/lib/time/argentina";
import { createManualBooking, blockSlot } from "../actions";

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{
    court?: string;
    starts_at?: string;
    ends_at?: string;
    price?: string;
    mode?: string;
    error?: string;
  }>;
}) {
  const { court, starts_at, ends_at, price, mode, error } = await searchParams;
  if (!court || !starts_at || !ends_at) redirect("/panel");

  const isBlock = mode === "block";
  const { date, time } = utcToLocal(new Date(starts_at));
  const endTime = utcToLocal(new Date(ends_at)).time;

  const action = isBlock
    ? blockSlot.bind(null, court, starts_at, ends_at)
    : createManualBooking.bind(null, court, starts_at, ends_at, Number(price ?? 0));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h2 className="text-base font-semibold">
        {isBlock ? "Bloquear horario" : "Reserva manual"}
      </h2>
      <p className="text-sm text-gray-500">
        {date} · {time} – {endTime}
        {!isBlock && price ? ` · $${price}` : ""}
      </p>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form action={action} className="flex flex-col gap-3">
        {!isBlock && (
          <>
            <input
              name="guest_name"
              placeholder="Nombre"
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            />
            <input
              name="guest_phone"
              placeholder="Teléfono (opcional)"
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            />
          </>
        )}
        <input
          name="note"
          placeholder="Nota (opcional)"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <button
          type="submit"
          className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-base font-medium text-white active:bg-emerald-700"
        >
          {isBlock ? "Bloquear" : "Reservar"}
        </button>
      </form>
    </div>
  );
}
