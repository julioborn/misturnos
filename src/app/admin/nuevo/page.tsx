import { createEstablishment } from "../actions";

export default async function NuevoEstablecimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h2 className="text-base font-semibold">Nuevo establecimiento</h2>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form action={createEstablishment} className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-gray-700">Establecimiento</legend>
          <input
            name="name"
            placeholder="Nombre (ej: Padel Club Río)"
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="slug"
            placeholder="Slug (ej: padel-club-rio)"
            required
            pattern="[a-z0-9-]+"
            title="Solo minúsculas, números y guiones"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="address"
            placeholder="Dirección (opcional)"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="phone"
            placeholder="Teléfono (opcional)"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Cancelación hasta (horas antes)
            <input
              name="cancel_hours_before"
              type="number"
              min={0}
              defaultValue={4}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
            />
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-gray-700">Dueño</legend>
          <input
            name="owner_full_name"
            placeholder="Nombre y apellido"
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="owner_dni"
            inputMode="numeric"
            placeholder="DNI (sin puntos, para entrar)"
            required
            pattern="\d{7,8}"
            title="7 u 8 números, sin puntos"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="owner_phone"
            placeholder="Teléfono (opcional)"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="owner_email"
            type="email"
            placeholder="Email"
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="owner_password"
            type="text"
            placeholder="Contraseña"
            required
            minLength={6}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
        </fieldset>

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
