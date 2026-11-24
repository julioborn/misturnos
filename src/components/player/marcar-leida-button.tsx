"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markNotificationReadAction } from "@/app/(player)/actions";

export function MarcarLeidaButton({ notificationId }: { notificationId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await markNotificationReadAction(notificationId);
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleClick} disabled={isPending}>
      Marcar leída
    </Button>
  );
}
