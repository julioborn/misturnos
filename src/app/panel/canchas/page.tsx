import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";

export default async function CanchasPage() {
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment) return null;

  const supabase = await createClient();
  const { data: courts } = await supabase
    .from("courts")
    .select("id,name,sport,variant,slot_minutes,default_price,active")
    .eq("establishment_id", establishment.id)
    .order("sort_order");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Canchas</h2>
        {role === "owner" && (
          <Link href="/panel/canchas/nueva" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
            + Nueva
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {(courts ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/panel/canchas/${c.id}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3"
          >
            <div className="flex flex-col">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-gray-500">
                {c.sport === "padel" ? "Pádel" : "Fútbol"}
                {c.variant ? ` · ${c.variant}` : ""} · {c.slot_minutes} min · ${c.default_price}
              </span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                c.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {c.active ? "Activa" : "Inactiva"}
            </span>
          </Link>
        ))}

        {(courts ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">Todavía no cargaste canchas.</p>
        )}
      </div>
    </div>
  );
}
