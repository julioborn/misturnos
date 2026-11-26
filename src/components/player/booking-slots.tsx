"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createBookingAction } from "@/app/(player)/actions";

export type BookingSlot = {
  startsAt: string;
  startTime: string;
  endTime: string;
  price: string;
  isFree: boolean;
};

export function BookingSlots({
  courtId,
  courtName,
  sportBadge,
  dateLabel,
  slots,
  isLoading = false,
}: {
  courtId: string;
  courtName: string;
  sportBadge: string;
  dateLabel: string;
  slots: BookingSlot[];
  isLoading?: boolean;
}) {
  const [selected, setSelected] = useState<BookingSlot | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const visibleSlots = onlyAvailable ? slots.filter((s) => s.isFree) : slots;

  function handleSelect(slot: BookingSlot) {
    if (!slot.isFree) return;
    setSelected((prev) => (prev?.startsAt === slot.startsAt ? null : slot));
  }

  function handleConfirm() {
    if (!selected) return;
    startTransition(async () => {
      const { error } = await createBookingAction(courtId, selected.startsAt);
      if (error) {
        toast.error(error);
      } else {
        toast.success("¡Turno reservado!");
        setSheetOpen(false);
        setSelected(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 pb-28">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-wide text-[#636366] uppercase">Horarios</span>
        <label className="flex touch-manipulation items-center gap-2 text-[13px] text-[#636366]">
          Solo disponibles
          <Switch checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
        </label>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-[64px] rounded-xl bg-[#E5E5EA]" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-2">
        {visibleSlots.map((slot) => {
          const isSelected = selected?.startsAt === slot.startsAt;
          return (
            <button
              key={slot.startsAt}
              type="button"
              disabled={!slot.isFree}
              onClick={() => handleSelect(slot)}
              className={cn(
                "flex min-h-[56px] touch-manipulation items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all duration-100 ease-out",
                isSelected
                  ? "border-[#111111] bg-[#111111] text-white active:scale-[0.97]"
                  : slot.isFree
                    ? "border-[#E5E5EA] bg-white text-[#111111] active:scale-[0.97] active:bg-[#F2F2F7]"
                    : "border-transparent bg-[#F2F2F7] text-[#9a9a9e]",
              )}
            >
              <span className="text-[16px] font-semibold [font-variant-numeric:tabular-nums]">
                {slot.startTime}
              </span>
              {isSelected && <Check className="size-4 shrink-0" />}
            </button>
          );
        })}
      </div>
      )}

      {!isLoading && slots.length === 0 && (
        <p className="py-10 text-center text-[14px] text-[#636366]">
          No hay horarios cargados para este día.
        </p>
      )}
      {!isLoading && slots.length > 0 && visibleSlots.length === 0 && (
        <p className="py-10 text-center text-[14px] text-[#636366]">
          No hay horarios disponibles para este día.
        </p>
      )}

      {selected && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[#E5E5EA] bg-white/95 px-4 py-3 backdrop-blur [html[data-platform='ios']_&]:pb-[env(safe-area-inset-bottom)] sm:static sm:bottom-auto sm:mt-2 sm:rounded-xl sm:border sm:bg-white sm:px-4 sm:py-3 sm:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarIcon className="size-4 shrink-0 text-[#636366]" />
              <div className="flex min-w-0 flex-col">
                <span className="text-[14px] font-semibold text-[#111111]">{courtName}</span>
                <span className="truncate text-[13px] text-[#636366]">
                  {dateLabel} · {selected.startTime} – {selected.endTime} hs
                </span>
              </div>
            </div>
            <span className="shrink-0 text-[16px] font-semibold text-[#111111] [font-variant-numeric:tabular-nums]">
              ${selected.price}
            </span>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button className="mt-3 h-[52px] w-full rounded-xl bg-[#111111] text-[16px] font-semibold text-white hover:bg-[#111111]/90" />
              }
            >
              Confirmar reserva
            </SheetTrigger>
            <SheetContent side="bottom" className="mx-auto w-full max-w-2xl rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="text-[18px]">Confirmar reserva</SheetTitle>
                <SheetDescription className="text-[14px]">
                  {courtName} · {sportBadge}
                  <br />
                  {dateLabel} · {selected.startTime} – {selected.endTime}
                  <br />${selected.price}
                </SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <Button
                  className="h-[52px] w-full rounded-xl bg-[#111111] text-[16px] font-semibold text-white hover:bg-[#111111]/90"
                  onClick={handleConfirm}
                  disabled={isPending}
                >
                  {isPending ? "Reservando..." : "Confirmar"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}
