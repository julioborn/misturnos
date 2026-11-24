"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDaysLocal } from "@/lib/time/argentina";

export function DatePickerNav({
  courtId,
  date,
  label,
}: {
  courtId: string;
  date: string;
  label: string;
}) {
  const router = useRouter();

  function go(newDate: string) {
    router.push(`?court=${courtId}&date=${newDate}`);
  }

  // Ojo: no usar toISOString() acá — es UTC y puede desfasar un día según
  // el huso horario del navegador. El Calendar trabaja en hora local del
  // dispositivo, así que leemos los componentes de fecha también en local.
  function dateKeyFromLocalDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="outline" size="icon" onClick={() => go(addDaysLocal(date, -1))}>
        <ChevronLeft className="size-4" />
      </Button>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" className="flex-1 justify-center gap-2 capitalize" />}>
          <CalendarIcon className="size-4" />
          {label}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={new Date(`${date}T00:00:00`)}
            onSelect={(d) => d && go(dateKeyFromLocalDate(d))}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" onClick={() => go(addDaysLocal(date, 1))}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
