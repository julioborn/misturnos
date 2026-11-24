import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { blockPlayer, unblockPlayer } from "./actions";

export default async function JugadoresPage() {
  const { establishment } = await getActiveEstablishment();
  if (!establishment) return null;

  const supabase = await createClient();

  const { data: blocks } = await supabase
    .from("establishment_player_blocks")
    .select("user_id,reason,created_at")
    .eq("establishment_id", establishment.id);

  const { data: noShows } = await supabase
    .from("player_no_shows")
    .select("user_id,no_shows,last_no_show")
    .eq("establishment_id", establishment.id)
    .order("no_shows", { ascending: false });

  const blockedIds = new Set((blocks ?? []).map((b) => b.user_id));
  const relevantIds = [...new Set([...(blocks ?? []).map((b) => b.user_id), ...(noShows ?? []).map((n) => n.user_id)])];

  const nameByUser = new Map<string, { name: string | null; phone: string | null }>();
  if (relevantIds.length > 0) {
    const { data: recentBookings } = await supabase
      .from("bookings")
      .select("user_id,guest_name,guest_phone,created_at")
      .eq("establishment_id", establishment.id)
      .in("user_id", relevantIds)
      .order("created_at", { ascending: false });

    for (const b of recentBookings ?? []) {
      if (b.user_id && !nameByUser.has(b.user_id)) {
        nameByUser.set(b.user_id, { name: b.guest_name, phone: b.guest_phone });
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-base font-semibold">Ausentes</h2>
        <div className="flex flex-col gap-2">
          {(noShows ?? []).map((n) => {
            const info = nameByUser.get(n.user_id!);
            const blockWithId = blockPlayer.bind(null, n.user_id!);
            return (
              <div key={n.user_id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                <div className="flex flex-col text-sm">
                  <span>{info?.name ?? "Jugador"}{info?.phone ? ` · ${info.phone}` : ""}</span>
                  <span className="text-xs text-gray-500">{n.no_shows} ausencias</span>
                </div>
                {!blockedIds.has(n.user_id!) && (
                  <form action={blockWithId}>
                    <button className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700">
                      Bloquear
                    </button>
                  </form>
                )}
              </div>
            );
          })}
          {(noShows ?? []).length === 0 && (
            <p className="text-sm text-gray-500">Sin ausencias registradas.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold">Jugadores bloqueados</h2>
        <div className="flex flex-col gap-2">
          {(blocks ?? []).map((b) => {
            const info = nameByUser.get(b.user_id);
            const unblockWithId = unblockPlayer.bind(null, b.user_id);
            return (
              <div key={b.user_id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                <div className="flex flex-col text-sm">
                  <span>{info?.name ?? "Jugador"}{info?.phone ? ` · ${info.phone}` : ""}</span>
                  {b.reason && <span className="text-xs text-gray-500">{b.reason}</span>}
                </div>
                <form action={unblockWithId}>
                  <button className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium">
                    Desbloquear
                  </button>
                </form>
              </div>
            );
          })}
          {(blocks ?? []).length === 0 && (
            <p className="text-sm text-gray-500">No bloqueaste a ningún jugador.</p>
          )}
        </div>
      </div>
    </div>
  );
}
