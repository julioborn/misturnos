import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveEstablishment } from "@/lib/panel/establishment";
import {
  updateCourt,
  toggleCourtActive,
  addCourtHour,
  removeCourtHour,
  addCourtPrice,
  removeCourtPrice,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function EditCourtPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const { establishment, role } = await getActiveEstablishment();
  if (!establishment) notFound();
  const canEdit = role === "owner";

  const supabase = await createClient();

  const { data: court } = await supabase
    .from("courts")
    .select("id,name,sport,variant,slot_minutes,default_price,active,establishment_id")
    .eq("id", id)
    .single();

  if (!court || court.establishment_id !== establishment.id) notFound();

  const { data: hours } = await supabase
    .from("court_hours")
    .select("id,weekday,open_time,close_time")
    .eq("court_id", id)
    .order("weekday");

  const { data: prices } = await supabase
    .from("court_prices")
    .select("id,weekday,from_time,to_time,price")
    .eq("court_id", id)
    .order("weekday");

  const updateWithId = updateCourt.bind(null, court.id);
  const toggleWithId = toggleCourtActive.bind(null, court.id, !court.active);
  const addHourWithId = addCourtHour.bind(null, court.id);
  const addPriceWithId = addCourtPrice.bind(null, court.id);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{court.name}</h2>
          <Badge variant={court.active ? "default" : "secondary"}>
            {court.active ? "Activa" : "Inactiva"}
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {ok && (
          <Alert className="mb-3">
            <AlertDescription>Guardado</AlertDescription>
          </Alert>
        )}

        {canEdit && (
          <>
            <form action={toggleWithId} className="mb-3">
              <Button type="submit" variant="outline" className="w-full">
                {court.active ? "Desactivar cancha" : "Activar cancha"}
              </Button>
            </form>

            <Card>
              <CardContent>
                <form action={updateWithId} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" defaultValue={court.name} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sport">Deporte</Label>
                    <NativeSelect id="sport" name="sport" defaultValue={court.sport}>
                      <option value="padel">Pádel</option>
                      <option value="futbol">Fútbol</option>
                    </NativeSelect>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="variant">Variante (opcional)</Label>
                    <Input id="variant" name="variant" defaultValue={court.variant ?? ""} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="slot_minutes">Duración del turno (minutos)</Label>
                    <Input
                      id="slot_minutes"
                      name="slot_minutes"
                      type="number"
                      min={15}
                      max={480}
                      defaultValue={court.slot_minutes}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="default_price">Precio por defecto</Label>
                    <Input
                      id="default_price"
                      name="default_price"
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={court.default_price}
                    />
                  </div>
                  <Button type="submit" className="mt-1 w-full">
                    Guardar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Horarios</h3>
        <div className="mb-3 flex flex-col gap-1">
          {(hours ?? []).map((h) => {
            const removeWithIds = removeCourtHour.bind(null, court.id, h.id);
            return (
              <Card key={h.id} className="flex-row items-center justify-between gap-3 px-3 py-2 text-sm">
                <span>
                  {WEEKDAYS[h.weekday]}: {h.open_time.slice(0, 5)} – {h.close_time.slice(0, 5)}
                </span>
                {canEdit && (
                  <form action={removeWithIds}>
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Quitar
                    </Button>
                  </form>
                )}
              </Card>
            );
          })}
          {(hours ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">
              Sin horarios cargados — la cancha no va a tener turnos disponibles.
            </p>
          )}
        </div>
        {canEdit && (
          <form action={addHourWithId} className="flex flex-wrap items-end gap-2">
            <NativeSelect name="weekday" required className="w-auto">
              {WEEKDAYS.map((w, i) => (
                <option key={i} value={i}>{w}</option>
              ))}
            </NativeSelect>
            <Input type="time" name="open_time" required className="w-auto" />
            <Input type="time" name="close_time" required className="w-auto" />
            <Button type="submit" variant="outline" size="sm">
              Agregar
            </Button>
          </form>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-muted-foreground">Precios por franja</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Si no cargás ninguno, se usa el precio por defecto de la cancha.
        </p>
        <div className="mb-3 flex flex-col gap-1">
          {(prices ?? []).map((p) => {
            const removeWithIds = removeCourtPrice.bind(null, court.id, p.id);
            return (
              <Card key={p.id} className="flex-row items-center justify-between gap-3 px-3 py-2 text-sm">
                <span>
                  {p.weekday === null ? "Todos los días" : WEEKDAYS[p.weekday]}: {p.from_time.slice(0, 5)} – {p.to_time.slice(0, 5)} · ${p.price}
                </span>
                {canEdit && (
                  <form action={removeWithIds}>
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Quitar
                    </Button>
                  </form>
                )}
              </Card>
            );
          })}
          {(prices ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">Sin franjas de precio cargadas.</p>
          )}
        </div>
        {canEdit && (
          <form action={addPriceWithId} className="flex flex-wrap items-end gap-2">
            <NativeSelect name="weekday" className="w-auto">
              <option value="">Todos los días</option>
              {WEEKDAYS.map((w, i) => (
                <option key={i} value={i}>{w}</option>
              ))}
            </NativeSelect>
            <Input type="time" name="from_time" required className="w-auto" />
            <Input type="time" name="to_time" required className="w-auto" />
            <Input type="number" name="price" min={0} step="0.01" placeholder="Precio" required className="w-24" />
            <Button type="submit" variant="outline" size="sm">
              Agregar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
