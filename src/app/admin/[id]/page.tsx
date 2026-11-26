import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEstablishment, toggleActive } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function EditEstablishmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;

  const supabase = await createClient();
  const { data: establishment } = await supabase
    .from("establishments")
    .select("id,name,slug,description,address,phone,cancel_hours_before,active")
    .eq("id", id)
    .single();

  if (!establishment) notFound();

  const updateWithId = updateEstablishment.bind(null, establishment.id);
  const toggleWithId = toggleActive.bind(null, establishment.id, !establishment.active);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{establishment.name}</h2>
        <Badge variant={establishment.active ? "default" : "secondary"}>
          {establishment.active ? "Activo" : "Suspendido"}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {ok && (
        <Alert>
          <AlertDescription>Guardado</AlertDescription>
        </Alert>
      )}

      <form action={toggleWithId}>
        <Button type="submit" variant="outline" className="w-full">
          {establishment.active ? "Suspender establecimiento" : "Activar establecimiento"}
        </Button>
      </form>

      <Card>
        <CardContent>
          <form action={updateWithId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={establishment.name} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Identificador de URL</Label>
              <Input id="slug" name="slug" defaultValue={establishment.slug} required pattern="[a-z0-9-]+" />
              <p className="text-xs text-muted-foreground">
                Así queda la dirección del establecimiento: misturnosdeportivos.vercel.app/establecimientos/<strong>{establishment.slug}</strong>.
                Solo minúsculas, números y guiones, sin espacios ni tildes.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" defaultValue={establishment.description ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" defaultValue={establishment.address ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={establishment.phone ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cancel_hours_before">Cancelación hasta (horas antes)</Label>
              <Input
                id="cancel_hours_before"
                name="cancel_hours_before"
                type="number"
                min={0}
                defaultValue={establishment.cancel_hours_before}
              />
            </div>
            <Button type="submit" className="mt-1 w-full">
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
