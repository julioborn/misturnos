import { redirect } from "next/navigation";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import { createCourt } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function NuevaCanchaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { role } = await getActiveEstablishment();
  if (role !== "owner") redirect("/panel/canchas");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h2 className="text-lg font-bold">Nueva cancha</h2>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      )}

      <form action={createCourt} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-base">Nombre</Label>
          <Input id="name" name="name" placeholder="Cancha 1" required className="h-12 text-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sport" className="text-base">Deporte</Label>
          <NativeSelect id="sport" name="sport" className="h-12 text-base">
            <option value="padel">Pádel</option>
            <option value="futbol">Fútbol</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="variant" className="text-base">Variante (opcional)</Label>
          <Input id="variant" name="variant" placeholder="F5, techada, etc." className="h-12 text-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slot_minutes" className="text-base">Duración del turno (minutos)</Label>
          <Input
            id="slot_minutes"
            name="slot_minutes"
            type="number"
            min={15}
            max={480}
            defaultValue={90}
            className="h-12 text-base"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="default_price" className="text-base">Precio por defecto</Label>
          <Input
            id="default_price"
            name="default_price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={0}
            className="h-12 text-base"
          />
        </div>
        <Button type="submit" className="mt-1 h-12 w-full text-base">
          Crear
        </Button>
      </form>
    </div>
  );
}
