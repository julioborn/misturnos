import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEstablishment, toggleActive, uploadEstablishmentPhotoAdmin } from "../actions";
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
    .select("id,name,slug,description,address,phone,cancel_hours_before,active,photos")
    .eq("id", id)
    .single();

  if (!establishment) notFound();

  const updateWithId = updateEstablishment.bind(null, establishment.id);
  const toggleWithId = toggleActive.bind(null, establishment.id, !establishment.active);
  const uploadPhotoWithId = uploadEstablishmentPhotoAdmin.bind(null, establishment.id);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{establishment.name}</h2>
        <Badge
          variant={establishment.active ? "default" : "destructive"}
          className={establishment.active ? "bg-green-600/10 text-green-600 dark:bg-green-600/20" : undefined}
        >
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
        <CardContent className="flex flex-col gap-2">
          <Label>Foto principal</Label>
          <p className="text-xs text-muted-foreground">
            Es la foto que ven los jugadores en la lista de establecimientos. JPG, PNG o WEBP, hasta 5 MB.
          </p>
          {establishment.photos?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={establishment.photos[0]}
              alt="Foto principal del establecimiento"
              className="h-32 w-full rounded-lg object-cover sm:w-48"
            />
          )}
          <form action={uploadPhotoWithId} className="flex items-center gap-2">
            <Input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required />
            <Button type="submit" variant="outline">
              Subir
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form action={updateWithId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={establishment.name} required />
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
