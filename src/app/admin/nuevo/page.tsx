import { createEstablishment } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function NuevoEstablecimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h2 className="text-base font-semibold">Nuevo establecimiento</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={createEstablishment} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Establecimiento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Padel Club Río" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="padel-club-rio"
                required
                pattern="[a-z0-9-]+"
                title="Solo minúsculas, números y guiones"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Dirección (opcional)</Label>
              <Input id="address" name="address" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cancel_hours_before">Cancelación hasta (horas antes)</Label>
              <Input id="cancel_hours_before" name="cancel_hours_before" type="number" min={0} defaultValue={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dueño</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_full_name">Nombre y apellido</Label>
              <Input id="owner_full_name" name="owner_full_name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_dni">DNI (para entrar)</Label>
              <Input
                id="owner_dni"
                name="owner_dni"
                inputMode="numeric"
                placeholder="Sin puntos"
                required
                pattern="\d{7,8}"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_phone">Teléfono (opcional)</Label>
              <Input id="owner_phone" name="owner_phone" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_email">Email</Label>
              <Input id="owner_email" name="owner_email" type="email" required />
            </div>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner_password">Contraseña</Label>
              <Input id="owner_password" name="owner_password" type="text" required minLength={6} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">
          Crear
        </Button>
      </form>
    </div>
  );
}
