"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBookingAction } from "@/app/(player)/actions";

export function ReservarDialog({
  courtId,
  courtName,
  startsAt,
  startLabel,
  endLabel,
  price,
}: {
  courtId: string;
  courtName: string;
  startsAt: string;
  startLabel: string;
  endLabel: string;
  price: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      const { error } = await createBookingAction(courtId, startsAt);
      if (error) {
        toast.error(error);
      } else {
        toast.success("¡Turno reservado!");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-11 px-5 text-base" />}>Reservar</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">Confirmar reserva</DialogTitle>
          <DialogDescription className="text-base">
            {courtName} · {startLabel} – {endLabel} · ${price}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="h-11 text-base" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button className="h-11 text-base" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Reservando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
