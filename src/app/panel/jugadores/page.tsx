import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { blockPlayer, unblockPlayer } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h2 className="mb-2 text-base font-semibold">Ausentes</h2>
        <div className="flex flex-col gap-2">
          {(noShows ?? []).map((n) => {
            const info = nameByUser.get(n.user_id!);
            const blockWithId = blockPlayer.bind(null, n.user_id!);
            return (
              <Card key={n.user_id} className="flex-row items-center justify-between gap-3 px-4 py-3">
                <div className="flex flex-col text-sm">
                  <span>{info?.name ?? "Jugador"}{info?.phone ? ` · ${info.phone}` : ""}</span>
                  <span className="text-xs text-muted-foreground">{n.no_shows} ausencias</span>
                </div>
                {!blockedIds.has(n.user_id!) && (
                  <form action={blockWithId}>
                    <Button type="submit" variant="outline" size="sm" className="text-destructive">
                      Bloquear
                    </Button>
                  </form>
                )}
              </Card>
            );
          })}
          {(noShows ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Sin ausencias registradas.</p>
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
              <Card key={b.user_id} className="flex-row items-center justify-between gap-3 px-4 py-3">
                <div className="flex flex-col text-sm">
                  <span>{info?.name ?? "Jugador"}{info?.phone ? ` · ${info.phone}` : ""}</span>
                  {b.reason && <span className="text-xs text-muted-foreground">{b.reason}</span>}
                </div>
                <form action={unblockWithId}>
                  <Button type="submit" variant="outline" size="sm">
                    Desbloquear
                  </Button>
                </form>
              </Card>
            );
          })}
          {(blocks ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No bloqueaste a ningún jugador.</p>
          )}
        </div>
      </div>
    </div>
  );
}
