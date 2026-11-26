import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Establecimientos</h2>
        <Button size="sm" render={<Link href="/admin/nuevo" />}>
          <Plus className="size-4" />
          Nuevo
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {(establishments ?? []).map((est) => {
          const owner = ownerByEstablishment.get(est.id);
          const toggle = toggleActive.bind(null, est.id, !est.active);
          return (
            <Card key={est.id} className="flex-row items-center justify-between gap-3 px-4 py-3">
              <Link href={`/admin/${est.id}`} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col">
                  <span className="font-medium">{est.name}</span>
                  <span className="text-xs text-muted-foreground">
                    /{est.slug} · {owner?.name || owner?.email || "sin dueño"}
                  </span>
                </div>
                <ChevronRight className="ml-auto size-4 text-muted-foreground" />
              </Link>
              <div className="flex items-center gap-2">
                <Badge
                  variant={est.active ? "default" : "destructive"}
                  className={est.active ? "bg-green-600/10 text-green-600 dark:bg-green-600/20" : undefined}
                >
                  {est.active ? "Activo" : "Suspendido"}
                </Badge>
                <form action={toggle}>
                  <Button type="submit" variant="outline" size="sm">
                    {est.active ? "Suspender" : "Activar"}
                  </Button>
                </form>
              </div>
            </Card>
          );
        })}

        {(establishments ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Todavía no hay establecimientos.
          </p>
        )}
      </div>
    </div>
  );
}
