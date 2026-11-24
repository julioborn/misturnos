import { redirect } from "next/navigation";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { createCourt } from "../actions";

export default async function NuevaCanchaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { role } = await getActiveEstablishment();
  if (role !== "owner") redirect("/panel/canchas");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h2 className="text-base font-semibold">Nueva cancha</h2>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form action={createCourt} className="flex flex-col gap-3">
        <input
          name="name"
          placeholder="Nombre (ej: Cancha 1)"
          required
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <select name="sport" className="rounded-lg border border-gray-300 px-3 py-2.5 text-base">
          <option value="padel">Pádel</option>
          <option value="futbol">Fútbol</option>
        </select>
        <input
          name="variant"
          placeholder="Variante (ej: F5, techada) — opcional"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Duración del turno (minutos)
          <input
            name="slot_minutes"
            type="number"
            min={15}
            max={480}
            defaultValue={90}
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
            defaultValue={0}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
        </label>
        <button
          type="submit"
          className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-base font-medium text-white active:bg-emerald-700"
        >
          Crear
        </button>
      </form>
    </div>
  );
}
