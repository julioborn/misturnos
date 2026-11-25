"use client";

import { useTransition } from "react";
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
import { deleteAccountAction } from "@/app/(player)/actions";

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" className="h-11 text-base text-destructive" />}>
        Eliminar mi cuenta
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">¿Eliminar tu cuenta?</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Se borran tu perfil, tus datos personales y las notificaciones. No vas a poder
            deshacer esto ni volver a entrar con esta cuenta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 text-base" disabled={isPending}>Volver</AlertDialogCancel>
          <AlertDialogAction className="h-11 text-base" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Eliminando..." : "Sí, eliminar mi cuenta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
