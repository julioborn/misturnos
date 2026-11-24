import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEstablishment, toggleActive } from "../actions";

export default async function EditEstablishmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;

  const supabase = await createClient();
  const { data: establishment } = await supabase
    .from("establishments")
    .select("id,name,slug,description,address,phone,cancel_hours_before,active")
    .eq("id", id)
    .single();

  if (!establishment) notFound();

  const updateWithId = updateEstablishment.bind(null, establishment.id);
  const toggleWithId = toggleActive.bind(null, establishment.id, !establishment.active);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{establishment.name}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            establishment.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
          }`}
        >
          {establishment.active ? "Activo" : "Suspendido"}
        </span>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Guardado</p>}

      <form action={toggleWithId}>
        <button className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium">
          {establishment.active ? "Suspender establecimiento" : "Activar establecimiento"}
        </button>
      </form>

      <form action={updateWithId} className="flex flex-col gap-3">
        <input
          name="name"
          defaultValue={establishment.name}
          required
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <input
          name="slug"
          defaultValue={establishment.slug}
          required
          pattern="[a-z0-9-]+"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <textarea
          name="description"
          defaultValue={establishment.description ?? ""}
          placeholder="Descripción"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <input
          name="address"
          defaultValue={establishment.address ?? ""}
          placeholder="Dirección"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <input
          name="phone"
          defaultValue={establishment.phone ?? ""}
          placeholder="Teléfono"
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
        />
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          Cancelación hasta (horas antes)
          <input
            name="cancel_hours_before"
            type="number"
            min={0}
            defaultValue={establishment.cancel_hours_before}
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
    </div>
  );
}
