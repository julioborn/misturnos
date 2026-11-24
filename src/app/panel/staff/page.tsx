import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { createStaffMember, removeStaffMember } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
              <Card key={id} className="flex-row items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm">
                  {info?.name ?? "Staff"}{info?.phone ? ` · ${info.phone}` : ""}
                </span>
                <form action={removeWithId}>
                  <Button type="submit" variant="outline" size="sm" className="text-destructive">
                    Quitar
                  </Button>
                </form>
              </Card>
            );
          })}
          {staffIds.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no sumaste staff.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Agregar staff</h3>
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form action={createStaffMember} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Nombre y apellido</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dni">DNI (para entrar)</Label>
            <Input id="dni" name="dni" inputMode="numeric" placeholder="Sin puntos" required pattern="\d{7,8}" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input id="phone" name="phone" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="text" required minLength={6} />
          </div>
          <Button type="submit" className="mt-1 w-full">
            Agregar
          </Button>
        </form>
      </div>
    </div>
  );
}
