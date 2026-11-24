import { redirect } from "next/navigation";
import { utcToLocal } from "@/lib/time/argentina";
import { createManualBooking, blockSlot } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{
    court?: string;
    starts_at?: string;
    ends_at?: string;
    price?: string;
    mode?: string;
    error?: string;
  }>;
}) {
  const { court, starts_at, ends_at, price, mode, error } = await searchParams;
  if (!court || !starts_at || !ends_at) redirect("/panel");

  const isBlock = mode === "block";
  const { date, time } = utcToLocal(new Date(starts_at));
  const endTime = utcToLocal(new Date(ends_at)).time;

  const action = isBlock
    ? blockSlot.bind(null, court, starts_at, ends_at)
    : createManualBooking.bind(null, court, starts_at, ends_at, Number(price ?? 0));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h2 className="text-base font-semibold">
        {isBlock ? "Bloquear horario" : "Reserva manual"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {date} · {time} – {endTime}
        {!isBlock && price ? ` · $${price}` : ""}
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="flex flex-col gap-3">
        {!isBlock && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest_name">Nombre</Label>
              <Input id="guest_name" name="guest_name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guest_phone">Teléfono (opcional)</Label>
              <Input id="guest_phone" name="guest_phone" />
            </div>
          </>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note">Nota (opcional)</Label>
          <Input id="note" name="note" />
        </div>
        <Button type="submit" className="mt-1 w-full">
          {isBlock ? "Bloquear" : "Reservar"}
        </Button>
      </form>
    </div>
  );
}
