import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import {
  updateCourt,
  toggleCourtActive,
  addCourtHour,
  removeCourtHour,
  addCourtPrice,
  removeCourtPrice,
} from "../actions";

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function EditCourtPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment) notFound();
  const canEdit = role === "owner";

  const supabase = await createClient();

  const { data: court } = await supabase
    .from("courts")
    .select("id,name,sport,variant,slot_minutes,default_price,active,establishment_id")
    .eq("id", id)
    .single();

  if (!court || court.establishment_id !== establishment.id) notFound();

  const { data: hours } = await supabase
    .from("court_hours")
    .select("id,weekday,open_time,close_time")
    .eq("court_id", id)
    .order("weekday");

  const { data: prices } = await supabase
    .from("court_prices")
    .select("id,weekday,from_time,to_time,price")
    .eq("court_id", id)
    .order("weekday");

  const updateWithId = updateCourt.bind(null, court.id);
  const toggleWithId = toggleCourtActive.bind(null, court.id, !court.active);
  const addHourWithId = addCourtHour.bind(null, court.id);
  const addPriceWithId = addCourtPrice.bind(null, court.id);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{court.name}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              court.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
            }`}
          >
            {court.active ? "Activa" : "Inactiva"}
          </span>
        </div>

        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {ok && <p className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Guardado</p>}

        {canEdit && (
          <>
            <form action={toggleWithId} className="mb-3">
              <button className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium">
                {court.active ? "Desactivar cancha" : "Activar cancha"}
              </button>
            </form>

            <form action={updateWithId} className="flex flex-col gap-3">
              <input
                name="name"
                defaultValue={court.name}
                required
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              />
              <select
                name="sport"
                defaultValue={court.sport}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              >
                <option value="padel">Pádel</option>
                <option value="futbol">Fútbol</option>
              </select>
              <input
                name="variant"
                defaultValue={court.variant ?? ""}
                placeholder="Variante (opcional)"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
              />
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Duración del turno (minutos)
                <input
                  name="slot_minutes"
                  type="number"
                  min={15}
                  max={480}
                  defaultValue={court.slot_minutes}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Precio por defecto
                <input
                  name="default_price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={court.default_price}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
                />
              </label>
              <button
                type="submit"
                className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-base font-medium text-white active:bg-emerald-700"
              >
                Guardar
              </button>
            </form>
          </>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Horarios</h3>
        <div className="mb-3 flex flex-col gap-1">
          {(hours ?? []).map((h) => {
            const removeWithIds = removeCourtHour.bind(null, court.id, h.id);
            return (
              <div key={h.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <span>
                  {WEEKDAYS[h.weekday]}: {h.open_time.slice(0, 5)} – {h.close_time.slice(0, 5)}
                </span>
                {canEdit && (
                  <form action={removeWithIds}>
                    <button className="text-xs text-red-600 underline">Quitar</button>
                  </form>
                )}
              </div>
            );
          })}
          {(hours ?? []).length === 0 && (
            <p className="text-xs text-gray-500">Sin horarios cargados — la cancha no va a tener turnos disponibles.</p>
          )}
        </div>
        {canEdit && (
          <form action={addHourWithId} className="flex flex-wrap items-end gap-2">
            <select name="weekday" required className="rounded-lg border border-gray-300 px-2 py-2 text-sm">
              {WEEKDAYS.map((w, i) => (
                <option key={i} value={i}>{w}</option>
              ))}
            </select>
            <input type="time" name="open_time" required className="rounded-lg border border-gray-300 px-2 py-2 text-sm" />
            <input type="time" name="close_time" required className="rounded-lg border border-gray-300 px-2 py-2 text-sm" />
            <button type="submit" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium">
              + Agregar
            </button>
          </form>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Precios por franja</h3>
        <p className="mb-2 text-xs text-gray-500">
          Si no cargás ninguno, se usa el precio por defecto de la cancha.
        </p>
        <div className="mb-3 flex flex-col gap-1">
          {(prices ?? []).map((p) => {
            const removeWithIds = removeCourtPrice.bind(null, court.id, p.id);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <span>
                  {p.weekday === null ? "Todos los días" : WEEKDAYS[p.weekday]}: {p.from_time.slice(0, 5)} – {p.to_time.slice(0, 5)} · ${p.price}
                </span>
                {canEdit && (
                  <form action={removeWithIds}>
                    <button className="text-xs text-red-600 underline">Quitar</button>
                  </form>
                )}
              </div>
            );
          })}
          {(prices ?? []).length === 0 && (
            <p className="text-xs text-gray-500">Sin franjas de precio cargadas.</p>
          )}
        </div>
        {canEdit && (
          <form action={addPriceWithId} className="flex flex-wrap items-end gap-2">
            <select name="weekday" className="rounded-lg border border-gray-300 px-2 py-2 text-sm">
              <option value="">Todos los días</option>
              {WEEKDAYS.map((w, i) => (
                <option key={i} value={i}>{w}</option>
              ))}
            </select>
            <input type="time" name="from_time" required className="rounded-lg border border-gray-300 px-2 py-2 text-sm" />
            <input type="time" name="to_time" required className="rounded-lg border border-gray-300 px-2 py-2 text-sm" />
            <input
              type="number"
              name="price"
              min={0}
              step="0.01"
              placeholder="Precio"
              required
              className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium">
              + Agregar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
