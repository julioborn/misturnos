import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { createStaffMember, removeStaffMember } from "./actions";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment) return null;
  if (role !== "owner") redirect("/panel");

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("establishment_members")
    .select("user_id")
    .eq("establishment_id", establishment.id)
    .eq("role", "staff");

  const staffIds = (members ?? []).map((m) => m.user_id);

  const infoById = new Map<string, { name: string | null; phone: string | null }>();
  if (staffIds.length > 0) {
    const adminClient = createAdminClient();
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id,full_name,phone")
      .in("id", staffIds);
    for (const p of profiles ?? []) {
      infoById.set(p.id, { name: p.full_name, phone: p.phone });
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h2 className="mb-2 text-base font-semibold">Staff</h2>
        <div className="flex flex-col gap-2">
          {staffIds.map((id) => {
            const info = infoById.get(id);
            const removeWithId = removeStaffMember.bind(null, id);
            return (
              <div key={id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                <span className="text-sm">
                  {info?.name ?? "Staff"}{info?.phone ? ` · ${info.phone}` : ""}
                </span>
                <form action={removeWithId}>
                  <button className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700">
                    Quitar
                  </button>
                </form>
              </div>
            );
          })}
          {staffIds.length === 0 && (
            <p className="text-sm text-gray-500">Todavía no sumaste staff.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Agregar staff</h3>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form action={createStaffMember} className="flex flex-col gap-3">
          <input
            name="full_name"
            placeholder="Nombre y apellido"
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="dni"
            inputMode="numeric"
            placeholder="DNI (sin puntos, para entrar)"
            required
            pattern="\d{7,8}"
            title="7 u 8 números, sin puntos"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="phone"
            placeholder="Teléfono (opcional)"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <input
            name="password"
            type="text"
            placeholder="Contraseña"
            required
            minLength={6}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          />
          <button
            type="submit"
            className="mt-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-base font-medium text-white active:bg-emerald-700"
          >
            Agregar
          </button>
        </form>
      </div>
    </div>
  );
}
