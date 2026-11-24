import { createClient } from "@/lib/supabase/server";
import { utcToLocal } from "@/lib/time/argentina";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancelarButton } from "@/components/player/cancelar-button";

type Row = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  source: string;
  price: number | null;
  courts: { name: string } | null;
  establishments: { name: string; cancel_hours_before: number } | null;
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  no_show: "Ausente",
  completed: "Completado",
  blocked: "Bloqueado",
};

function BookingCard({ booking, showCancel }: { booking: Row; showCancel: boolean }) {
  const { date, time } = utcToLocal(new Date(booking.starts_at));
  const endTime = utcToLocal(new Date(booking.ends_at)).time;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{booking.establishments?.name}</span>
          <span className="text-sm text-muted-foreground">
            {booking.courts?.name} · {date} · {time} – {endTime}
          </span>
          {booking.price != null && (
            <span className="text-sm text-muted-foreground">${booking.price}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
            {STATUS_LABEL[booking.status] ?? booking.status}
          </Badge>
          {showCancel && <CancelarButton bookingId={booking.id} />}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function MisTurnosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("bookings")
    .select("id,starts_at,ends_at,status,source,price,courts(name),establishments(name,cancel_hours_before)")
    .eq("user_id", user.id)
    .order("starts_at", { ascending: false });

  const bookings = (data ?? []) as Row[];
  // eslint-disable-next-line react-hooks/purity -- fecha actual legítima, no hay cache de componentes
  const now = Date.now();

  const upcoming = bookings.filter((b) => b.status === "confirmed" && new Date(b.starts_at).getTime() > now);
  const history = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold">Mis turnos</h1>

      <Tabs defaultValue="proximos">
        <TabsList className="w-full">
          <TabsTrigger value="proximos" className="flex-1">
            Próximos
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex-1">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proximos" className="flex flex-col gap-3">
          {upcoming.map((b) => {
            const cutoffMs = (b.establishments?.cancel_hours_before ?? 0) * 60 * 60 * 1000;
            const canCancel = new Date(b.starts_at).getTime() - cutoffMs > now;
            return <BookingCard key={b.id} booking={b} showCancel={canCancel} />;
          })}
          {upcoming.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No tenés turnos próximos.</p>
          )}
        </TabsContent>

        <TabsContent value="historial" className="flex flex-col gap-3">
          {history.map((b) => (
            <BookingCard key={b.id} booking={b} showCancel={false} />
          ))}
          {history.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Todavía no tenés historial.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
