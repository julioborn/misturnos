import { getActiveEstablishment } from "@/lib/panel/establishment";
import { updateEstablishmentProfile } from "./actions";

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment) return null;
  const canEdit = role === "owner";

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h2 className="text-base font-semibold">Configuración</h2>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Guardado</p>}

      {!canEdit && (
        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Solo el dueño puede editar esta sección.
        </p>
      )}

      <fieldset disabled={!canEdit}>
        <form action={updateEstablishmentProfile} className="flex flex-col gap-3">
          <input
            name="name"
            defaultValue={establishment.name}
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base disabled:bg-gray-50"
          />
          <textarea
            name="description"
            defaultValue={establishment.description ?? ""}
            placeholder="Descripción"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base disabled:bg-gray-50"
          />
          <input
            name="address"
            defaultValue={establishment.address ?? ""}
            placeholder="Dirección"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base disabled:bg-gray-50"
          />
          <input
            name="phone"
            defaultValue={establishment.phone ?? ""}
            placeholder="Teléfono"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base disabled:bg-gray-50"
          />
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Cancelación hasta (horas antes del turno)
            <input
              name="cancel_hours_before"
              type="number"
              min={0}
              defaultValue={establishment.cancel_hours_before}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-base disabled:bg-gray-50"
            />
          </label>
          {canEdit && (
            <button
              type="submit"
              className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-base font-medium text-white active:bg-emerald-700"
            >
              Guardar
            </button>
          )}
        </form>
      </fieldset>
    </div>
  );
}
