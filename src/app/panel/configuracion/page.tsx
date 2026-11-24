import { getActiveEstablishment } from "@/lib/panel/establishment";
import { updateEstablishmentProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment) return null;
  const canEdit = role === "owner";

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h2 className="text-base font-semibold">Configuración</h2>

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
      {!canEdit && (
        <Alert>
          <AlertDescription>Solo el dueño puede editar esta sección.</AlertDescription>
        </Alert>
      )}

      <fieldset disabled={!canEdit} className="flex flex-col gap-3">
        <form action={updateEstablishmentProfile} className="flex flex-col gap-3">
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
            <Label htmlFor="cancel_hours_before">Cancelación hasta (horas antes del turno)</Label>
            <Input
              id="cancel_hours_before"
              name="cancel_hours_before"
              type="number"
              min={0}
              defaultValue={establishment.cancel_hours_before}
            />
          </div>
          {canEdit && (
            <Button type="submit" className="mt-1 w-full">
              Guardar
            </Button>
          )}
        </form>
      </fieldset>
    </div>
  );
}
