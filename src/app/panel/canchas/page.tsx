import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Canchas</h2>
        {role === "owner" && (
          <Button size="sm" render={<Link href="/panel/canchas/nueva" />}>
            <Plus className="size-4" />
            Nueva
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {(courts ?? []).map((c) => (
          <Link key={c.id} href={`/panel/canchas/${c.id}`}>
            <Card className="flex-row items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.sport === "padel" ? "Pádel" : "Fútbol"}
                  {c.variant ? ` · ${c.variant}` : ""} · {c.slot_minutes} min · ${c.default_price}
                </span>
              </div>
              <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Activa" : "Inactiva"}</Badge>
            </Card>
          </Link>
        ))}

        {(courts ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Todavía no cargaste canchas.</p>
        )}
      </div>
    </div>
  );
}
