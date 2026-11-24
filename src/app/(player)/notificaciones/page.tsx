import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MarcarLeidaButton } from "@/components/player/marcar-leida-button";

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id,title,body,read_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold">Notificaciones</h1>

      <div className="flex flex-col gap-3">
        {(notifications ?? []).map((n) => (
          <Card key={n.id} className={n.read_at ? "opacity-60" : undefined}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{n.title}</span>
                <span className="text-sm text-muted-foreground">{n.body}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba" })}
                </span>
              </div>
              {!n.read_at && <MarcarLeidaButton notificationId={n.id} />}
            </CardContent>
          </Card>
        ))}

        {(notifications ?? []).length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No tenés notificaciones.</p>
        )}
      </div>
    </div>
  );
}
