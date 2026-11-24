"use client";

import { useRouter } from "next/navigation";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDaysLocal, todayLocal } from "@/lib/time/argentina";

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
  const isToday = date === todayLocal();

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex items-center justify-between gap-2">
      <Button variant="outline" size="icon" className="size-11" disabled={isToday} onClick={() => go(addDaysLocal(date, -1))}>
        <ChevronLeft className="size-5" />
      </Button>

      <Popover>
        <PopoverTrigger
          render={<Button variant="outline" className="h-11 flex-1 justify-center gap-2 text-base capitalize" />}
        >
          <CalendarIcon className="size-5" />
          {label}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            locale={es}
            selected={new Date(`${date}T00:00:00`)}
            onSelect={(d) => d && go(dateKeyFromLocalDate(d))}
            disabled={{ before: today }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="icon" className="size-11" onClick={() => go(addDaysLocal(date, 1))}>
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
