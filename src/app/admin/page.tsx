import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { toggleActive } from "./actions";

export default async function AdminEstablishmentsPage() {
  const supabase = await createClient();

  const { data: establishments } = await supabase
    .from("establishments")
    .select("id,name,slug,active,created_at")
    .order("created_at", { ascending: false });

  const ids = (establishments ?? []).map((e) => e.id);

  const { data: members } = ids.length
    ? await supabase
        .from("establishment_members")
        .select("establishment_id,user_id")
        .eq("role", "owner")
        .in("establishment_id", ids)
    : { data: [] as { establishment_id: string; user_id: string }[] };

  const ownerIds = [...new Set((members ?? []).map((m) => m.user_id))];

  const { data: profiles } = ownerIds.length
    ? await supabase.from("profiles").select("id,full_name").in("id", ownerIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const adminClient = createAdminClient();
  const emailById = new Map<string, string>();
  await Promise.all(
    ownerIds.map(async (id) => {
      const { data } = await adminClient.auth.admin.getUserById(id);
      if (data.user?.email) emailById.set(id, data.user.email);
    }),
  );

  const ownerByEstablishment = new Map<string, { name: string | null; email: string | null }>();
  for (const m of members ?? []) {
    const profile = (profiles ?? []).find((p) => p.id === m.user_id);
    ownerByEstablishment.set(m.establishment_id, {
      name: profile?.full_name ?? null,
      email: emailById.get(m.user_id) ?? null,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Establecimientos</h2>
        <Link
          href="/admin/nuevo"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
        >
          + Nuevo
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {(establishments ?? []).map((est) => {
          const owner = ownerByEstablishment.get(est.id);
          const toggle = toggleActive.bind(null, est.id, !est.active);
          return (
            <div
              key={est.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3"
            >
              <Link href={`/admin/${est.id}`} className="flex flex-col">
                <span className="font-medium">{est.name}</span>
                <span className="text-xs text-gray-500">
                  /{est.slug} · {owner?.name || owner?.email || "sin dueño"}
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    est.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {est.active ? "Activo" : "Suspendido"}
                </span>
                <form action={toggle}>
                  <button className="text-xs font-medium text-gray-500 underline">
                    {est.active ? "Suspender" : "Activar"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {(establishments ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">Todavía no hay establecimientos.</p>
        )}
      </div>
    </div>
  );
}
