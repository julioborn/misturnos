"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelBookingAction } from "@/app/(player)/actions";

export function CancelarButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    startTransition(async () => {
      const { error } = await cancelBookingAction(bookingId);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Turno cancelado");
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" className="h-11 px-4 text-base text-destructive" />}>
        Cancelar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">¿Cancelar el turno?</AlertDialogTitle>
          <AlertDialogDescription className="text-base">No vas a poder deshacer esto.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 text-base" disabled={isPending}>Volver</AlertDialogCancel>
          <AlertDialogAction className="h-11 text-base" onClick={handleCancel} disabled={isPending}>
            {isPending ? "Cancelando..." : "Sí, cancelar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
