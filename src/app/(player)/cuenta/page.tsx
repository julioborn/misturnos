import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountButton } from "@/components/player/delete-account-button";

export default async function CuentaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, dni, phone, email, is_super_admin")
    .eq("id", user.id)
    .single();

  const { data: membership } = await supabase
    .from("establishment_members")
    .select("establishment_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const canSelfDelete = !profile?.is_super_admin && !membership;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Cuenta</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tus datos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Nombre</span>
            <span className="text-right">{profile?.full_name ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="text-right">{profile?.email ?? user.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">DNI</span>
            <span className="text-right">{profile?.dni ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Teléfono</span>
            <span className="text-right">{profile?.phone ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eliminar cuenta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">
            Podés eliminar tu cuenta y tus datos personales en cualquier momento. Más detalles en{" "}
            <Link className="underline" href="/legal/eliminar-cuenta">
              Eliminar cuenta y datos
            </Link>
            .
          </p>
          {canSelfDelete ? (
            <DeleteAccountButton />
          ) : (
            <p className="text-muted-foreground">
              Tu cuenta administra un establecimiento. Para eliminarla, escribinos a{" "}
              <a className="underline" href="mailto:julio@estudioborn.com.ar">
                julio@estudioborn.com.ar
              </a>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
